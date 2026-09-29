/**
 * The one place weights are formatted for display. Storage is always kg;
 * the future lb setting will convert here.
 */
export function formatWeight(kg: number) {
  // Round away float noise (e.g. 62.50000001) and drop trailing zeros.
  return `${Number(kg.toFixed(2))} kg`;
}

/** A kg value as plain text for the weight input or its hint, e.g. 62.5 → "62.5". */
export function weightToInput(kg: number) {
  return String(Number(kg.toFixed(2)));
}

/** Parses a typed weight, accepting "62.5" or "62,5". Null if not a valid weight. */
export function parseWeightInput(text: string) {
  const normalized = text.trim().replace(',', '.');
  if (!/^\d+(\.\d+)?$/.test(normalized)) return null;
  return Number(normalized);
}

/** Parses typed reps: a whole number of at least 1. Null otherwise. */
export function parseRepsInput(text: string) {
  const trimmed = text.trim();
  if (!/^\d+$/.test(trimmed)) return null;
  const reps = Number(trimmed);
  return reps >= 1 ? reps : null;
}
