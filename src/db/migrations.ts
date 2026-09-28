import type { SQLiteDatabase } from 'expo-sqlite';

import { SEED_EXERCISES, SEED_TIMESTAMP } from './seed/exercises';

type Migration = (db: SQLiteDatabase) => Promise<void>;

/**
 * Each entry upgrades the database by one version; the database's
 * `user_version` records how many have run. Never edit, remove, or reorder a
 * migration that has shipped — append a new one instead.
 */
const MIGRATIONS: Migration[] = [
  // 1: exercise library
  async (db) => {
    await db.execAsync(`
      CREATE TABLE exercises (
        id           TEXT PRIMARY KEY NOT NULL,
        name         TEXT NOT NULL UNIQUE COLLATE NOCASE,
        muscle_group TEXT NOT NULL CHECK (muscle_group IN ('chest', 'back', 'legs', 'shoulders', 'arms', 'core')),
        equipment    TEXT NOT NULL CHECK (equipment IN ('barbell', 'dumbbell', 'cable', 'machine', 'bodyweight')),
        created_at   TEXT NOT NULL,
        updated_at   TEXT NOT NULL
      );
    `);

    const insert = await db.prepareAsync(
      `INSERT INTO exercises (id, name, muscle_group, equipment, created_at, updated_at)
       VALUES ($id, $name, $muscle_group, $equipment, $created_at, $updated_at)`
    );
    try {
      for (const exercise of SEED_EXERCISES) {
        await insert.executeAsync({
          $id: exercise.id,
          $name: exercise.name,
          $muscle_group: exercise.muscle_group,
          $equipment: exercise.equipment,
          $created_at: SEED_TIMESTAMP,
          $updated_at: SEED_TIMESTAMP,
        });
      }
    } finally {
      await insert.finalizeAsync();
    }
  },
];

/** Brings the database up to the latest version. Runs every time the app opens. */
export async function migrateDbIfNeeded(db: SQLiteDatabase) {
  await db.execAsync('PRAGMA journal_mode = WAL; PRAGMA foreign_keys = ON;');

  const row = await db.getFirstAsync<{ user_version: number }>('PRAGMA user_version');
  let version = row?.user_version ?? 0;

  while (version < MIGRATIONS.length) {
    const migrate = MIGRATIONS[version];
    const next = version + 1;
    // All-or-nothing: if any step fails, the database is left untouched.
    await db.withExclusiveTransactionAsync(async (txn) => {
      await migrate(txn);
      await txn.execAsync(`PRAGMA user_version = ${next}`);
    });
    version = next;
  }
}
