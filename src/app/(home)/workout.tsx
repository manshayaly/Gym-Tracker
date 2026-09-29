import { router, useFocusEffect } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { useCallback, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native';

import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { WorkoutExerciseCard } from '@/components/workout-exercise-card';
import { getWorkoutDetailForDate, type WorkoutDetail } from '@/db/history';
import { endWorkout } from '@/db/workouts';
import { formatHomeDate, localDate } from '@/lib/dates';
import {
  clearPendingExercises,
  getPendingExercises,
  removePendingExercise,
} from '@/lib/pending-exercises';
import { spacing, type, useAppColors } from '@/theme';

export default function WorkoutScreen() {
  const db = useSQLiteContext();
  const colors = useAppColors();
  const [today, setToday] = useState(localDate());
  // undefined = still loading, null = nothing logged today yet
  const [workout, setWorkout] = useState<WorkoutDetail | null | undefined>(undefined);
  const [refreshKey, setRefreshKey] = useState(0);
  const [pending, setPending] = useState(getPendingExercises(localDate()));

  const load = useCallback(() => {
    const date = localDate();
    setToday(date);
    setRefreshKey((key) => key + 1);
    setPending(getPendingExercises(date));
    getWorkoutDetailForDate(db, date).then(setWorkout);
  }, [db]);

  // Reload when shown, e.g. after logging a set from the Exercises tab.
  useFocusEffect(load);

  if (workout === undefined) return null;

  // Logged exercises first (in the order done), then ones added but not yet logged.
  const logged = workout?.exercises ?? [];
  const cards = [
    ...logged.map((e) => ({ exerciseId: e.exerciseId, name: e.name, isPending: false })),
    ...pending
      .filter((p) => !logged.some((e) => e.exerciseId === p.exerciseId))
      .map((p) => ({ ...p, isPending: true })),
  ];

  function confirmEnd() {
    Alert.alert('End workout?', undefined, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'End',
        onPress: async () => {
          const date = localDate();
          // Nothing logged means there's no workout to end — just leave.
          if (logged.length > 0) await endWorkout(db, date);
          clearPendingExercises(date);
          router.back();
        },
      },
    ]);
  }

  function remove(exerciseId: string) {
    removePendingExercise(today, exerciseId);
    setPending(getPendingExercises(today));
  }

  return (
    <ScrollView
      contentInsetAdjustmentBehavior="automatic"
      automaticallyAdjustKeyboardInsets
      keyboardDismissMode="interactive"
      keyboardShouldPersistTaps="handled"
      style={{ backgroundColor: colors.background }}
      contentContainerStyle={styles.content}>
      <Label>{formatHomeDate(today)}</Label>

      {cards.length > 0 ? (
        cards.map((card) => (
          <WorkoutExerciseCard
            key={card.exerciseId}
            exerciseId={card.exerciseId}
            name={card.name}
            refreshKey={refreshKey}
            onChange={load}
            onRemove={card.isPending ? () => remove(card.exerciseId) : undefined}
          />
        ))
      ) : (
        <View style={styles.empty}>
          <Text style={[type.body, { color: colors.textMuted }]}>
            No exercises yet. Add your first one to start logging.
          </Text>
        </View>
      )}

      <Button
        variant="secondary"
        label="+ Add exercise"
        onPress={() => router.push('/add-exercise')}
      />
      <View style={styles.end}>
        <Button label="End workout" onPress={confirmEnd} />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: spacing.md,
    paddingBottom: spacing.xl,
    gap: spacing.md,
  },
  empty: {
    paddingVertical: spacing.lg,
  },
  end: {
    marginTop: spacing.lg,
  },
});
