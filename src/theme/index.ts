import { DarkTheme, DefaultTheme } from 'expo-router';
import { useColorScheme, type TextStyle } from 'react-native';

/**
 * The app's visual language, adapted from DESIGN.md (see CLAUDE.md → Design).
 * Screens take every color, font and text style from here.
 */

export const FONT_FAMILY = 'Avenir Next';

const light = {
  /** Page background. */
  background: '#f4f4f4',
  /** Cards and inputs sit on the page with a hairline border. */
  surface: '#f4f4f4',
  border: '#c4c4c4',
  separator: '#e5e5e5',
  text: '#000000',
  textMuted: '#595959',
  /** Strong neutral emphasis (selected chips): ink fill with canvas text. */
  inkFill: '#000000',
  onInkFill: '#f4f4f4',
  pressed: '#e5e5e5',
  disabledFill: '#c4c4c4',
  disabledText: '#686868',
};

const dark: typeof light = {
  background: '#1c1f2a',
  surface: '#292b35',
  border: '#3d404c',
  separator: '#33363f',
  text: '#f4f4f4',
  // Lighter than the guide's #595959, which is unreadable on charcoal.
  textMuted: '#a0a3ad',
  inkFill: '#f4f4f4',
  onInkFill: '#1c1f2a',
  pressed: '#33363f',
  disabledFill: '#3d404c',
  disabledText: '#8a8d97',
};

const shared = {
  /** Reserved for primary actions only (Save set, Save weight). */
  accent: '#ba0816',
  accentPressed: '#8e0d25',
  onAccent: '#f4f4f4',
  error: '#eb143d',
};

export type AppColors = typeof light & typeof shared;

export function useAppColors(): AppColors {
  const scheme = useColorScheme();
  return { ...(scheme === 'dark' ? dark : light), ...shared };
}

const regular: TextStyle = { fontFamily: FONT_FAMILY, fontWeight: '400' };

/** Text styles. Weight is always 400 — hierarchy comes from size and tracking. */
export const type = {
  display: { ...regular, fontSize: 28, lineHeight: 34 },
  number: { ...regular, fontSize: 28, lineHeight: 34, fontVariant: ['tabular-nums'] },
  title: { ...regular, fontSize: 18, lineHeight: 23 },
  body: { ...regular, fontSize: 16, lineHeight: 22 },
  bodySmall: { ...regular, fontSize: 14, lineHeight: 20 },
  /** Uppercase "timing display" labels: section titles, field labels, tags. */
  label: { ...regular, fontSize: 11, lineHeight: 16, letterSpacing: 1.5, textTransform: 'uppercase' },
  button: { ...regular, fontSize: 14, lineHeight: 20, letterSpacing: 1.5, textTransform: 'uppercase' },
} satisfies Record<string, TextStyle>;

export const spacing = { xs: 4, sm: 8, md: 16, lg: 24, xl: 48 } as const;

/** Navigation theme so headers, backgrounds and back buttons match. */
export function navigationTheme(scheme: 'light' | 'dark') {
  const base = scheme === 'dark' ? DarkTheme : DefaultTheme;
  const colors = scheme === 'dark' ? dark : light;
  const font = { fontFamily: FONT_FAMILY, fontWeight: '400' as const };
  return {
    ...base,
    colors: {
      ...base.colors,
      primary: colors.text,
      background: colors.background,
      card: colors.background,
      text: colors.text,
      border: colors.separator,
      notification: shared.error,
    },
    fonts: { regular: font, medium: font, bold: font, heavy: font },
  };
}

/** Header styling shared by every stack. */
export const headerTitleStyles = {
  headerTitleStyle: { fontFamily: FONT_FAMILY, fontWeight: '400' as const },
  headerLargeTitleStyle: { fontFamily: FONT_FAMILY, fontWeight: '400' as const },
  headerBackTitleStyle: { fontFamily: FONT_FAMILY },
  headerShadowVisible: false,
  headerLargeTitleShadowVisible: false,
};
