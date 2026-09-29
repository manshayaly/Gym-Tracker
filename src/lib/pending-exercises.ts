/**
 * Exercises added to today's workout that have no sets yet. A workout only
 * exists in the database once a set is saved, so these live in memory until
 * then (and are forgotten if the app is closed — nothing was logged anyway).
 * Tied to a local date so yesterday's leftovers never appear today.
 */
type Pending = { exerciseId: string; name: string };

let date = '';
let pending: Pending[] = [];

export function getPendingExercises(today: string): readonly Pending[] {
  if (date !== today) {
    date = today;
    pending = [];
  }
  return pending;
}

export function addPendingExercise(today: string, exercise: Pending) {
  const current = getPendingExercises(today);
  if (!current.some((p) => p.exerciseId === exercise.exerciseId)) {
    pending = [...current, exercise];
  }
}

export function removePendingExercise(today: string, exerciseId: string) {
  pending = getPendingExercises(today).filter((p) => p.exerciseId !== exerciseId);
}
