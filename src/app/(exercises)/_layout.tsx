import { Stack } from 'expo-router';

import { headerTitleStyles } from '@/theme';

export default function ExercisesLayout() {
  return (
    <Stack screenOptions={headerTitleStyles}>
      <Stack.Screen name="index" options={{ title: 'Exercises', headerLargeTitle: true }} />
    </Stack>
  );
}
