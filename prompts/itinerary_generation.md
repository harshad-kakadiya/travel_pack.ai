You are given `trip_start_date` (ISO: YYYY-MM-DD) and `trip_length_days`.

For each day d = 1..N:
- Compute date = trip_start_date + (d-1) days.
- Print the heading exactly as: `Day {d} — {Mon} {D}, {YYYY}` (e.g., Day 4 — Aug 20, 2025).
- Do not skip or duplicate day numbers.

At the very top of the document include:
`Open this trip online: https://www.travelbrief.ai/itinerary/{trip_id}/day/1`
(Use a placeholder if the URL is not yet known at generation time.)
