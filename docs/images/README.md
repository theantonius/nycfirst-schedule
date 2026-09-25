# Screenshot plan

Seven screenshots, one per layer of the system, in the order data moves. Save each as PNG using the filename given. Check every image at full size before committing: blurred areas should be unreadable when zoomed in.

Blur on every screenshot: staff names and avatars, email addresses, board/item/user IDs, webhook paths, credential names, account or workspace names, and anything that identifies a student.

---

### 1. `01-monday-events-board.png`

- **Show:** 4–6 event rows with Name, STEM Center, Timeline, Program, Venue, Posted on Website, and the Webflow ID and calendar event ID columns.
- **Crop:** the left sidebar, top navigation, and unrelated columns and groups.
- **Blur:** Staff column, person avatars, the ID values themselves (keep the column headers visible).
- **Caption:** Staff manage each event once, in Monday.com. Setting "Posted on Website" to Published sends it to the website and calendars, and n8n writes the resulting Webflow and calendar IDs back to the row.
- **Used in:** monday-data-model.md

### 2. `02-monday-schedule-changes.png`

- **Show:** a few Schedule Changes rows covering a closure and an alternate-hours day (Type, Reason, Timeline, Opens/Closes, Posted). Optionally a second crop of the STEM Center Hours board with Monday–Sunday columns.
- **Crop:** sidebar, navigation, unrelated groups.
- **Blur:** Staff column, avatars, ID values.
- **Caption:** Closures, alternate hours and regular weekly hours are maintained as operational data in Monday.com, separately from the website. n8n turns them into what the public sees.
- **Used in:** monday-data-model.md

### 3. `03-n8n-workflow-list.png`

- **Show:** the production workflows from workflows.md with their active toggles.
- **Crop:** test, draft and unrelated workflows; the account menu.
- **Blur:** owner/creator names, project or workspace names.
- **Caption:** Several production workflows on NYC FIRST's self-hosted n8n instance handle events, schedule changes, weekly hours, public live feeds and supporting automation.
- **Used in:** workflows.md

### 4. `04-n8n-events-workflow.png`

- **Show:** the whole Events NYCFIRST → Calendar canvas, zoomed out so the stages are visible: webhook, load context, map fields, drop superseded runs, the Webflow and Calendar branches, and the write-backs. Node labels do not need to be readable.
- **Crop:** the n8n side panel and execution log.
- **Blur:** any open node panel, sticky notes that contain IDs or paths.
- **Caption:** A Monday change triggers the Events workflow, which publishes to Webflow and Google Calendar and writes both IDs back to Monday so later edits update the same records.
- **Used in:** workflows.md

### 5. `05-webflow.png`

- **Show:** the Schedule Changes/Events CMS collection with a few items, or the Designer showing where the `sc-center` / `sc-teaser` blocks sit, next to the resulting page.
- **Crop:** site settings, billing, team panels, unrelated collections.
- **Blur:** collaborator names and avatars, item IDs.
- **Caption:** Webflow is the public CMS and page layer. It receives its content from Monday.com through n8n and is not edited as a source.
- **Used in:** architecture.md

### 6. `06-google-calendar.png`

- **Show:** SC-All and several center calendars in the sidebar, and one published event open.
- **Crop:** personal calendars and other calendars in the sidebar.
- **Blur:** the guest list, organizer and staff email addresses.
- **Caption:** Each published event is created once on the shared SC-All calendar, with the relevant STEM Center calendars and staff invited.
- **Used in:** architecture.md

### 7. `07-public-site.png`

- **Show:** Today's Hours cards, and/or the events page with the filter bar, program stripes and subscribe options.
- **Crop:** browser chrome and the site's header/footer if not needed.
- **Blur:** nothing, unless a card shows a staff name.
- **Caption:** The public page is the end of the chain: hours, closures and events edited in Monday.com, delivered through n8n and Webflow, and rendered by this repository's code.
- **Used in:** architecture.md, README.md
