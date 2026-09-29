import { ThemeProvider } from 'expo-router';
import { NativeTabs } from 'expo-router/unstable-native-tabs';
import { SQLiteProvider } from 'expo-sqlite';
import { useColorScheme } from 'react-native';

import { migrateDbIfNeeded } from '@/db/migrations';
import { FONT_FAMILY, navigationTheme, useAppColors } from '@/theme';

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const colors = useAppColors();

  return (
    <ThemeProvider value={navigationTheme(colorScheme === 'dark' ? 'dark' : 'light')}>
      <SQLiteProvider databaseName="gym-tracker.db" onInit={migrateDbIfNeeded}>
        <NativeTabs
          tintColor={colors.text}
          labelStyle={{ fontFamily: FONT_FAMILY }}>
          <NativeTabs.Trigger name="(home)">
            <NativeTabs.Trigger.Label>Home</NativeTabs.Trigger.Label>
            <NativeTabs.Trigger.Icon sf="house.fill" />
          </NativeTabs.Trigger>
          <NativeTabs.Trigger name="(exercises)">
            <NativeTabs.Trigger.Label>Exercises</NativeTabs.Trigger.Label>
            <NativeTabs.Trigger.Icon sf="dumbbell.fill" />
          </NativeTabs.Trigger>
          <NativeTabs.Trigger name="(history)">
            <NativeTabs.Trigger.Label>History</NativeTabs.Trigger.Label>
            <NativeTabs.Trigger.Icon sf="clock.arrow.circlepath" />
          </NativeTabs.Trigger>
          <NativeTabs.Trigger name="(body)">
            <NativeTabs.Trigger.Label>Body</NativeTabs.Trigger.Label>
            <NativeTabs.Trigger.Icon sf="scalemass.fill" />
          </NativeTabs.Trigger>
        </NativeTabs>
      </SQLiteProvider>
    </ThemeProvider>
  );
}
