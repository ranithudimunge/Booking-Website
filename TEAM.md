# Scope lock

## Definition of done

Staff can see spaces, check a date range, create a booking with customer details, and receive a clear error when an overlapping booking targets the same space. The bookings list is optional until this path works.

## Chosen data approach: JSON

Use `data/store.json` for this urgent build. It has no package-install or database-configuration risk and persists between local runs. Switch to SQLite only after the end-to-end demo works. Do not change the API contract if that switch happens.

## Shared rules

- Dates are ISO strings in `yyyy-mm-dd` format.
- A booking owns the interval from `startDate` inclusive to `endDate` exclusive.
- Two bookings conflict only when they have the same `spaceId` and `existing.startDate < requested.endDate && existing.endDate > requested.startDate`.
- The server, not just the browser, must enforce the conflict rule.

## API contract

| Method | Path | Result |
|---|---|---|
| GET | `/api/spaces` | Seeded spaces with capacity, amenities and daily rate |
| GET | `/api/availability?startDate=YYYY-MM-DD&endDate=YYYY-MM-DD` | Each space plus `available` boolean |
| GET | `/api/bookings` | All existing bookings |
| POST | `/api/bookings` | Creates a booking, or returns `400` for invalid input and `409` for a clash |

## Roles

1. **Integrator:** server shell, branches, merges, running demo.
2. **Booking rules:** JSON read/write, validation, overlap protection, API tests.
3. **Admin UI:** spaces and availability screen, booking form.
4. **Booking view:** booking list, conflict/error state, basic styling.
5. **QA and demo:** test matrix, seed/demo data, README and rehearsal.

## Branches

Create `data-booking`, `admin-ui`, `booking-list`, and `qa-demo`. Push a small working commit before asking the integrator to merge. Keep `main` runnable.
