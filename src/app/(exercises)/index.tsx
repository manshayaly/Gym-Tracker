import { useTheme } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { useEffect, useState } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';

import { getAllExercises } from '@/db/exercises';
import type { Exercise } from '@/db/types';
import { EQUIPMENT_LABELS, MUSCLE_GROUP_LABELS } from '@/lib/labels';

export default function ExercisesScreen() {
  const db = useSQLiteContext();
  const { colors } = useTheme();
  const [exercises, setExercises] = useState<Exercise[]>([]);

  useEffect(() => {
    getAllExercises(db).then(setExercises);
  }, [db]);

  return (
    <FlatList
      data={exercises}
      keyExtractor={(item) => item.id}
      contentInsetAdjustmentBehavior="automatic"
      style={{ backgroundColor: colors.background }}
      ItemSeparatorComponent={() => (
        <View style={[styles.separator, { backgroundColor: colors.border }]} />
      )}
      renderItem={({ item }) => (
        <View style={styles.row}>
          <Text style={[styles.name, { color: colors.text }]}>{item.name}</Text>
          <Text style={[styles.details, { color: colors.text }]}>
            {MUSCLE_GROUP_LABELS[item.muscle_group]} · {EQUIPMENT_LABELS[item.equipment]}
          </Text>
        </View>
      )}
    />
  );
}

const styles = StyleSheet.create({
  row: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 2,
  },
  name: {
    fontSize: 17,
  },
  details: {
    fontSize: 14,
    opacity: 0.6,
  },
  separator: {
    height: StyleSheet.hairlineWidth,
    marginLeft: 16,
  },
});
