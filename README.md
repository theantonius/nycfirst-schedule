# nycfirst-schedule

Front-end code for the STEM Center hours and schedule blocks on the NYC FIRST
website.

Two files, served over GitHub Pages and loaded by the site:

| File | Loaded | What it does |
|---|---|---|
| `schedule.css` | in `<head>` | Styles both blocks. |
| `schedule.js`  | before `</body>` | Rewrites the CMS output into the finished layout. |

## What the script does

**Today's hours.** Each STEM Center shows whether it is running normal hours,
closed, or on a special schedule right now. It reads the centre's weekly hours,
applies any closure or alternate-hours announcement posted for that day, and
writes a plain-English status line ("Open until 6:00 pm", "Closed today ·
Open 3:00 pm – 7:00 pm Monday"). All times are evaluated in America/New_York
regardless of where the visitor is.

**Upcoming.** Events, closures and schedule changes are grouped into month
cards and rendered as rows with a coloured status stripe — blue for events, red
for closures, amber for alternate hours. Dates collapse into a single readable
line, including multi-day spans, and a registration link appears only when one
has been set.

Both blocks read what the CMS has already rendered into the page. There are no
API calls, no keys, and nothing here talks to any internal system.

## Editing

Change the file, commit, push. GitHub Pages redeploys in about a minute.

The pages load these files with a `?v=` query string. Bump it after a push, or
browsers will keep the cached copy for roughly ten minutes.

## Notes

- Vanilla JS, no build step, no dependencies.
- The script is defensive by design: if the expected markup is not on the page
  it exits quietly rather than throwing.
