import { router, useFocusEffect } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { useCallback, useEffect, useState } from 'react';
import { AppState, ScrollView, StyleSheet, View } from 'react-native';

import { Logo } from '@/components/logo';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { getDaySummary } from '@/db/history';
import { formatHomeDate, localDate } from '@/lib/dates';
import { spacing, useAppColors } from '@/theme';

export default function HomeScreen() {
  const db = useSQLiteContext();
  const colors = useAppColors();
  const [today, setToday] = useState(localDate());
  const [summary, setSummary] = useState<Awaited<ReturnType<typeof getDaySummary>> | null>(null);

  const refresh = useCallback(() => {
    const date = localDate();
    setToday(date);
    getDaySummary(db, date).then(setSummary);
  }, [db]);

  // Refresh whenever Home is shown: the date may have rolled over, or sets were logged.
  useFocusEffect(refresh);

  // Also when the app comes back to the foreground, e.g. reopened the next morning
  // while it was left on Home — so yesterday's "Continue" doesn't linger.
  useEffect(() => {
    const subscription = AppState.addEventListener('change', (state) => {
      if (state === 'active') refresh();
    });
    return () => subscription.remove();
  }, [refresh]);

  const started = (summary?.setCount ?? 0) > 0;
  const ended = started && !!summary?.ended;
  const workoutId = summary?.workoutId;

  return (
    <ScrollView
      contentInsetAdjustmentBehavior="automatic"
      style={{ backgroundColor: colors.background }}
      contentContainerStyle={styles.content}>
      <View style={styles.brand}>
        <Logo scale={1.6} />
        <Label style={styles.date}>{formatHomeDate(today)}</Label>
      </View>

      <View style={styles.actions}>
        {ended && (
          <Label style={[styles.summary, styles.complete, { color: colors.text }]}>
            Workout complete
          </Label>
        )}
        {started && summary && (
          <Label style={styles.summary}>
            {plural(summary.exerciseCount, 'exercise')} · {plural(summary.setCount, 'set')}
          </Label>
        )}
        {ended && workoutId ? (
          <Button
            variant="secondary"
            label="View workout"
            onPress={() =>
              router.push({ pathname: '/workout-summary/[id]', params: { id: workoutId } })
            }
          />
        ) : (
          <Button
            label={started ? 'Continue' : "Let's train"}
            onPress={() => router.push('/workout')}
          />
        )}
      </View>
    </ScrollView>
  );
}

function plural(count: number, word: string) {
  return `${count} ${word}${count === 1 ? '' : 's'}`;
}

const styles = StyleSheet.create({
  content: {
    flexGrow: 1,
    justifyContent: 'space-between',
    padding: spacing.lg,
  },
  brand: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.lg,
  },
  date: {
    fontSize: 13,
  },
  actions: {
    gap: spacing.md,
    paddingBottom: spacing.xl,
  },
  summary: {
    textAlign: 'center',
  },
  complete: {
    fontSize: 13,
  },
});
