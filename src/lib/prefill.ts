import type { WorkoutSet } from '@/db/types';

/**
 * Which set to pre-fill the weight/reps inputs from: the latest set logged
 * today, otherwise the first set from last time, otherwise nothing.
 */
export function pickPrefillSet(todaySets: readonly WorkoutSet[], lastTimeSets: readonly WorkoutSet[]) {
  return todaySets.at(-1) ?? lastTimeSets[0] ?? null;
}
