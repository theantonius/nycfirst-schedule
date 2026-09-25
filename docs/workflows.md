# Workflows

The n8n workflows behind the STEM Center Schedule System, as configured at launch (Sept 25, 2026).

Webhook URLs, credentials and board identifiers are intentionally left out. Workflow exports are not stored in this repository.

## Production workflows

| Workflow | Trigger | Reads | Writes |
| --- | --- | --- | --- |
| Events NYCFIRST → Calendar | Monday webhook | Events board, Calendars, Tags, Venues | Webflow CMS, Google Calendar, IDs back to Monday, pending Tags/Venues |
| Monday Schedule Changes → Webflow CMS and GCal | Monday webhook | Schedule Changes | Webflow CMS, Webflow ID and row name back to Monday |
| Monday → n8n → Webflow | Monday webhook | STEM Center Hours | Webflow hours collection |
| SC Overrides | Public GET | Schedule Changes | JSON feed (used by this repo) |
| SC-Status API | Public GET | STEM Center Hours, Schedule Changes | JSON feed |
| SC-Weekly API | Public GET | STEM Center Hours | JSON feed |
| SC Auto-name Rows | Monday webhook | Schedule Changes | Row name back to Monday |

Monday webhooks start with a challenge handler, which Monday requires when a webhook is registered.

---

### Events NYCFIRST → Calendar

Publishes an event to the website and calendars when its publish status changes, and keeps both in sync with later edits.

1. **Receive** the Monday change: which item, which column, which status.
2. **Load context:** the Events board, the Calendars registry, Monday users (to resolve staff to email addresses), and the item's linked venue, tags and image.
3. **Map fields:** date range, hours, description, link, programs, venue or off-site address, volunteer flag, image, staff.
   - Ignores changes to the ID columns this workflow writes itself (loop guard).
   - Continues only if the row is Published, or Unpublished with a calendar event on record.
   - Looks up the center's calendars and staff in the Calendars registry.
4. **Drop superseded runs:** if the row's status no longer matches the change that started this run, the run stops so the newer change wins.
5. **Pending tags and venues:** a program or venue typed in that doesn't exist yet is added to the Tags or Venues board's pending group for review.
6. **Publish or unpublish:**
   - **Webflow:** update the existing item and publish it, or create it live and write the new Webflow ID back to Monday. Unpublish removes the live item.
   - **Google Calendar:** replace the event on the SC-All calendar, with center calendars and staff as attendees, and write the event ID back to Monday. Unpublish deletes the event and clears the stored ID.

Some Monday reads and write-backs retry automatically on failure.

### Monday Schedule Changes → Webflow CMS and GCal

Publishes closures and alternate hours to the website.

1. Receive the Monday change and read the Schedule Changes rows.
2. Map fields: center, date range, opening/closing hours, type, reason, publish status.
3. Stop if required fields are missing.
4. Build the Webflow item and a standard row name (`Type - Reason - Center - Date`), and rename the Monday row.
5. Create, update or unpublish the Webflow item; write a new item's ID back to Monday.

**Google Calendar is currently disconnected in this workflow.** The calendar steps exist but are not wired in, on purpose: how schedule changes should appear on calendars is still being decided. Schedule changes appear on the website only.

Events and schedule changes share one Webflow collection, distinguished by type.

### Monday → n8n → Webflow (weekly hours)

Keeps each STEM Center's regular weekly hours current on the website.

1. Receive a change to one day's hours on the STEM Center Hours board.
2. Find the matching Webflow item by the ID stored on the row.
3. Update that one day on the live Webflow item.

Changes to other columns are ignored.

### SC Overrides (public feed)

Returns the published closures and alternate hours covering today and the next 14 days, by date and center code. `schedule.js` uses this for Today's Hours and falls back to page rows if it fails.

- Published rows only; event-type rows excluded.
- Uses New York time; end dates are inclusive.
- A closure outranks alternate hours on the same day.
- Read-only, no authentication, cached for 60 seconds.

### SC-Status API and SC-Weekly API (public feeds)

Earlier live-status feeds from the Feb–Mar 2026 phase.

- **SC-Status:** today's hours per center, with a schedule-change override applied.
- **SC-Weekly:** each center's name, location, address and seven days of hours.

This repository does not use them. Current consumer unknown; review before treating as production-critical.

### SC Auto-name Rows

Gives new Schedule Changes rows a readable name (`Type - Reason - Center - Date`) once the required fields are filled, replacing "New item". The Schedule Changes workflow also renames rows when they are processed; see [reliability.md](reliability.md).

---

## Legacy / maintenance workflows

These exist in n8n but are not part of the normal production path.

| Workflow | Status | Notes |
| --- | --- | --- |
| Full Sync - Monday.com - Webflow | Active, on-demand trigger | Pushes every center's weekly hours to Webflow in one pass. A maintenance tool, not part of normal operation. Needs review before use. |
| Monday ↔ Google Calendar | Active, not called | Subworkflow. Only caller is the disconnected calendar step in Schedule Changes. The Events workflow does not use it. |
| Monday ↔ Google Calendar with Invites | Active, not called | As above. Last run Sept 18, 2026. |
| Schedule Changes - Webflow | Inactive | Earlier version of the Schedule Changes workflow. |
| Events - monday-eventbrite, Eventbrite → Monday v2 | Active | Earlier Eventbrite-based events path (spring 2026). Scheduled for cleanup. |
| Eventbrite → Monday | Inactive | First version of the above. |

The n8n instance also runs unrelated NYC FIRST automations; they are not documented here.
