import { Stack } from 'expo-router';

export default function BodyLayout() {
  return (
    <Stack>
      <Stack.Screen name="body/index" options={{ title: 'Body', headerLargeTitle: true }} />
    </Stack>
  );
}
