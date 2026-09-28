import type { Equipment, Exercise, MuscleGroup } from '@/db/types';

export type ExerciseFilters = {
  query: string;
  muscleGroup: MuscleGroup | null;
  equipment: Equipment | null;
};

/**
 * Case-insensitive; every word typed must appear somewhere in the name, in
 * any order — so "incline press" matches "Incline Dumbbell Bench Press".
 */
export function filterExercises(exercises: readonly Exercise[], filters: ExerciseFilters) {
  const words = filters.query.toLowerCase().split(/\s+/).filter(Boolean);

  return exercises.filter((exercise) => {
    if (filters.muscleGroup && exercise.muscle_group !== filters.muscleGroup) return false;
    if (filters.equipment && exercise.equipment !== filters.equipment) return false;
    const name = exercise.name.toLowerCase();
    return words.every((word) => name.includes(word));
  });
}
