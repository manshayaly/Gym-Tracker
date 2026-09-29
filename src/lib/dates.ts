/** Current moment as a UTC ISO 8601 timestamp, for created_at / updated_at / deleted_at. */
export function nowTimestamp() {
  return new Date().toISOString();
}

/**
 * The phone's local calendar day as "YYYY-MM-DD". Deliberately not
 * toISOString(), which is UTC and can give the wrong day near midnight.
 */
export function localDate(date: Date = new Date()) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/**
 * Human label for a "YYYY-MM-DD" local day, e.g. "Thu, Sep 24", with the year
 * added when it isn't the current year ("Thu, Sep 24, 2025").
 */
export function formatDayLabel(day: string, now: Date = new Date()) {
  const [y, m, d] = day.split('-').map(Number);
  const date = new Date(y, m - 1, d); // local midnight — no UTC shift
  return date.toLocaleDateString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: y === now.getFullYear() ? undefined : 'numeric',
  });
}

/**
 * Long label for a "YYYY-MM-DD" local day, e.g. "Tuesday, September 29", with
 * the year added when it isn't the current year.
 */
export function formatLongDayLabel(day: string, now: Date = new Date()) {
  const [y, m, d] = day.split('-').map(Number);
  return new Date(y, m - 1, d).toLocaleDateString(undefined, {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: y === now.getFullYear() ? undefined : 'numeric',
  });
}

/** Month heading for a "YYYY-MM-DD" local day, e.g. "September 2026". */
export function formatMonthLabel(day: string) {
  const [y, m] = day.split('-').map(Number);
  return new Date(y, m - 1, 1).toLocaleDateString(undefined, { month: 'long', year: 'numeric' });
}

/**
 * Splits date-sorted items into consecutive groups by calendar month, keeping
 * the input order, e.g. for list section headers.
 */
export function groupByMonth<T extends { date: string }>(items: readonly T[]) {
  const groups: { title: string; data: T[] }[] = [];
  let currentMonth = '';
  for (const item of items) {
    const month = item.date.slice(0, 7); // "YYYY-MM"
    if (month !== currentMonth) {
      groups.push({ title: formatMonthLabel(item.date), data: [] });
      currentMonth = month;
    }
    groups[groups.length - 1].data.push(item);
  }
  return groups;
}

/** The "YYYY-MM-DD" local day `days` days after `day` (negative goes back). */
export function addDays(day: string, days: number) {
  const [y, m, d] = day.split('-').map(Number);
  return localDate(new Date(y, m - 1, d + days));
}

/** Compact label for a "YYYY-MM-DD" local day, e.g. "Sep 24" — for chart axes. */
export function formatShortDayLabel(day: string) {
  const [y, m, d] = day.split('-').map(Number);
  return new Date(y, m - 1, d).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}
