# How to update events (UK event calendar)

You don't need a developer for any of this. Every change shows on the website within a few minutes, with no redeploy.

## Signing in

1. Go to **yoursite.com/admin** and sign in with your email and password.
2. To add a helper, open **Users**, enter their email and choose **Editor** (they can add drafts and mark events checked) or **Admin** (they can also publish, delete and change settings). Copy the one-time password shown and send it to them privately.

## Your weekly 15 minutes

Open the **Dashboard** and work through the cards from left to right. Each card opens a ready-made list.

| Card | What to do |
| --- | --- |
| **Re-check due** | Open each event's official link. If nothing changed, tick it and press **Mark as checked**. If something changed, open it, fix it, then **Save and mark as checked**. |
| **Expected dates to confirm** | If the organiser has announced the date, change **Date status** to **Confirmed** and fix the dates. |
| **Starting soon** | A final look at events in the next 2 weeks. |
| **Suggestions inbox** | Check the link. If it's a real, big event, press **Create draft from this**. Otherwise, press **Reject**. |
| **Missing source** | This should always be 0. |

The **Coverage** box shows how many cities have at least 5 upcoming events. The tool is ready to launch once 10 cities do.

## Adding one event

1. **Events › + Add event**.
2. Fill in the name, category, dates, city and the **official source link** (it must start with `https://`). The venue and description are optional.
3. Choose **Our demand estimate** (high, medium or low) and add a short reason.
4. Press **Preview** to see the card exactly as hosts will see it.
5. Press **Publish** (admins), or **Save as draft** (editors) for an admin to publish later.

If the system warns that the event "looks like" an existing one, check the existing event first. Press **Yes, save anyway** only if it really is a different event.

## Adding many events at once (spreadsheet)

1. **Import/export › Download CSV template**, and open it in Excel or Google Sheets.
2. Add one event per row. Dates must be in the YYYY-MM-DD format, for example 2027-06-12. Delete the example row.
3. Save the file as **CSV**, then choose it on the same page.
4. Check the preview: rows marked ✗ show what's wrong and will be skipped. Nothing is saved until you press the **Import** button under the preview.

To edit lots of events at once, use **Export all events**, change the file, then import it again. Existing events are updated, not duplicated.

## Every year

- **Next year's copy:** open an annual event and press **Create next year's copy**. This makes a draft for the following year with "Expected date". Confirm it once the organiser announces the date.
- **Bank holidays:** when GOV.UK publishes the next year's dates, open **Bank holidays**, paste them in (one per line) and press **Add bank holidays**.

## Good to know

- Past events disappear from the website by themselves the day after they end. **Archive past events** on the dashboard tidies up the admin list.
- Drafts and archived events are never shown on the website.
- An event can't be published without an official `https://` link.
- **Settings** controls the default distance, date range, reminder options, and the "How demand is estimated" text shown to hosts.
- **Audit log** shows who changed what, and when.
