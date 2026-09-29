import { useFocusEffect, useTheme } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { useCallback, useState } from 'react';
import { Alert, FlatList, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import {
  deleteBodyweightEntry,
  getBodyweightEntries,
  saveBodyweight,
  withChanges,
} from '@/db/bodyweight';
import type { BodyweightEntry } from '@/db/types';
import { formatDayLabel, localDate } from '@/lib/dates';
import { formatWeight, formatWeightChange, parseWeightInput, weightToInput } from '@/lib/units';

export default function BodyScreen() {
  const db = useSQLiteContext();
  const { colors } = useTheme();
  // null = not loaded yet, so the empty message doesn't flash before data arrives
  const [entries, setEntries] = useState<BodyweightEntry[] | null>(null);
  const [weightText, setWeightText] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    setEntries(await getBodyweightEntries(db));
  }, [db]);

  // Reload whenever the tab is shown, e.g. so "today" is right after midnight.
  useFocusEffect(
    useCallback(() => {
      reload();
    }, [reload])
  );

  const weightKg = parseWeightInput(weightText);
  const canSave = weightKg !== null && weightKg > 0 && !saving;
  const hasToday = entries?.[0]?.date === localDate();

  async function handleSave() {
    if (weightKg === null || weightKg <= 0) return;
    setSaving(true);
    setError(null);
    try {
      await saveBodyweight(db, { weightKg, date: localDate() });
      setWeightText('');
      await reload();
    } catch {
      setError("Couldn't save your weight. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  function confirmDelete(entry: BodyweightEntry) {
    Alert.alert(`Delete ${formatDayLabel(entry.date)}?`, formatWeight(entry.weight_kg), [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          setError(null);
          try {
            await deleteBodyweightEntry(db, entry.id);
            await reload();
          } catch {
            setError("Couldn't delete the entry. Please try again.");
          }
        },
      },
    ]);
  }

  return (
    <FlatList
      data={withChanges(entries ?? [])}
      keyExtractor={(item) => item.entry.id}
      contentInsetAdjustmentBehavior="automatic"
      keyboardDismissMode="on-drag"
      keyboardShouldPersistTaps="handled"
      style={{ backgroundColor: colors.background }}
      ListHeaderComponent={
        <View style={styles.header}>
          <View style={styles.form}>
            <View style={styles.field}>
              <Text style={[styles.label, { color: colors.text }]}>
                {hasToday ? "Update today's weight (kg)" : "Today's weight (kg)"}
              </Text>
              <TextInput
                value={weightText}
                onChangeText={setWeightText}
                keyboardType="decimal-pad"
                placeholder={entries?.[0] ? weightToInput(entries[0].weight_kg) : '0'}
                placeholderTextColor="#8e8e93"
                accessibilityLabel="Bodyweight in kilograms"
                style={[
                  styles.input,
                  { color: colors.text, backgroundColor: colors.card, borderColor: colors.border },
                ]}
              />
            </View>
            <Pressable
              accessibilityRole="button"
              disabled={!canSave}
              onPress={handleSave}
              style={({ pressed }) => [
                styles.button,
                { backgroundColor: colors.primary, opacity: !canSave ? 0.4 : pressed ? 0.7 : 1 },
              ]}>
              <Text style={styles.buttonLabel}>{hasToday ? 'Update' : 'Save'}</Text>
            </Pressable>
          </View>
          {error && <Text style={[styles.error, { color: colors.notification }]}>{error}</Text>}
          {entries && entries.length > 0 && (
            <Text style={[styles.hint, { color: colors.text }]}>
              Press and hold an entry to delete it
            </Text>
          )}
        </View>
      }
      ListEmptyComponent={
        entries ? (
          <Text style={[styles.empty, { color: colors.text }]}>
            No entries yet. Weigh yourself and save today&apos;s weight above.
          </Text>
        ) : null
      }
      ItemSeparatorComponent={() => (
        <View style={[styles.separator, { backgroundColor: colors.border }]} />
      )}
      renderItem={({ item: { entry, changeKg } }) => (
        <Pressable
          onLongPress={() => confirmDelete(entry)}
          accessibilityHint="Press and hold to delete"
          style={({ pressed }) => [styles.row, pressed && { backgroundColor: colors.border }]}>
          <Text style={[styles.date, { color: colors.text }]}>{formatDayLabel(entry.date)}</Text>
          <Text style={[styles.weight, { color: colors.text }]}>
            {formatWeight(entry.weight_kg)}
          </Text>
          <Text style={[styles.change, { color: colors.text }]}>
            {changeKg === null ? '' : formatWeightChange(changeKg)}
          </Text>
        </Pressable>
      )}
    />
  );
}

const styles = StyleSheet.create({
  header: {
    padding: 16,
    gap: 8,
  },
  form: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 12,
  },
  field: {
    flex: 1,
    gap: 6,
  },
  label: {
    fontSize: 14,
    opacity: 0.6,
  },
  input: {
    fontSize: 22,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: StyleSheet.hairlineWidth,
    fontVariant: ['tabular-nums'],
  },
  button: {
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderRadius: 12,
  },
  buttonLabel: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '600',
  },
  error: {
    fontSize: 15,
  },
  hint: {
    fontSize: 13,
    opacity: 0.5,
    marginTop: 8,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'baseline',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  date: {
    flex: 1,
    fontSize: 17,
  },
  weight: {
    fontSize: 17,
    fontWeight: '600',
    fontVariant: ['tabular-nums'],
  },
  change: {
    width: 80,
    textAlign: 'right',
    fontSize: 15,
    opacity: 0.6,
    fontVariant: ['tabular-nums'],
  },
  separator: {
    height: StyleSheet.hairlineWidth,
    marginLeft: 16,
  },
  empty: {
    textAlign: 'center',
    marginTop: 16,
    marginHorizontal: 32,
    fontSize: 16,
    opacity: 0.6,
  },
});
