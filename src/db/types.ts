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
