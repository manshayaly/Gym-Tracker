import { useTheme } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text } from 'react-native';

type Props<T extends string> = {
  options: readonly T[];
  labels: Record<T, string>;
  selected: T | null;
  /** Tapping the selected chip again clears the selection (passes null). */
  onChange: (value: T | null) => void;
};

export function FilterChips<T extends string>({ options, labels, selected, onChange }: Props<T>) {
  const { colors } = useTheme();

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
            style={[
              styles.chip,
              isSelected
                ? { backgroundColor: colors.primary, borderColor: colors.primary }
                : { backgroundColor: colors.card, borderColor: colors.border },
            ]}>
            <Text style={[styles.label, { color: isSelected ? '#fff' : colors.text }]}>
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
    paddingHorizontal: 16,
    gap: 8,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 16,
    borderWidth: StyleSheet.hairlineWidth,
  },
  label: {
    fontSize: 15,
  },
});
