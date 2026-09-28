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
