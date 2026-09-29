import { StyleSheet, Text, View } from 'react-native';

import { FONT_FAMILY, useAppColors } from '@/theme';

type Props = {
  /** Scales the whole logo; 1 = the barbell is 80 points wide. */
  scale?: number;
};

/**
 * The app logo: a barbell built from sharp rectangles with one red plate,
 * over the spaced-out wordmark. Drawn with plain views so it stays crisp at
 * any size and follows light/dark mode.
 */
export function Logo({ scale = 1 }: Props) {
  const colors = useAppColors();
  const s = (n: number) => n * scale;
  const ink = { backgroundColor: colors.text };

  return (
    <View style={styles.container} accessible accessibilityLabel="Gym Tracker">
      <View style={{ width: s(80), height: s(32) }}>
        {/* bar */}
        <View style={[styles.abs, ink, { left: 0, top: s(14), width: s(80), height: s(4) }]} />
        {/* left: outer plate, then the red inner plate */}
        <View style={[styles.abs, ink, { left: s(10), top: 0, width: s(7), height: s(32) }]} />
        <View
          style={[
            styles.abs,
            { backgroundColor: colors.accent, left: s(19), top: s(5), width: s(5), height: s(22) },
          ]}
        />
        {/* right: inner plate, then outer plate */}
        <View style={[styles.abs, ink, { left: s(56), top: s(5), width: s(5), height: s(22) }]} />
        <View style={[styles.abs, ink, { left: s(63), top: 0, width: s(7), height: s(32) }]} />
      </View>
      <Text
        style={{
          fontFamily: FONT_FAMILY,
          fontWeight: '400',
          fontSize: s(10),
          letterSpacing: s(4),
          marginTop: s(14),
          color: colors.text,
        }}>
        GYM TRACKER
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  abs: {
    position: 'absolute',
  },
});
