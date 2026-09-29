import { StyleSheet, Text, View } from 'react-native';

import { spacing, type, useAppColors } from '@/theme';

// Placeholder — the workout screen is built in the next step.
export default function WorkoutScreen() {
  const colors = useAppColors();
  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={[type.body, { color: colors.textMuted }]}>
        The workout screen is coming in the next step.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.lg,
  },
});
