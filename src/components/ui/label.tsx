import { Text, type TextProps } from 'react-native';

import { type, useAppColors } from '@/theme';

/** Small uppercase, letter-spaced label: section titles, field labels, tags. */
export function Label({ style, ...props }: TextProps) {
  const colors = useAppColors();
  return <Text {...props} style={[type.label, { color: colors.textMuted }, style]} />;
}
