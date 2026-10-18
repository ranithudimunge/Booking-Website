# Scope lock

## Definition of done

Staff can see spaces, check a date range, create a booking with customer details, and receive a clear error when an overlapping booking targets the same space. Add the bookings list only after this path works.

## Data choice

Use `data/store.json` for this urgent build. It removes package-install and configuration risk while persisting bookings between local runs. Keep the API unchanged if the team later switches to SQLite.

## Shared rules

- Dates use `yyyy-mm-dd`.
- Bookings use `[startDate, endDate)`: start is included and end is not.
- A conflict requires the same `spaceId` and `existing.startDate < requested.endDate && existing.endDate > requested.startDate`.
- The server enforces this rule.

## Team roles

1. Integrator: branches, merges, running app and demo.
2. Booking rules: data access, validation, overlap tests.
3. Admin UI: spaces, availability and booking form.
4. Booking view: bookings list, feedback and simple styling.
5. QA/demo: test matrix, sample data, README and rehearsal.
