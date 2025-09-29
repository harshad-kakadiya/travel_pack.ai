export function addDaysISO(iso: string, offset: number) {
  const d = new Date(iso + 'T00:00:00'); d.setDate(d.getDate() + offset);
  return d.toISOString().slice(0,10);
}
export function formatDayLabel(iso: string) {
  return new Date(iso + 'T00:00:00').toLocaleDateString(undefined, { month:'short', day:'numeric', year:'numeric' });
}
export function dayNumberAndDate(startISO: string, dayIndex0: number) {
  const dateISO = addDaysISO(startISO, dayIndex0);
  return { dayNumber: dayIndex0+1, dateISO, dateLabel: formatDayLabel(dateISO) };
}
