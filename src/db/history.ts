import type { SQLiteDatabase } from 'expo-sqlite';

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
