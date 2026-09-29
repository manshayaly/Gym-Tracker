import { useTheme } from 'expo-router';
import { Pressable, StyleSheet, Text } from 'react-native';

import type { WorkoutSet } from '@/db/types';
import { formatWeight } from '@/lib/units';

type Props = {
  set: WorkoutSet;
  /** When provided, pressing and holding the row calls this (e.g. to delete). */
  onLongPress?: () => void;
};

/** One logged set, e.g. "2   62.5 kg × 8". */
export function SetRow({ set, onLongPress }: Props) {
  const { colors } = useTheme();

  return (
    <Pressable
      onLongPress={onLongPress}
      disabled={!onLongPress}
      accessibilityHint={onLongPress ? 'Press and hold to delete' : undefined}
      style={({ pressed }) => [styles.row, pressed && { backgroundColor: colors.border }]}>
      <Text style={[styles.number, { color: colors.text }]}>{set.set_number}</Text>
      <Text style={[styles.value, { color: colors.text }]}>
        {formatWeight(set.weight_kg)} × {set.reps}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'baseline',
    paddingVertical: 6,
    borderRadius: 6,
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
