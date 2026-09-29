export const MUSCLE_GROUPS = ['chest', 'back', 'legs', 'shoulders', 'arms', 'core'] as const;
export type MuscleGroup = (typeof MUSCLE_GROUPS)[number];

export const EQUIPMENT = ['barbell', 'dumbbell', 'cable', 'machine', 'bodyweight'] as const;
export type Equipment = (typeof EQUIPMENT)[number];

/** Timestamps are ISO 8601 strings in UTC, e.g. "2026-09-29T10:15:00.000Z". */
export type Exercise = {
  id: string;
  name: string;
  muscle_group: MuscleGroup;
  equipment: Equipment;
  created_at: string;
  updated_at: string;
};

export type Workout = {
  id: string;
  /** Local calendar day, "YYYY-MM-DD". */
  date: string;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
};

export type WorkoutSet = {
  id: string;
  workout_id: string;
  exercise_id: string;
  /** Always kilograms — convert only for display. */
  weight_kg: number;
  reps: number;
  /** 1, 2, 3… per exercise within a workout. */
  set_number: number;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
};

export type BodyweightEntry = {
  id: string;
  /** Local calendar day, "YYYY-MM-DD". */
  date: string;
  /** Always kilograms — convert only for display. */
  weight_kg: number;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
};
