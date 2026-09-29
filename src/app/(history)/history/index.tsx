import { useFocusEffect, useTheme } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { useCallback, useState } from 'react';
import { SectionList, StyleSheet, Text, View } from 'react-native';

import { getWorkoutSummaries, type WorkoutSummary } from '@/db/history';
import { formatDayLabel, groupByMonth } from '@/lib/dates';

export default function HistoryScreen() {
  const db = useSQLiteContext();
  const { colors } = useTheme();
  // null = not loaded yet, so the empty message doesn't flash before data arrives
  const [workouts, setWorkouts] = useState<WorkoutSummary[] | null>(null);

  // Tabs stay mounted in the background, so reload every time this tab is shown
  // to pick up sets logged on the Exercises tab.
  useFocusEffect(
    useCallback(() => {
      getWorkoutSummaries(db).then(setWorkouts);
    }, [db])
  );

  return (
    <SectionList
      sections={groupByMonth(workouts ?? [])}
      keyExtractor={(item) => item.id}
      contentInsetAdjustmentBehavior="automatic"
      stickySectionHeadersEnabled={false}
      style={{ backgroundColor: colors.background }}
      ListEmptyComponent={
        workouts ? (
          <Text style={[styles.empty, { color: colors.text }]}>
            No workouts yet. Log a set from the Exercises tab.
          </Text>
        ) : null
      }
      renderSectionHeader={({ section }) => (
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          {section.title.toUpperCase()}
        </Text>
      )}
      ItemSeparatorComponent={() => (
        <View style={[styles.separator, { backgroundColor: colors.border }]} />
      )}
      renderItem={({ item }) => (
        <View style={styles.row}>
          <Text style={[styles.date, { color: colors.text }]}>{formatDayLabel(item.date)}</Text>
          <Text style={[styles.details, { color: colors.text }]}>
            {plural(item.exerciseNames.length, 'exercise')} · {plural(item.setCount, 'set')}
          </Text>
          <Text numberOfLines={1} style={[styles.details, { color: colors.text }]}>
            {item.exerciseNames.join(', ')}
          </Text>
        </View>
      )}
    />
  );
}

function plural(count: number, word: string) {
  return `${count} ${word}${count === 1 ? '' : 's'}`;
}

const styles = StyleSheet.create({
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    opacity: 0.6,
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 6,
  },
  row: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 2,
  },
  date: {
    fontSize: 17,
    fontWeight: '600',
  },
  details: {
    fontSize: 14,
    opacity: 0.6,
  },
  separator: {
    height: StyleSheet.hairlineWidth,
    marginLeft: 16,
  },
  empty: {
    textAlign: 'center',
    marginTop: 32,
    marginHorizontal: 32,
    fontSize: 16,
    opacity: 0.6,
  },
});
