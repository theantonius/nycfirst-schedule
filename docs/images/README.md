# Screenshot plan

Ten screenshots, ordered from the public result back into the infrastructure. Save each as PNG using the filename given. Check every image at full size before committing: blurred areas should be unreadable when zoomed in.

Blur on every screenshot: staff names and avatars, email addresses, board/item/user IDs, webhook paths, credential names, account or workspace names, and anything that identifies a student.

**README placement:** at most three images in the README: `01` under the introduction, `05` or `06` near "How it works", and `02` or `03` near "Staff workflow". The full set lives in `/docs`.

**Portfolio set (six):** `01`, `02`, `03`, `05`, `06`, and a combined Webflow + Calendar output image made from `07` and `08`.

---

### 1. `01-public-site.png`

- **Show:** Today's Hours cards. Second crop (`01b-events-page.png`): the events page with filters, program stripes and subscribe options, including at least one off-site event with its venue name, address and map link visible.
- **Crop:** browser tabs and chrome, unrelated site header/footer.
- **Blur:** nothing, unless a card shows a staff name.
- **Caption:** The public result: STEM Center hours, closures and events on nycfirst.org, maintained in Monday.com and published automatically.
- **Used in:** README.md, architecture.md

### 2. `02-monday-event-form.png`

- **Show:** the Events form as a staff member sees it when submitting an event. Use test or sample content, not a real submission.
- **Crop:** browser chrome and anything outside the form.
- **Blur:** any prefilled personal data.
- **Caption:** Most staff start here: a Monday.com form. A submission creates a record that stays internal until a publisher sets it to Published.
- **Used in:** README.md, monday-data-model.md

### 3. `03-monday-events-board.png`

- **Show:** 4–6 event rows with event name, center, date, program, venue, publish status, Webflow ID and Calendar ID. If possible include one STEM Center event, one school or other off-site event, and one partner-site or other venue event, with the Venue column visible.
- **Crop:** the left sidebar, top navigation, and unrelated columns and groups.
- **Blur:** the ID values (keep the column headers visible), Staff column, avatars.
- **Caption:** Staff manage each event once, in Monday.com. Setting the publish status to Published sends it to the website and calendars, and n8n writes the resulting Webflow and calendar IDs back to the row.
- **Used in:** README.md, monday-data-model.md

### 4. `04-monday-schedule-data.png`

- **Show:** Schedule Changes with one closure and one alternate-hours entry. If possible, a single composed image with a small crop of the STEM Center Hours board (Monday–Sunday columns) beside it.
- **Crop:** sidebar, navigation, unrelated groups.
- **Blur:** Staff column, avatars, ID values.
- **Caption:** Regular weekly hours and exceptions (closures, alternate hours) are maintained separately in Monday.com. n8n combines them into what the public sees.
- **Used in:** monday-data-model.md

### 5. `05-n8n-workflow-list.png`

- **Show:** the seven production workflows from workflows.md together, with their active toggles.
- **Crop:** Eventbrite, test, draft and unrelated workflows; the account menu.
- **Blur:** owner/creator names, project or workspace names.
- **Caption:** Seven production workflows on NYC FIRST's self-hosted n8n instance handle events, schedule changes, weekly hours, public live feeds and row naming.
- **Used in:** README.md, workflows.md

### 6. `06-n8n-events-workflow.png`

- **Show:** the whole Events NYCFIRST → Calendar canvas, zoomed out so the branches register: trigger → context and data processing → Webflow branch + Google Calendar branch → write-backs. Node text does not need to be legible.
- **Crop:** the n8n side panel and execution log.
- **Blur:** webhook paths, credential names, identifiers, staff information, sticky notes containing any of these.
- **Caption:** A Monday change triggers the Events workflow, which publishes to Webflow and Google Calendar and writes both IDs back to Monday so later edits update the same records.
- **Used in:** README.md, workflows.md

### 7. `07-webflow-cms-output.png`

- **Show:** two parts. Left: the Schedule Changes/Events CMS collection with a few items. Right: the corresponding public card or list.
- **Crop:** site settings, billing, team panels, unrelated collections.
- **Blur:** collaborator names and avatars, item IDs.
- **Caption:** Webflow is the public CMS and page layer. Items arrive from Monday.com through n8n and appear on the site; Webflow is not edited as a source.
- **Used in:** architecture.md

### 8. `08-google-calendar.png`

- **Show:** SC-All and several STEM Center calendars in the sidebar, and one published event open.
- **Crop:** personal calendars and other calendars in the sidebar.
- **Blur:** the guest list, organizer and staff email addresses.
- **Caption:** Each published event is created once on the shared SC-All calendar, with the relevant STEM Center calendars and staff invited.
- **Used in:** architecture.md

### 9. `09-walk-in-hours.png`

- **Show:** a crop of the STEM Center Hours board (top) and several expanded Card Holder Walk-in Hours cards on `/stem-centers` (bottom), with the matching board rows outlined.
- **Crop:** board navigation and non-hours columns; site header and the second row of cards.
- **Blur:** nothing; no personal data on either part.
- **Caption: Staff edit a center's weekly hours in Monday.com (top); n8n updates the Webflow item and the Card Holder Walk-in Hours on the STEM Centers page change (bottom).
- **Used in:** README.md, monday-data-model.md

### 10. `10-monday-venues-board.png`

- **Show:** the Venues board with several vetted venues (schools, partner sites) and the pending review group.
- **Crop:** sidebar, navigation, unrelated columns.
- **Blur:** any contact names, phone numbers or emails if the board has them; board and item IDs.
- **Caption:** Schools and other event locations are reusable reference data managed centrally in Monday.com rather than hardcoded into individual events. New venues typed on an event arrive in the pending group for review.
- **Used in:** monday-data-model.md, architecture.md
