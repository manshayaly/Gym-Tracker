import { randomUUID } from 'expo-crypto';

/** New random (v4) UUID for a database record. */
export function newId() {
  return randomUUID();
}
