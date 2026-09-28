import { Stack, useLocalSearchParams, useTheme } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

import { SetRow } from '@/components/set-row';
import { getExerciseById } from '@/db/exercises';
import type { Exercise, WorkoutSet } from '@/db/types';
import { getSetsForDay, logSet } from '@/db/workouts';
import { localDate } from '@/lib/dates';
import { EQUIPMENT_LABELS, MUSCLE_GROUP_LABELS } from '@/lib/labels';
import { parseRepsInput, parseWeightInput } from '@/lib/units';

export default function ExerciseDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const db = useSQLiteContext();
  const { colors } = useTheme();
  // undefined = still loading, null = no exercise with this id
  const [exercise, setExercise] = useState<Exercise | null | undefined>(undefined);
  const [todaySets, setTodaySets] = useState<WorkoutSet[]>([]);
  const [weightText, setWeightText] = useState('');
  const [repsText, setRepsText] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getExerciseById(db, id).then(setExercise);
    getSetsForDay(db, id, localDate()).then(setTodaySets);
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
    } catch {
      setError("Couldn't save the set. Please try again.");
    } finally {
      setSaving(false);
    }
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

      <View style={styles.form}>
        <View style={styles.field}>
          <Text style={[styles.label, { color: colors.text }]}>Weight (kg)</Text>
          <TextInput
            value={weightText}
            onChangeText={setWeightText}
            keyboardType="decimal-pad"
            placeholder="0"
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
            placeholder="0"
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
          todaySets.map((set) => <SetRow key={set.id} set={set} />)
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
});
