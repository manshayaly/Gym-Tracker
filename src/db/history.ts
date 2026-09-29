import type { SQLiteDatabase } from 'expo-sqlite';

import type { WorkoutSet } from './types';

export type WorkoutSummary = {
  id: string;
  /** Local calendar day, "YYYY-MM-DD". */
  date: string;
  /** In the order they were done (by each exercise's first set that day). */
  exerciseNames: string[];
  setCount: number;
};

/**
 * Every workout with at least one (non-deleted) set, newest first.
 * One row per exercise per workout comes back from SQL; they're folded into
 * one summary per workout here.
 */
export async function getWorkoutSummaries(db: SQLiteDatabase) {
  const rows = await db.getAllAsync<{
    workout_id: string;
    date: string;
    name: string;
    set_count: number;
  }>(
    `SELECT s.workout_id, w.date, e.name, COUNT(*) AS set_count, MIN(s.created_at) AS first_at
     FROM workout_sets s
     JOIN workouts w ON w.id = s.workout_id
     JOIN exercises e ON e.id = s.exercise_id
     WHERE s.deleted_at IS NULL AND w.deleted_at IS NULL
     GROUP BY s.workout_id, s.exercise_id
     ORDER BY w.date DESC, first_at`
  );

  const summaries: WorkoutSummary[] = [];
  for (const row of rows) {
    let summary = summaries.at(-1);
    if (summary?.id !== row.workout_id) {
      summary = { id: row.workout_id, date: row.date, exerciseNames: [], setCount: 0 };
      summaries.push(summary);
    }
    summary.exerciseNames.push(row.name);
    summary.setCount += row.set_count;
  }
  return summaries;
}

export type WorkoutDetail = {
  id: string;
  date: string;
  /** In the order they were done; each exercise's sets in set-number order. */
  exercises: { exerciseId: string; name: string; sets: WorkoutSet[] }[];
};

/** One workout with all its (non-deleted) sets grouped by exercise, or null if not found. */
export async function getWorkoutDetail(db: SQLiteDatabase, workoutId: string) {
  const workout = await db.getFirstAsync<{ id: string; date: string }>(
    'SELECT id, date FROM workouts WHERE id = ? AND deleted_at IS NULL',
    workoutId
  );
  if (!workout) return null;

  const rows = await db.getAllAsync<WorkoutSet & { name: string }>(
    `SELECT s.*, e.name FROM workout_sets s
     JOIN exercises e ON e.id = s.exercise_id
     JOIN (
       SELECT exercise_id, MIN(created_at) AS first_at FROM workout_sets
       WHERE workout_id = ? AND deleted_at IS NULL
       GROUP BY exercise_id
     ) f ON f.exercise_id = s.exercise_id
     WHERE s.workout_id = ? AND s.deleted_at IS NULL
     ORDER BY f.first_at, s.exercise_id, s.set_number`,
    workoutId,
    workoutId
  );

  const detail: WorkoutDetail = { id: workout.id, date: workout.date, exercises: [] };
  for (const { name, ...set } of rows) {
    let group = detail.exercises.at(-1);
    if (group?.exerciseId !== set.exercise_id) {
      group = { exerciseId: set.exercise_id, name, sets: [] };
      detail.exercises.push(group);
    }
    group.sets.push(set);
  }
  return detail;
}

/** How many exercises and sets were logged on one local day (zeros if none). */
export async function getDaySummary(db: SQLiteDatabase, date: string) {
  const row = await db.getFirstAsync<{ exercise_count: number; set_count: number }>(
    `SELECT COUNT(DISTINCT s.exercise_id) AS exercise_count, COUNT(s.id) AS set_count
     FROM workout_sets s
     JOIN workouts w ON w.id = s.workout_id
     WHERE w.date = ? AND s.deleted_at IS NULL AND w.deleted_at IS NULL`,
    date
  );
  return { exerciseCount: row?.exercise_count ?? 0, setCount: row?.set_count ?? 0 };
}
