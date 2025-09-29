import { dayNumberAndDate } from './dates';
export function renderDayTitle(startISO: string, index0: number) {
  const { dayNumber, dateLabel } = dayNumberAndDate(startISO, index0);
  return `Day ${dayNumber} — ${dateLabel}`;
}
export function renderPdfHeaderLink(tripId: string) {
  return `Open this trip online: https://www.travelpack.ai/itinerary/${tripId}/day/1`;
}
