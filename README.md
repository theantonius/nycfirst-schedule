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

Change a file, then run:

```
./deploy.sh "what changed"
```

That commits, pushes, clears the CDN cache and verifies that the new file is
actually being served. If it reports STALE, wait a minute and run it again —
the push has already succeeded either way.

The site loads these files from a CDN that mirrors this repository, so nothing
needs to be uploaded or pasted anywhere.

## Notes

- Vanilla JS, no build step, no dependencies.
- The script is defensive by design: if the expected markup is not on the page
  it exits quietly rather than throwing.
