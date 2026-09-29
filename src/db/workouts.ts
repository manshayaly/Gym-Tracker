import type { SQLiteDatabase } from 'expo-sqlite';

import { nowTimestamp } from '@/lib/dates';
import { newId } from '@/lib/ids';

import type { WorkoutSet } from './types';

/**
 * Saves one set of an exercise on the given local day, creating that day's
 * workout if it doesn't exist yet. The set is numbered after the exercise's
 * existing sets that day.
 */
export async function logSet(
  db: SQLiteDatabase,
  input: { exerciseId: string; weightKg: number; reps: number; date: string }
) {
  const now = nowTimestamp();
  const set: WorkoutSet = {
    id: newId(),
    workout_id: '',
    exercise_id: input.exerciseId,
    weight_kg: input.weightKg,
    reps: input.reps,
    set_number: 0,
    created_at: now,
    updated_at: now,
    deleted_at: null,
  };

  await db.withExclusiveTransactionAsync(async (txn) => {
    const workout = await txn.getFirstAsync<{ id: string }>(
      'SELECT id FROM workouts WHERE date = ? AND deleted_at IS NULL',
      input.date
    );
    if (workout) {
      set.workout_id = workout.id;
    } else {
      set.workout_id = newId();
      await txn.runAsync(
        'INSERT INTO workouts (id, date, created_at, updated_at) VALUES (?, ?, ?, ?)',
        set.workout_id,
        input.date,
        now,
        now
      );
    }

    const last = await txn.getFirstAsync<{ n: number }>(
      `SELECT COALESCE(MAX(set_number), 0) AS n FROM workout_sets
       WHERE workout_id = ? AND exercise_id = ? AND deleted_at IS NULL`,
      set.workout_id,
      set.exercise_id
    );
    set.set_number = (last?.n ?? 0) + 1;

    await txn.runAsync(
      `INSERT INTO workout_sets
         (id, workout_id, exercise_id, weight_kg, reps, set_number, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      set.id,
      set.workout_id,
      set.exercise_id,
      set.weight_kg,
      set.reps,
      set.set_number,
      set.created_at,
      set.updated_at
    );
  });

  return set;
}

/** An exercise's sets on one local day, in order. */
export function getSetsForDay(db: SQLiteDatabase, exerciseId: string, date: string) {
  return db.getAllAsync<WorkoutSet>(
    `SELECT s.* FROM workout_sets s
     JOIN workouts w ON w.id = s.workout_id
     WHERE s.exercise_id = ? AND w.date = ?
       AND s.deleted_at IS NULL AND w.deleted_at IS NULL
     ORDER BY s.set_number`,
    exerciseId,
    date
  );
}

/**
 * The most recent day before `beforeDate` on which this exercise was logged,
 * with that day's sets — or null if it has never been logged before.
 */
export async function getLastPerformance(
  db: SQLiteDatabase,
  exerciseId: string,
  beforeDate: string
) {
  const previous = await db.getFirstAsync<{ date: string }>(
    `SELECT w.date FROM workout_sets s
     JOIN workouts w ON w.id = s.workout_id
     WHERE s.exercise_id = ? AND w.date < ?
       AND s.deleted_at IS NULL AND w.deleted_at IS NULL
     ORDER BY w.date DESC
     LIMIT 1`,
    exerciseId,
    beforeDate
  );
  if (!previous) return null;

  const sets = await getSetsForDay(db, exerciseId, previous.date);
  return { date: previous.date, sets };
}

/**
 * Soft-deletes a set and renumbers the exercise's later sets that day so the
 * numbering stays 1, 2, 3… If the workout has no sets left, it is deleted too.
 */
export async function deleteSet(db: SQLiteDatabase, setId: string) {
  const now = nowTimestamp();

  await db.withExclusiveTransactionAsync(async (txn) => {
    const set = await txn.getFirstAsync<WorkoutSet>(
      'SELECT * FROM workout_sets WHERE id = ? AND deleted_at IS NULL',
      setId
    );
    if (!set) return;

    await txn.runAsync(
      'UPDATE workout_sets SET deleted_at = ?, updated_at = ? WHERE id = ?',
      now,
      now,
      set.id
    );
    await txn.runAsync(
      `UPDATE workout_sets SET set_number = set_number - 1, updated_at = ?
       WHERE workout_id = ? AND exercise_id = ? AND set_number > ? AND deleted_at IS NULL`,
      now,
      set.workout_id,
      set.exercise_id,
      set.set_number
    );

    const remaining = await txn.getFirstAsync<{ n: number }>(
      'SELECT COUNT(*) AS n FROM workout_sets WHERE workout_id = ? AND deleted_at IS NULL',
      set.workout_id
    );
    if (remaining?.n === 0) {
      await txn.runAsync(
        'UPDATE workouts SET deleted_at = ?, updated_at = ? WHERE id = ?',
        now,
        now,
        set.workout_id
      );
    }
  });
}

/**
 * The all-time best set for an exercise (today included): heaviest weight,
 * then most reps at that weight, then the earliest day it was done. For an
 * exercise only ever logged at 0 kg this is simply the most reps.
 * Null if the exercise has never been logged.
 */
export function getPersonalBest(db: SQLiteDatabase, exerciseId: string) {
  return db.getFirstAsync<{ weight_kg: number; reps: number; date: string }>(
    `SELECT s.weight_kg, s.reps, w.date FROM workout_sets s
     JOIN workouts w ON w.id = s.workout_id
     WHERE s.exercise_id = ? AND s.deleted_at IS NULL AND w.deleted_at IS NULL
     ORDER BY s.weight_kg DESC, s.reps DESC, w.date ASC, s.created_at ASC
     LIMIT 1`,
    exerciseId
  );
}
