# Admissions Check-In App

A lightweight Node.js app for staff-side guest check-in against RocketRez schedules.

## Setup

```bash
npm install
npm start
```

Then open http://localhost:3000 in your browser.

## How It Works

1. **Select a date** — defaults to today. Click **Load Schedules** to pull from RocketRez.
2. **Pick a schedule** — tabs appear for each tour/time slot. Click one to load its manifest.
3. **Find a guest** — use the search bar to filter by name, email, or order ID.
4. **Mark Arrived** — when a party shows up at the host stand, click the green button. The card moves to the top and shows a pulsing "PARTY ARRIVED" badge with timestamp.
5. **Mark Retrieved** — once your admissions staff has formally checked them in via RocketRez, click "Mark Retrieved" to clear them from the arrived queue.

## Endpoints Used

- `GET /RocketAPI/v1/TourSchedules` — fetches all schedules for a date
- `GET /RocketAPI/v1/TourManifest` — fetches the order manifest for a specific schedule

## Notes

- Self-check-in state is stored **in memory** on the server. It resets when the server restarts. 
- Refresh button re-fetches the manifest from RocketRez to pick up any RR-side check-in updates.
- The `SiteId` is hardcoded to `4` in `server.js` — update if needed.
