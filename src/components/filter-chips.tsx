import { Pressable, ScrollView, StyleSheet, Text } from 'react-native';

import { spacing, type, useAppColors } from '@/theme';

type Props<T extends string> = {
  options: readonly T[];
  labels: Record<T, string>;
  selected: T | null;
  /** Tapping the selected chip again clears the selection (passes null). */
  onChange: (value: T | null) => void;
};

export function FilterChips<T extends string>({ options, labels, selected, onChange }: Props<T>) {
  const colors = useAppColors();

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.container}>
      {options.map((option) => {
        const isSelected = option === selected;
        return (
          <Pressable
            key={option}
            accessibilityRole="button"
            accessibilityState={{ selected: isSelected }}
            onPress={() => onChange(isSelected ? null : option)}
            style={({ pressed }) => [
              styles.chip,
              isSelected
                ? { backgroundColor: colors.inkFill, borderColor: colors.inkFill }
                : {
                    backgroundColor: pressed ? colors.pressed : colors.surface,
                    borderColor: colors.border,
                  },
            ]}>
            <Text style={[type.label, { color: isSelected ? colors.onInkFill : colors.text }]}>
              {labels[option]}
            </Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: spacing.md,
    gap: spacing.sm,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderWidth: StyleSheet.hairlineWidth,
  },
});
