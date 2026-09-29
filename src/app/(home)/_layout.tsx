import { Stack } from 'expo-router';

import { headerTitleStyles } from '@/theme';

export default function HomeLayout() {
  return (
    <Stack screenOptions={headerTitleStyles}>
      {/* Home is a clean page: logo, date and Start — no header bar. */}
      <Stack.Screen name="index" options={{ headerShown: false, title: 'Home' }} />
      <Stack.Screen name="workout" options={{ title: "Today's workout" }} />
      <Stack.Screen name="workout-summary/[id]" options={{ title: '' }} />
      {/* Slides up as a sheet; swipe down to close without adding anything. */}
      <Stack.Screen
        name="add-exercise"
        options={{ title: 'Add exercise', presentation: 'modal' }}
      />
    </Stack>
  );
}
