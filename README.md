# nycfirst-schedule

Front-end code for the STEM Center hours and schedule blocks on [nycfirst.org](https://www.nycfirst.org).

It is the last step of a larger system:

```
Monday.com  →  n8n  →  Webflow CMS / Google Calendar  →  nycfirst.org
```

Staff enter hours, closures, alternate hours and events in Monday.com. n8n syncs them to the Webflow CMS and Google Calendar. This repository turns what Webflow renders into the blocks visitors see.

The two files are served from **schedule.nycfirst.org** (Cloudflare Pages).

## Files

| File                | What it is                                                              |
| ------------------- | ----------------------------------------------------------------------- |
| `schedule.css`      | Styles for every schedule block. Loaded in `<head>`.                    |
| `schedule.js`       | Builds the blocks from the CMS markup. Loaded before `</body>`.         |
| `deploy.sh`         | Commits, pushes, publishes to Cloudflare Pages, and checks it is live.  |
| `wrangler.jsonc`    | Cloudflare Pages project settings used by the deploy.                   |
| `package.json`      | Pins Wrangler, the Cloudflare tool that uploads the files.              |
| `package-lock.json` | Locks the exact Wrangler version so every deploy uses the same one.     |
| `RELEASE_NOTES.md`  | What changed in each release, written for staff.                        |

## What the script does

**Today's Hours.** Each STEM Center card shows whether the center is open, closed, or running alternate hours:

`Open until 6:00 pm`

`Closed today · Open 3:00 pm – 7:00 pm Monday`

The weekly hours come from the page. Closures and alternate hours come from a public, read-only n8n feed, so a website filter can never hide a closure. If the feed cannot be reached, the script falls back to the rows on the page. Each card links to that center's page. All times use `America/New_York`.

**Upcoming.** Events, closures and alternate hours are grouped by month, each with a colored stripe:

- Events use their program color from the Monday Tags board. Several programs show as bands; no program shows blue.
- Closures are red. Alternate hours are amber.

Dates are combined into one readable line, including multi-day events. Descriptions open with Read more. Off-site events show the venue, address and map link. Registration links appear only when one is set. Tag colors and names come from Monday, so a new program needs no code change.

**Events page filters.** Filter by type (All updates, Events, Closures), by location and by program. Choosing a program switches to Events. Filters are kept in the page link so a filtered view can be shared.

**Subscribe links.** One line offers the events calendar in Google, Apple or Outlook.

**Build stamp.** Each deploy writes its date into both files. The browser console shows `[schedule] build <date>`, so you can tell which version a page is running.

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

Install the pinned version of Wrangler and log in to Cloudflare:

```bash
npm install
npx wrangler login
```

## Editing and deploying

Edit `schedule.js` or `schedule.css`, then run:

```bash
./deploy.sh "what changed"
```

The script:

1. Stamps the build date into both files.
2. Commits and pushes to GitHub.
3. Uploads only `schedule.css` and `schedule.js` to Cloudflare Pages.
4. Checks that schedule.nycfirst.org is serving the new files.

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
