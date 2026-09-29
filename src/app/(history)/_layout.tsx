import { Stack } from 'expo-router';

import { headerTitleStyles } from '@/theme';

export default function HistoryLayout() {
  return (
    <Stack screenOptions={headerTitleStyles}>
      <Stack.Screen name="history/index" options={{ title: 'History', headerLargeTitle: true }} />
    </Stack>
  );
}
