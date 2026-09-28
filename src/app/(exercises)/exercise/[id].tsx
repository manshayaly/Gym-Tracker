import { Stack, useLocalSearchParams, useTheme } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { getExerciseById } from '@/db/exercises';
import type { Exercise } from '@/db/types';
import { EQUIPMENT_LABELS, MUSCLE_GROUP_LABELS } from '@/lib/labels';

export default function ExerciseDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const db = useSQLiteContext();
  const { colors } = useTheme();
  // undefined = still loading, null = no exercise with this id
  const [exercise, setExercise] = useState<Exercise | null | undefined>(undefined);

  useEffect(() => {
    getExerciseById(db, id).then(setExercise);
  }, [db, id]);

  if (exercise === undefined) return null;

  if (exercise === null) {
    return (
      <View style={[styles.centered, { backgroundColor: colors.background }]}>
        <Stack.Screen options={{ title: 'Not found' }} />
        <Text style={[styles.muted, { color: colors.text }]}>Exercise not found.</Text>
      </View>
    );
  }

  return (
    <ScrollView
      contentInsetAdjustmentBehavior="automatic"
      style={{ backgroundColor: colors.background }}
      contentContainerStyle={styles.content}>
      {/* The name is shown as the page heading, so the header only holds the back button. */}
      <Stack.Screen options={{ title: '' }} />
      <Text style={[styles.name, { color: colors.text }]}>{exercise.name}</Text>
      <View style={styles.tags}>
        <Tag label={MUSCLE_GROUP_LABELS[exercise.muscle_group]} />
        <Tag label={EQUIPMENT_LABELS[exercise.equipment]} />
      </View>
      <Text style={[styles.muted, { color: colors.text }]}>
        Set logging for this exercise is coming next.
      </Text>
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
  muted: {
    fontSize: 16,
    opacity: 0.6,
  },
});
