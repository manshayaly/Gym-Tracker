import type { WorkoutSet } from '@/db/types';

/**
 * Which set to show as the grey hint in the weight/reps inputs: the latest set logged
 * today, otherwise the first set from last time, otherwise nothing.
 */
export function pickPrefillSet(todaySets: readonly WorkoutSet[], lastTimeSets: readonly WorkoutSet[]) {
  return todaySets.at(-1) ?? lastTimeSets[0] ?? null;
}
