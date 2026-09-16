# nycfirst-schedule

Front-end code for the STEM Center hours and schedule blocks on the NYC FIRST website.

## Quick start

1. Edit `schedule.js` or `schedule.css`.
2. Run:

   ```bash
   ./deploy.sh "what changed"
   ```

3. The script checks for you that jsDelivr is serving the new version.
4. If it reports `STALE`, wait about a minute and run it again.

The website loads the files through jsDelivr. There is nothing to upload or paste into Webflow.

## Files

| File           | Loaded           | What it does                                            |
| -------------- | ---------------- | ------------------------------------------------------- |
| `schedule.css` | in `<head>`      | Styles both schedule blocks.                            |
| `schedule.js`  | before `</body>` | Turns the CMS markup into the layout shown on the site. |

## What the script does

**Today's hours.** Each STEM Center shows whether it is open, closed, or running alternate hours. The script reads the center's weekly schedule, checks for any closure or alternate-hours notice for that day, and writes a status such as:

`Open until 6:00 pm`

or

`Closed today · Open 3:00 pm – 7:00 pm Monday`

All times use `America/New_York`.

**Upcoming.** Events, closures, and schedule changes are grouped by month and shown with a colored stripe: blue for events, red for closures, and amber for alternate hours.

Dates are formatted into one readable line, including multi-day events. Registration links only appear when one has been added.

Both blocks work from markup Webflow has already rendered on the page. The script does not make API calls or connect to internal systems.

## Public repo

**This repository has to stay public.** jsDelivr only mirrors public repositories, so making it private takes the CSS and JS offline and the site renders unstyled with no announcements.

It can stay public because the code only works with content already rendered on the public website. It does not connect directly to Monday.com, n8n, Webflow APIs, or other internal services.

> **Never commit a key, token, password, webhook URL, or internal endpoint to this repository.**

If a secret is committed, deleting it in a later commit is **not** enough. It remains in the Git history.

Rotate the credential immediately. Scrubbing it from the history means rewriting every commit after it and force-pushing, so treat the rotation as the real fix. Anything that requires credentials belongs in n8n's credential store, never here.

## Editing and deploying

Make your changes, then run:

```bash
./deploy.sh "what changed"
```

The script commits and pushes the changes, clears the CDN cache, and checks that jsDelivr is serving the new version.

If it reports `STALE`, the Git push still succeeded. Wait about a minute and run it again.

## Notes

* Vanilla JavaScript
* No build step
* No dependencies
* If the expected markup is not on the page, the script exits without throwing an error
