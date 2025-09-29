# PDF Integration (TravelPack)

- Top-of-PDF link:
  ```typescript
  import { buildPdfHeaderLine } from '../src/pdf/integration';
  const header = buildPdfHeaderLine(tripId); // "Open this trip online: https://…/itinerary/<uuid>/day/1"
  ```

- Per-day headings:
  ```typescript
  import { buildPdfDayTitle } from '../src/pdf/integration';
  const title = buildPdfDayTitle(startDateISO, index0); // "Day 4 — Aug 20, 2025"
  ```

Insert `header` at the very top; use `title` for each day section.