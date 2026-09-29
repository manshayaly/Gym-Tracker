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
