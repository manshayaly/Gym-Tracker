import { Link, Stack } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { useEffect, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';

import { FilterChips } from '@/components/filter-chips';
import { Label } from '@/components/ui/label';
import { getAllExercises } from '@/db/exercises';
import { EQUIPMENT, MUSCLE_GROUPS, type Equipment, type Exercise, type MuscleGroup } from '@/db/types';
import { filterExercises } from '@/lib/filter-exercises';
import { EQUIPMENT_LABELS, MUSCLE_GROUP_LABELS } from '@/lib/labels';
import { spacing, type, useAppColors } from '@/theme';

export default function ExercisesScreen() {
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

  return (
    <>
      <Stack.SearchBar
        placeholder="Search exercises"
        autoCapitalize="none"
        hideWhenScrolling={false}
        onChangeText={(e) => setQuery(e.nativeEvent.text)}
        onCancelButtonPress={() => setQuery('')}
      />
      <FlatList
        data={visible}
        keyExtractor={(item) => item.id}
        contentInsetAdjustmentBehavior="automatic"
        keyboardDismissMode="on-drag"
        keyboardShouldPersistTaps="handled"
        style={{ backgroundColor: colors.background }}
        ListHeaderComponent={
          <View style={styles.filters}>
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
          <Link href={{ pathname: '/exercise/[id]', params: { id: item.id } }} asChild>
            <Pressable
              style={({ pressed }) => [styles.row, pressed && { backgroundColor: colors.pressed }]}>
              <Text style={[type.body, { color: colors.text }]}>{item.name}</Text>
              <Label>
                {MUSCLE_GROUP_LABELS[item.muscle_group]} · {EQUIPMENT_LABELS[item.equipment]}
              </Label>
            </Pressable>
          </Link>
        )}
      />
    </>
  );
}

const styles = StyleSheet.create({
  filters: {
    gap: spacing.sm,
    paddingVertical: spacing.sm,
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
