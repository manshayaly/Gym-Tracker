import { useSQLiteContext } from 'expo-sqlite';
import { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

export default function Index() {
  const db = useSQLiteContext();
  const [count, setCount] = useState<number | null>(null);

  useEffect(() => {
    db.getFirstAsync<{ count: number }>('SELECT COUNT(*) AS count FROM exercises').then((row) =>
      setCount(row?.count ?? 0)
    );
  }, [db]);

  return (
    <View style={styles.container}>
      <Text style={styles.text}>
        {count === null ? 'Loading…' : `${count} exercises loaded`}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontSize: 20,
  },
});
