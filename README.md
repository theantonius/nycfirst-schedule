# nycfirst-schedule

Front-end code for the STEM Center hours, schedule changes and events shown on [nycfirst.org](https://www.nycfirst.org).

This repository is one part of the NYC FIRST STEM Center Schedule System. It contains the browser-side presentation layer — `schedule.js` and `schedule.css` — and the tooling that deploys them. It is **not** the whole system:

- The n8n workflows that sync and publish data are maintained separately, in n8n.
- The Monday.com boards and their configuration are maintained separately, in Monday.com.
- No credentials are stored here.

The two files are served from **schedule.nycfirst.org** (Cloudflare Pages).

## System architecture

```
Monday.com
    ↓
n8n
    ↓
Webflow CMS + Google Calendar
    ↓
nycfirst.org  ←  schedule.js / schedule.css (this repository)
```

| Layer             | Responsibility                                                                                                |
| ----------------- | ------------------------------------------------------------------------------------------------------------- |
| Monday.com        | Where staff manage hours, closures, alternate hours, events, venues, tags and calendar settings.             |
| n8n               | Syncs Monday.com to Webflow and Google Calendar, and serves a public read-only closures feed.                 |
| Webflow           | The website: CMS collections, pages and layout. Renders the raw data this code reads.                        |
| Google Calendar   | A shared calendar for all events, plus one calendar per STEM Center.                                         |
| nycfirst-schedule | Turns what Webflow renders into Today's Hours, Upcoming, the events-page filters and the subscribe links.    |
| Cloudflare Pages  | Hosts `schedule.js` and `schedule.css` at schedule.nycfirst.org.                                              |

## System documentation

- [Architecture](docs/architecture.md): layers, design decisions, roles, evolution
- [Workflows](docs/workflows.md): each n8n workflow, plus legacy and maintenance workflows
- [Monday.com data model](docs/monday-data-model.md): forms, boards, columns, publish status
- [Reliability](docs/reliability.md): what is in place, the Sept 24 incident, planned work

## What this front-end code does

**Today's Hours.** One card per STEM Center, with a status such as:

`Open until 6:00 pm`

`Closed today · Open 3:00 pm – 7:00 pm Monday`

- Shows open, closed, alternate hours, or a label such as "by appointment" for days without set hours.
- Uses each center's weekly hours to find the next opening time when a center is closed.
- Applies closures and alternate hours, including multi-day closures, to every day they cover.
- Links each card to that center's page.
- Uses `America/New_York` for all times.

**Where Today's Hours gets its data.** Weekly hours come from markup Webflow has already rendered on the page. Closures and alternate hours come from a public, read-only n8n feed, so a Webflow display or filter setting cannot hide a closure. If the feed cannot be reached, the script falls back to the schedule rows on the page.

This is the only network request the script makes. The request carries no credentials, and the repository holds no Monday.com, Webflow, Google Calendar or n8n credentials. Every authenticated operation stays inside n8n.

**Upcoming.** Events, closures and alternate hours, grouped by month:

- Each item has a colored stripe. Events use their program color; several programs show as equal color bands; events with no program show blue. Closures are red, alternate hours amber.
- Dates are combined into one readable line, including multi-day items. Items that have already ended are hidden.
- Descriptions open and close with Read more.
- Off-site events show the venue name, address and map link.
- Registration links appear only when one is set.
- Program tags show their short code, with the full name on hover. Tag names and colors come from the Monday.com Tags board by way of the page, so a new program needs no code change.

**Events page.** A dedicated events and calendar page uses the same Upcoming list with a filter bar:

- Filter by update type (All updates, Events, Closures), by location, and by program.
- Choosing a program switches the view to Events. Choosing All updates or Closures clears the program.
- The current filters are kept in the page URL, so a filtered view can be shared or bookmarked.

**Calendar subscription.** The events page offers the shared events calendar for Google Calendar, Apple Calendar or Outlook.

**Build stamp.** Each deploy writes its date into both files. The browser console shows `[schedule] build <date>`, so you can tell which version a page is running.

## What the larger system supports

These features are part of the launch but are handled by Monday.com, n8n or Webflow, not by this code:

- Tags and venues managed on their own Monday.com boards, with new entries sent for review.
- Event images copied into Webflow's own storage, and a volunteer-opportunity flag on events.
- A shared Google Calendar for all events, with each STEM Center's calendar and tagged staff invited.
- The upcoming-events list in the site footer (a Webflow collection list).

## Files

| File                | What it is                                                              |
| ------------------- | ----------------------------------------------------------------------- |
| `schedule.css`      | Styles for every schedule block. Loaded in `<head>`.                    |
| `schedule.js`       | Builds the blocks from the CMS markup. Loaded before `</body>`.         |
| `deploy.sh`         | Commits, pushes, publishes to Cloudflare Pages, and checks it is live.  |
| `package.json`      | Pins Wrangler, the Cloudflare tool that uploads the files.              |
| `package-lock.json` | Locks the exact Wrangler version so every deploy uses the same one.     |
| `RELEASE_NOTES.md`  | What changed in each release, written for staff.                        |

## Placing the blocks in Webflow

Load the files on any page that shows a block:

```html
<!-- Page settings → Custom code → Inside <head> -->
<link rel="stylesheet" href="https://schedule.nycfirst.org/schedule.css">

<!-- Page settings → Custom code → Before </body> -->
<script src="https://schedule.nycfirst.org/schedule.js"></script>
```

These classes, added in the Designer, turn on optional behavior:

| Class        | Put it on                        | Effect                                                     |
| ------------ | -------------------------------- | ---------------------------------------------------------- |
| `sc-center`  | The wrapper around a block       | Centers the block in a full-width section.                 |
| `sc-teaser`  | The Upcoming section             | Short list: next 30 days, at most 5 items, no month cards. |
| `sc-filters` | The Upcoming section             | Adds the filter bar and subscribe line (events page).      |
| `sc-panel`   | A column over a photo            | Solid background so the text stays readable.               |

If the expected markup is not on a page, the script exits without an error.

## Setup (once per computer)

```bash
npm install          # installs the pinned Wrangler version from package-lock.json
npx wrangler login   # signs this computer in to Cloudflare
```

## Editing and deploying

Edit `schedule.js` or `schedule.css`, then run:

```bash
./deploy.sh "what changed"
```

The script:

1. Stamps the build date into both files.
2. Commits the project files and pushes to GitHub.
3. Copies only `schedule.css` and `schedule.js` into a temporary `.cfbuild/` folder.
4. Deploys that folder to Cloudflare Pages with Wrangler.
5. Checks that schedule.nycfirst.org is serving the new files.

If it reports `STALE`, the push and upload still succeeded. Wait a minute and run it again. Then hard-refresh the page.

## Security

This repository is public. It contains no keys, tokens or passwords, and it must stay that way.

- Anything that needs credentials belongs in n8n's credential store, never here.
- Public, read-only addresses are fine: the closures feed and the public calendar ID are meant to be seen by browsers.
- If a secret is ever committed, deleting it in a later commit is **not** enough — it stays in the Git history. Rotate the credential immediately; that is the real fix.

## History

Early versions loaded these files through jsDelivr, a CDN that mirrors public GitHub repositories. The site moved to Cloudflare Pages at schedule.nycfirst.org in September 2026 so updates appear immediately instead of waiting on the CDN cache.

## Notes

- Vanilla JavaScript and CSS
- No build step
- No runtime dependencies (Wrangler is only used to deploy)
