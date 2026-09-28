import { DarkTheme, DefaultTheme, ThemeProvider } from 'expo-router';
import { NativeTabs } from 'expo-router/unstable-native-tabs';
import { SQLiteProvider } from 'expo-sqlite';
import { useColorScheme } from 'react-native';

import { migrateDbIfNeeded } from '@/db/migrations';

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <SQLiteProvider databaseName="gym-tracker.db" onInit={migrateDbIfNeeded}>
        <NativeTabs>
          <NativeTabs.Trigger name="(exercises)">
            <NativeTabs.Trigger.Label>Exercises</NativeTabs.Trigger.Label>
            <NativeTabs.Trigger.Icon sf="dumbbell.fill" />
          </NativeTabs.Trigger>
        </NativeTabs>
      </SQLiteProvider>
    </ThemeProvider>
  );
}
