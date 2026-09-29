import { useFocusEffect } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { useCallback, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { Label } from '@/components/ui/label';
import { WorkoutExerciseCard } from '@/components/workout-exercise-card';
import { getWorkoutDetailForDate, type WorkoutDetail } from '@/db/history';
import { formatHomeDate, localDate } from '@/lib/dates';
import { spacing, type, useAppColors } from '@/theme';

export default function WorkoutScreen() {
  const db = useSQLiteContext();
  const colors = useAppColors();
  const [today, setToday] = useState(localDate());
  // undefined = still loading, null = nothing logged today yet
  const [workout, setWorkout] = useState<WorkoutDetail | null | undefined>(undefined);
  const [refreshKey, setRefreshKey] = useState(0);

  const load = useCallback(() => {
    const date = localDate();
    setToday(date);
    setRefreshKey((key) => key + 1);
    getWorkoutDetailForDate(db, date).then(setWorkout);
  }, [db]);

  // Reload when shown, e.g. after logging a set from the Exercises tab.
  useFocusEffect(load);

  if (workout === undefined) return null;

  return (
    <ScrollView
      contentInsetAdjustmentBehavior="automatic"
      automaticallyAdjustKeyboardInsets
      keyboardDismissMode="interactive"
      keyboardShouldPersistTaps="handled"
      style={{ backgroundColor: colors.background }}
      contentContainerStyle={styles.content}>
      <Label>{formatHomeDate(today)}</Label>

      {workout && workout.exercises.length > 0 ? (
        workout.exercises.map((exercise) => (
          <WorkoutExerciseCard
            key={exercise.exerciseId}
            exerciseId={exercise.exerciseId}
            name={exercise.name}
            refreshKey={refreshKey}
            onChange={load}
          />
        ))
      ) : (
        <View style={styles.empty}>
          <Text style={[type.body, { color: colors.textMuted }]}>
            No exercises yet today. Log a set from the Exercises tab and it shows up here —
            adding exercises from this screen comes next.
          </Text>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: spacing.md,
    gap: spacing.md,
  },
  empty: {
    paddingVertical: spacing.xl,
  },
});
