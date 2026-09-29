import { Stack } from 'expo-router';

import { headerTitleStyles } from '@/theme';

export default function ExercisesLayout() {
  return (
    <Stack screenOptions={headerTitleStyles}>
      <Stack.Screen name="exercises/index" options={{ title: 'Exercises', headerLargeTitle: true }} />
    </Stack>
  );
}
