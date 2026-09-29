import { Stack } from 'expo-router';

export default function HistoryLayout() {
  return (
    <Stack>
      <Stack.Screen name="history/index" options={{ title: 'History', headerLargeTitle: true }} />
    </Stack>
  );
}
