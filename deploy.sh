#!/usr/bin/env bash
# Commit, push, purge the CDN, then prove the new file is actually being served.
# Usage:  ./deploy.sh "what changed"
set -euo pipefail

REPO="theantonius/nycfirst-schedule"
FILES=(schedule.css schedule.js)
MSG="${1:-Update schedule files}"

cd "$(dirname "$0")"

# Stamp the build date into both files so a page can report its own version.
STAMP="$(date '+%Y-%m-%d %H:%M')"
# GNU sed wants -i with no argument, BSD/macOS sed wants -i ''. Pick at runtime
# so this script works from a Mac terminal and from a Linux shell alike.
sedi() { if sed --version >/dev/null 2>&1; then sed -i "$@"; else sed -i '' "$@"; fi; }
sedi -E "s|^var SCHEDULE_BUILD = '.*';|var SCHEDULE_BUILD = '${STAMP}';|" schedule.js
sedi -E "s|^/\* schedule build: .* \*/|/* schedule build: ${STAMP} */|" schedule.css
echo "stamped build ${STAMP}"

if [[ -n "$(git status --porcelain)" ]]; then
  git add -A
  git commit -m "$MSG"
else
  echo "No local changes — purging and verifying anyway."
fi

git push

# jsDelivr needs a moment to notice the new commit before a purge does any good.
echo "waiting for jsDelivr to see the commit..."
sleep 6

for f in "${FILES[@]}"; do
  curl -fsS "https://purge.jsdelivr.net/gh/${REPO}@main/${f}" >/dev/null && echo "purged  $f"
done

sleep 4

fail=0
for f in "${FILES[@]}"; do
  live=$(curl -fsS "https://cdn.jsdelivr.net/gh/${REPO}@main/${f}" | wc -c | tr -d ' ')
  mine=$(wc -c < "$f" | tr -d ' ')
  if [[ "$live" == "$mine" ]]; then
    echo "OK      $f  ($live bytes live)"
  else
    echo "STALE   $f  — live $live bytes, local $mine bytes"
    fail=1
  fi
done

if [[ "$fail" == "1" ]]; then
  echo
  echo "The CDN is still serving an old copy. Wait a minute and run ./deploy.sh again."
  echo "Nothing is broken — the push already succeeded."
else
  echo
  echo "Live. Hard-refresh the page to see it."
fi
