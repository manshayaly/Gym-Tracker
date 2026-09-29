import type { SQLiteDatabase } from 'expo-sqlite';

import { nowTimestamp } from '@/lib/dates';
import { newId } from '@/lib/ids';

import type { BodyweightEntry } from './types';

/**
 * Records the bodyweight for a local day. If that day already has an entry it
 * is updated in place (same id), so there is only ever one per day.
 */
export async function saveBodyweight(
  db: SQLiteDatabase,
  input: { weightKg: number; date: string }
) {
  const now = nowTimestamp();

  await db.withExclusiveTransactionAsync(async (txn) => {
    const existing = await txn.getFirstAsync<{ id: string }>(
      'SELECT id FROM bodyweight_entries WHERE date = ? AND deleted_at IS NULL',
      input.date
    );
    if (existing) {
      await txn.runAsync(
        'UPDATE bodyweight_entries SET weight_kg = ?, updated_at = ? WHERE id = ?',
        input.weightKg,
        now,
        existing.id
      );
    } else {
      await txn.runAsync(
        `INSERT INTO bodyweight_entries (id, date, weight_kg, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?)`,
        newId(),
        input.date,
        input.weightKg,
        now,
        now
      );
    }
  });
}

/** All (non-deleted) entries, newest day first. */
export function getBodyweightEntries(db: SQLiteDatabase) {
  return db.getAllAsync<BodyweightEntry>(
    'SELECT * FROM bodyweight_entries WHERE deleted_at IS NULL ORDER BY date DESC'
  );
}

/** Soft-deletes an entry. */
export async function deleteBodyweightEntry(db: SQLiteDatabase, id: string) {
  const now = nowTimestamp();
  await db.runAsync(
    'UPDATE bodyweight_entries SET deleted_at = ?, updated_at = ? WHERE id = ? AND deleted_at IS NULL',
    now,
    now,
    id
  );
}

/**
 * Pairs each entry (newest first) with its change in kg from the entry
 * before it in time; null for the oldest entry.
 */
export function withChanges(entries: readonly BodyweightEntry[]) {
  return entries.map((entry, i) => {
    const previous = entries[i + 1];
    return { entry, changeKg: previous ? entry.weight_kg - previous.weight_kg : null };
  });
}
