import { router } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { useEffect, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { FilterChips } from '@/components/filter-chips';
import { Label } from '@/components/ui/label';
import { getAllExercises } from '@/db/exercises';
import { EQUIPMENT, MUSCLE_GROUPS, type Equipment, type Exercise, type MuscleGroup } from '@/db/types';
import { localDate } from '@/lib/dates';
import { filterExercises } from '@/lib/filter-exercises';
import { EQUIPMENT_LABELS, MUSCLE_GROUP_LABELS } from '@/lib/labels';
import { addPendingExercise } from '@/lib/pending-exercises';
import { FONT_FAMILY, spacing, type, useAppColors } from '@/theme';

/** Sheet for picking an exercise to add to today's workout. */
export default function AddExerciseScreen() {
  const db = useSQLiteContext();
  const colors = useAppColors();
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [query, setQuery] = useState('');
  const [muscleGroup, setMuscleGroup] = useState<MuscleGroup | null>(null);
  const [equipment, setEquipment] = useState<Equipment | null>(null);

  useEffect(() => {
    getAllExercises(db).then(setExercises);
  }, [db]);

  const visible = filterExercises(exercises, { query, muscleGroup, equipment });

  function pick(exercise: Exercise) {
    // Ignored if it's already pending; the workout screen also skips
    // exercises that already have sets today, so there are no duplicates.
    addPendingExercise(localDate(), { exerciseId: exercise.id, name: exercise.name });
    router.back();
  }

  return (
    <FlatList
      data={visible}
      keyExtractor={(item) => item.id}
      contentInsetAdjustmentBehavior="automatic"
      keyboardDismissMode="on-drag"
      keyboardShouldPersistTaps="handled"
      style={{ backgroundColor: colors.background }}
      ListHeaderComponent={
        <View style={styles.header}>
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="Search exercises"
            placeholderTextColor={colors.textMuted}
            autoCapitalize="none"
            autoCorrect={false}
            autoFocus
            clearButtonMode="while-editing"
            accessibilityLabel="Search exercises"
            style={[
              styles.search,
              { color: colors.text, backgroundColor: colors.surface, borderColor: colors.border },
            ]}
          />
          <FilterChips
            options={MUSCLE_GROUPS}
            labels={MUSCLE_GROUP_LABELS}
            selected={muscleGroup}
            onChange={setMuscleGroup}
          />
          <FilterChips
            options={EQUIPMENT}
            labels={EQUIPMENT_LABELS}
            selected={equipment}
            onChange={setEquipment}
          />
        </View>
      }
      ListEmptyComponent={
        exercises.length > 0 ? (
          <Text style={[type.body, styles.empty, { color: colors.textMuted }]}>
            No exercises match.
          </Text>
        ) : null
      }
      ItemSeparatorComponent={() => (
        <View style={[styles.separator, { backgroundColor: colors.separator }]} />
      )}
      renderItem={({ item }) => (
        <Pressable
          onPress={() => pick(item)}
          accessibilityRole="button"
          accessibilityHint="Adds this exercise to today's workout"
          style={({ pressed }) => [styles.row, pressed && { backgroundColor: colors.pressed }]}>
          <Text style={[type.body, { color: colors.text }]}>{item.name}</Text>
          <Label>
            {MUSCLE_GROUP_LABELS[item.muscle_group]} · {EQUIPMENT_LABELS[item.equipment]}
          </Label>
        </Pressable>
      )}
    />
  );
}

const styles = StyleSheet.create({
  header: {
    gap: spacing.sm,
    paddingVertical: spacing.md,
  },
  search: {
    marginHorizontal: spacing.md,
    marginBottom: spacing.xs,
    height: 44,
    paddingHorizontal: 12,
    borderWidth: 1,
    fontFamily: FONT_FAMILY,
    fontSize: 16,
  },
  row: {
    paddingHorizontal: spacing.md,
    paddingVertical: 14,
    gap: spacing.xs,
  },
  separator: {
    height: StyleSheet.hairlineWidth,
    marginLeft: spacing.md,
  },
  empty: {
    textAlign: 'center',
    marginTop: 32,
  },
});
