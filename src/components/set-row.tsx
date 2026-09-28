import { useTheme } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

import type { WorkoutSet } from '@/db/types';
import { formatWeight } from '@/lib/units';

/** One logged set, e.g. "2   62.5 kg × 8". */
export function SetRow({ set }: { set: WorkoutSet }) {
  const { colors } = useTheme();

  return (
    <View style={styles.row}>
      <Text style={[styles.number, { color: colors.text }]}>{set.set_number}</Text>
      <Text style={[styles.value, { color: colors.text }]}>
        {formatWeight(set.weight_kg)} × {set.reps}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'baseline',
    paddingVertical: 6,
  },
  number: {
    width: 28,
    fontSize: 15,
    opacity: 0.5,
    fontVariant: ['tabular-nums'],
  },
  value: {
    fontSize: 17,
    fontVariant: ['tabular-nums'],
  },
});
