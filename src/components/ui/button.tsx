import { Pressable, StyleSheet, Text, type PressableProps } from 'react-native';

import { type, useAppColors } from '@/theme';

type Props = Omit<PressableProps, 'children' | 'style'> & {
  label: string;
  /** "accent" is red and reserved for the screen's primary action. */
  variant?: 'accent' | 'secondary';
};

/** Square-cornered button with an uppercase, letter-spaced label. */
export function Button({ label, variant = 'accent', disabled, ...props }: Props) {
  const colors = useAppColors();
  const accent = variant === 'accent';

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: !!disabled }}
      disabled={disabled}
      {...props}
      style={({ pressed }) => [
        styles.button,
        accent
          ? {
              backgroundColor: disabled
                ? colors.disabledFill
                : pressed
                  ? colors.accentPressed
                  : colors.accent,
              borderColor: 'transparent',
            }
          : {
              backgroundColor: pressed ? colors.pressed : 'transparent',
              borderColor: disabled ? colors.disabledFill : colors.text,
            },
      ]}>
      <Text
        style={[
          type.button,
          {
            color: disabled ? colors.disabledText : accent ? colors.onAccent : colors.text,
          },
        ]}>
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 17,
    paddingBottom: 15,
    paddingHorizontal: 24,
    borderWidth: 1,
  },
});
