import { Stack } from 'expo-router';

export default function ExercisesLayout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ title: 'Exercises', headerLargeTitle: true }} />
    </Stack>
  );
}
