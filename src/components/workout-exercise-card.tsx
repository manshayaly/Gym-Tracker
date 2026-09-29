import { useSQLiteContext } from 'expo-sqlite';
import { useCallback, useEffect, useState } from 'react';
import { Alert, Keyboard, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import type { WorkoutSet } from '@/db/types';
import { deleteSet, getLastPerformance, getSetsForDay, logSet } from '@/db/workouts';
import { localDate } from '@/lib/dates';
import {
  formatSetsCompact,
  formatWeight,
  parseRepsInput,
  parseWeightInput,
  weightToInput,
} from '@/lib/units';
import { FONT_FAMILY, spacing, type, useAppColors } from '@/theme';

type Props = {
  exerciseId: string;
  name: string;
  /** Changes whenever the screen reloads, telling the card to reload too. */
  refreshKey?: number;
  /** Called after a set is saved or deleted, so the screen can refresh. */
  onChange?: () => void;
  /** When given, a card with no sets yet shows a Remove option. */
  onRemove?: () => void;
};

/**
 * One exercise inside today's workout: last time, today's sets, and a
 * weight/reps row to log the next set without leaving the workout.
 */
export function WorkoutExerciseCard({
  exerciseId,
  name,
  refreshKey,
  onChange,
  onRemove,
}: Props) {
  const db = useSQLiteContext();
  const colors = useAppColors();
  const [sets, setSets] = useState<WorkoutSet[]>([]);
  const [lastTime, setLastTime] = useState<WorkoutSet[]>([]);
  const [weightText, setWeightText] = useState('');
  const [repsText, setRepsText] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    const today = localDate();
    const [todaySets, previous] = await Promise.all([
      getSetsForDay(db, exerciseId, today),
      getLastPerformance(db, exerciseId, today),
    ]);
    return { todaySets, lastTimeSets: previous?.sets ?? [] };
  }, [db, exerciseId]);

  const load = useCallback(async () => {
    const data = await fetchData();
    setSets(data.todaySets);
    setLastTime(data.lastTimeSets);
  }, [fetchData]);

  useEffect(() => {
    let cancelled = false;
    fetchData().then((data) => {
      if (cancelled) return;
      setSets(data.todaySets);
      setLastTime(data.lastTimeSets);
    });
    return () => {
      cancelled = true;
    };
  }, [fetchData, refreshKey]);

  // Grey hints: the last set today, otherwise the first set from last time.
  const hint = sets.at(-1) ?? lastTime[0];
  const weightKg = parseWeightInput(weightText);
  const reps = parseRepsInput(repsText);
  const canSave = weightKg !== null && reps !== null && !saving;

  async function handleSave() {
    if (weightKg === null || reps === null) return;
    setSaving(true);
    setError(null);
    try {
      await logSet(db, { exerciseId, weightKg, reps, date: localDate() });
      Keyboard.dismiss();
      setWeightText('');
      setRepsText('');
      await load();
      onChange?.();
    } catch {
      setError("Couldn't save the set. Try again.");
    } finally {
      setSaving(false);
    }
  }

  function confirmDelete(set: WorkoutSet) {
    Alert.alert(`Delete set ${set.set_number}?`, `${formatWeight(set.weight_kg)} × ${set.reps}`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          setError(null);
          try {
            await deleteSet(db, set.id);
            await load();
            onChange?.();
          } catch {
            setError("Couldn't delete the set. Try again.");
          }
        },
      },
    ]);
  }

  const inputStyle = [
    styles.input,
    { color: colors.text, backgroundColor: colors.background, borderColor: colors.border },
  ];

  return (
    <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      <View style={styles.titleRow}>
        <Text style={[type.title, styles.title, { color: colors.text }]}>{name}</Text>
        {onRemove && sets.length === 0 && (
          <Pressable onPress={onRemove} accessibilityRole="button" hitSlop={8}>
            <Label style={{ color: colors.text }}>Remove</Label>
          </Pressable>
        )}
      </View>

      {lastTime.length > 0 && (
        <View style={styles.lastTime}>
          <Label>Last time</Label>
          <Text style={[type.bodySmall, { color: colors.textMuted }]}>
            {formatSetsCompact(lastTime)}
          </Text>
        </View>
      )}

      {sets.length > 0 && (
        <View>
          {sets.map((set) => (
            <Pressable
              key={set.id}
              onLongPress={() => confirmDelete(set)}
              accessibilityHint="Press and hold to delete"
              style={({ pressed }) => [styles.setRow, pressed && { backgroundColor: colors.pressed }]}>
              <Text style={[type.bodySmall, styles.setNumber, { color: colors.textMuted }]}>
                {set.set_number}
              </Text>
              <Text style={[type.body, styles.tabular, { color: colors.text }]}>
                {formatWeight(set.weight_kg)} × {set.reps}
              </Text>
            </Pressable>
          ))}
        </View>
      )}

      <View style={styles.entry}>
        <TextInput
          value={weightText}
          onChangeText={setWeightText}
          keyboardType="decimal-pad"
          placeholder={hint ? `${weightToInput(hint.weight_kg)} kg` : 'kg'}
          placeholderTextColor={colors.textMuted}
          accessibilityLabel={`${name} weight in kilograms`}
          style={inputStyle}
        />
        <TextInput
          value={repsText}
          onChangeText={setRepsText}
          keyboardType="number-pad"
          placeholder={hint ? `${hint.reps} reps` : 'reps'}
          placeholderTextColor={colors.textMuted}
          accessibilityLabel={`${name} reps`}
          style={inputStyle}
        />
        <View style={styles.addButton}>
          <Button label="+ Set" disabled={!canSave} onPress={handleSave} />
        </View>
      </View>
      {error && <Text style={[type.bodySmall, { color: colors.error }]}>{error}</Text>}
      {sets.length > 0 && <Label>Press and hold a set to delete it</Label>}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: spacing.md,
    gap: spacing.md,
    borderWidth: StyleSheet.hairlineWidth,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  title: {
    flex: 1,
  },
  lastTime: {
    gap: 2,
  },
  setRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    paddingVertical: 6,
  },
  setNumber: {
    width: 28,
  },
  tabular: {
    fontVariant: ['tabular-nums'],
  },
  entry: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  input: {
    flex: 1,
    minWidth: 0,
    fontFamily: FONT_FAMILY,
    fontSize: 18,
    paddingHorizontal: 12,
    borderWidth: 1,
    fontVariant: ['tabular-nums'],
  },
  addButton: {
    minWidth: 96,
  },
});
