import type { SQLiteDatabase } from 'expo-sqlite';

import type { Exercise } from './types';

export function getAllExercises(db: SQLiteDatabase) {
  return db.getAllAsync<Exercise>('SELECT * FROM exercises ORDER BY name COLLATE NOCASE');
}

export function getExerciseById(db: SQLiteDatabase, id: string) {
  return db.getFirstAsync<Exercise>('SELECT * FROM exercises WHERE id = ?', id);
}
