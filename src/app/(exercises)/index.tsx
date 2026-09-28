import { Link, Stack, useTheme } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { useEffect, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';

import { FilterChips } from '@/components/filter-chips';
import { getAllExercises } from '@/db/exercises';
import { EQUIPMENT, MUSCLE_GROUPS, type Equipment, type Exercise, type MuscleGroup } from '@/db/types';
import { filterExercises } from '@/lib/filter-exercises';
import { EQUIPMENT_LABELS, MUSCLE_GROUP_LABELS } from '@/lib/labels';

export default function ExercisesScreen() {
  const db = useSQLiteContext();
  const { colors } = useTheme();
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
            <Text style={[styles.empty, { color: colors.text }]}>No exercises match.</Text>
          ) : null
        }
        ItemSeparatorComponent={() => (
          <View style={[styles.separator, { backgroundColor: colors.border }]} />
        )}
        renderItem={({ item }) => (
          <Link href={{ pathname: '/exercise/[id]', params: { id: item.id } }} asChild>
            <Pressable
              style={({ pressed }) => [styles.row, pressed && { backgroundColor: colors.border }]}>
              <Text style={[styles.name, { color: colors.text }]}>{item.name}</Text>
              <Text style={[styles.details, { color: colors.text }]}>
                {MUSCLE_GROUP_LABELS[item.muscle_group]} · {EQUIPMENT_LABELS[item.equipment]}
              </Text>
            </Pressable>
          </Link>
        )}
      />
    </>
  );
}

const styles = StyleSheet.create({
  filters: {
    gap: 8,
    paddingVertical: 8,
  },
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
  empty: {
    textAlign: 'center',
    marginTop: 32,
    fontSize: 16,
    opacity: 0.6,
  },
});
