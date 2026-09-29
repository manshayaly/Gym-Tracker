import { Stack, useLocalSearchParams, useTheme } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { useEffect, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

import { SetRow } from '@/components/set-row';
import { getExerciseById } from '@/db/exercises';
import type { Exercise, WorkoutSet } from '@/db/types';
import { deleteSet, getLastPerformance, getSetsForDay, logSet } from '@/db/workouts';
import { formatDayLabel, localDate } from '@/lib/dates';
import { EQUIPMENT_LABELS, MUSCLE_GROUP_LABELS } from '@/lib/labels';
import { pickPrefillSet } from '@/lib/prefill';
import { formatWeight, parseRepsInput, parseWeightInput, weightToInput } from '@/lib/units';

export default function ExerciseDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const db = useSQLiteContext();
  const { colors } = useTheme();
  // undefined = still loading, null = no exercise with this id
  const [exercise, setExercise] = useState<Exercise | null | undefined>(undefined);
  const [todaySets, setTodaySets] = useState<WorkoutSet[]>([]);
  const [lastTime, setLastTime] = useState<{ date: string; sets: WorkoutSet[] } | null>(null);
  const [weightText, setWeightText] = useState('');
  const [repsText, setRepsText] = useState('');
  // Previous numbers, shown as grey placeholder hints so the boxes stay empty to type into.
  const [hint, setHint] = useState<{ weight: string; reps: string } | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      const today = localDate();
      const [loadedExercise, loadedToday, loadedLastTime] = await Promise.all([
        getExerciseById(db, id),
        getSetsForDay(db, id, today),
        getLastPerformance(db, id, today),
      ]);
      setTodaySets(loadedToday);
      setLastTime(loadedLastTime);
      const previous = pickPrefillSet(loadedToday, loadedLastTime?.sets ?? []);
      if (previous) {
        setHint({ weight: weightToInput(previous.weight_kg), reps: String(previous.reps) });
      }
      setExercise(loadedExercise);
    }
    load();
  }, [db, id]);

  const weightKg = parseWeightInput(weightText);
  const reps = parseRepsInput(repsText);
  const canSave = weightKg !== null && reps !== null && !saving;

  async function handleSave() {
    if (weightKg === null || reps === null) return;
    setSaving(true);
    setError(null);
    try {
      // Read the date at save time, in case the screen stayed open past midnight.
      const date = localDate();
      await logSet(db, { exerciseId: id, weightKg, reps, date });
      setTodaySets(await getSetsForDay(db, id, date));
      setHint({ weight: weightToInput(weightKg), reps: String(reps) });
      setWeightText('');
      setRepsText('');
    } catch {
      setError("Couldn't save the set. Please try again.");
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
            setTodaySets(await getSetsForDay(db, id, localDate()));
          } catch {
            setError("Couldn't delete the set. Please try again.");
          }
        },
      },
    ]);
  }

  if (exercise === undefined) return null;

  if (exercise === null) {
    return (
      <View style={[styles.centered, { backgroundColor: colors.background }]}>
        <Stack.Screen options={{ title: 'Not found' }} />
        <Text style={[styles.muted, { color: colors.text }]}>Exercise not found.</Text>
      </View>
    );
  }

  const inputStyle = [
    styles.input,
    { color: colors.text, backgroundColor: colors.card, borderColor: colors.border },
  ];

  return (
    <ScrollView
      contentInsetAdjustmentBehavior="automatic"
      automaticallyAdjustKeyboardInsets
      keyboardDismissMode="interactive"
      keyboardShouldPersistTaps="handled"
      style={{ backgroundColor: colors.background }}
      contentContainerStyle={styles.content}>
      {/* The name is shown as the page heading, so the header only holds the back button. */}
      <Stack.Screen options={{ title: '' }} />
      <Text style={[styles.name, { color: colors.text }]}>{exercise.name}</Text>
      <View style={styles.tags}>
        <Tag label={MUSCLE_GROUP_LABELS[exercise.muscle_group]} />
        <Tag label={EQUIPMENT_LABELS[exercise.equipment]} />
      </View>

      {lastTime && (
        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            {formatDayLabel(lastTime.date).toUpperCase()}
          </Text>
          {lastTime.sets.map((set) => (
            <SetRow key={set.id} set={set} />
          ))}
        </View>
      )}

      <View style={styles.form}>
        <View style={styles.field}>
          <Text style={[styles.label, { color: colors.text }]}>Weight (kg)</Text>
          <TextInput
            value={weightText}
            onChangeText={setWeightText}
            keyboardType="decimal-pad"
            placeholder={hint?.weight ?? '0'}
            placeholderTextColor="#8e8e93"
            style={inputStyle}
            accessibilityLabel="Weight in kilograms"
          />
        </View>
        <View style={styles.field}>
          <Text style={[styles.label, { color: colors.text }]}>Reps</Text>
          <TextInput
            value={repsText}
            onChangeText={setRepsText}
            keyboardType="number-pad"
            placeholder={hint?.reps ?? '0'}
            placeholderTextColor="#8e8e93"
            style={inputStyle}
            accessibilityLabel="Reps"
          />
        </View>
      </View>
      <Pressable
        accessibilityRole="button"
        disabled={!canSave}
        onPress={handleSave}
        style={({ pressed }) => [
          styles.button,
          { backgroundColor: colors.primary, opacity: !canSave ? 0.4 : pressed ? 0.7 : 1 },
        ]}>
        <Text style={styles.buttonLabel}>Save set</Text>
      </Pressable>
      {error && <Text style={[styles.error, { color: colors.notification }]}>{error}</Text>}

      <View>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>TODAY</Text>
        {todaySets.length === 0 ? (
          <Text style={[styles.muted, { color: colors.text }]}>No sets yet today.</Text>
        ) : (
          <>
            {todaySets.map((set) => (
              <SetRow key={set.id} set={set} onLongPress={() => confirmDelete(set)} />
            ))}
            <Text style={[styles.hint, { color: colors.text }]}>
              Press and hold a set to delete it
            </Text>
          </>
        )}
      </View>
    </ScrollView>
  );
}

function Tag({ label }: { label: string }) {
  const { colors } = useTheme();
  return (
    <View style={[styles.tag, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <Text style={[styles.tagLabel, { color: colors.text }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: 16,
    gap: 16,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  name: {
    fontSize: 28,
    fontWeight: '700',
  },
  tags: {
    flexDirection: 'row',
    gap: 8,
  },
  tag: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
  },
  tagLabel: {
    fontSize: 14,
  },
  card: {
    padding: 12,
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
  },
  form: {
    flexDirection: 'row',
    gap: 12,
  },
  field: {
    flex: 1,
    gap: 6,
  },
  label: {
    fontSize: 14,
    opacity: 0.6,
  },
  input: {
    fontSize: 22,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: StyleSheet.hairlineWidth,
    fontVariant: ['tabular-nums'],
  },
  button: {
    alignItems: 'center',
    paddingVertical: 14,
    borderRadius: 12,
  },
  buttonLabel: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '600',
  },
  error: {
    fontSize: 15,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    opacity: 0.6,
    marginBottom: 4,
  },
  muted: {
    fontSize: 16,
    opacity: 0.6,
  },
  hint: {
    fontSize: 13,
    opacity: 0.45,
    marginTop: 8,
  },
});
