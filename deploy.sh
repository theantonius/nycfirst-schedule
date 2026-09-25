#!/usr/bin/env bash
# Commit, push, publish to Cloudflare Pages, then prove the new file is live.
# Usage:  ./deploy.sh "what changed"
set -euo pipefail

PROJECT="nycfirst-schedule"
HOST="https://schedule.nycfirst.org"
BUILD=".cfbuild"
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
  git add schedule.css schedule.js README.md RELEASE_NOTES.md docs deploy.sh .gitignore package.json package-lock.json
  git commit -m "$MSG"
else
  echo "No local changes — publishing anyway."
fi

git push

# Publish only the two files, never the repo.
rm -rf "$BUILD"
mkdir -p "$BUILD"
cp "${FILES[@]}" "$BUILD/"
npx wrangler pages deploy "$BUILD" --project-name "$PROJECT" --commit-dirty=true

sleep 4

fail=0
for f in "${FILES[@]}"; do
  live=$(curl -fsS "${HOST}/${f}" | wc -c | tr -d ' ')
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
  echo "Cloudflare is still serving an old copy. Wait a minute and run ./deploy.sh again."
  echo "Nothing is broken — the push already succeeded."
else
  echo
  echo "Live. Hard-refresh the page to see it."
fi
