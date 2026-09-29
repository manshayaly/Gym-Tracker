import { Stack, useFocusEffect, useLocalSearchParams, useTheme } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { useCallback, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { SetRow } from '@/components/set-row';
import { getWorkoutDetail, type WorkoutDetail } from '@/db/history';
import { formatLongDayLabel } from '@/lib/dates';

export default function WorkoutDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const db = useSQLiteContext();
  const { colors } = useTheme();
  // undefined = still loading, null = no workout with this id
  const [workout, setWorkout] = useState<WorkoutDetail | null | undefined>(undefined);

  // Reload when shown again, in case sets were logged or deleted on another tab.
  useFocusEffect(
    useCallback(() => {
      getWorkoutDetail(db, id).then(setWorkout);
    }, [db, id])
  );

  if (workout === undefined) return null;

  if (workout === null) {
    return (
      <View style={[styles.centered, { backgroundColor: colors.background }]}>
        <Stack.Screen options={{ title: 'Not found' }} />
        <Text style={[styles.muted, { color: colors.text }]}>Workout not found.</Text>
      </View>
    );
  }

  return (
    <ScrollView
      contentInsetAdjustmentBehavior="automatic"
      style={{ backgroundColor: colors.background }}
      contentContainerStyle={styles.content}>
      {/* The date is shown as the page heading, so the header only holds the back button. */}
      <Stack.Screen options={{ title: '' }} />
      <Text style={[styles.heading, { color: colors.text }]}>{formatLongDayLabel(workout.date)}</Text>
      {workout.exercises.map((exercise) => (
        <View
          key={exercise.exerciseId}
          style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.exerciseName, { color: colors.text }]}>{exercise.name}</Text>
          {exercise.sets.map((set) => (
            <SetRow key={set.id} set={set} />
          ))}
        </View>
      ))}
    </ScrollView>
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
  heading: {
    fontSize: 28,
    fontWeight: '700',
  },
  card: {
    padding: 12,
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
    gap: 2,
  },
  exerciseName: {
    fontSize: 17,
    fontWeight: '600',
    marginBottom: 4,
  },
  muted: {
    fontSize: 16,
    opacity: 0.6,
  },
});
