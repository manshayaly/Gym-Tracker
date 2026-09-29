import { Stack } from 'expo-router';

import { headerTitleStyles } from '@/theme';

export default function BodyLayout() {
  return (
    <Stack screenOptions={headerTitleStyles}>
      <Stack.Screen name="body/index" options={{ title: 'Body', headerLargeTitle: true }} />
    </Stack>
  );
}
