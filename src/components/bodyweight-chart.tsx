import { Circle, matchFont } from '@shopify/react-native-skia';
import { useTheme } from 'expo-router';
import { useMemo, useState } from 'react';
import { Platform, StyleSheet, Text, View, type ColorValue } from 'react-native';
import { useAnimatedReaction } from 'react-native-reanimated';
import { CartesianChart, Line, Scatter, useChartPressState } from 'victory-native';
import { scheduleOnRN } from 'react-native-worklets';

import { addDays, formatDayLabel, formatShortDayLabel } from '@/lib/dates';
import type { ChartPoint } from '@/lib/trend';
import { formatWeight } from '@/lib/units';

const LABEL_COLOR = '#8e8e93';

/**
 * Skia only accepts plain color strings. The navigation themes use strings
 * like 'rgb(0, 122, 255)'; fall back if a theme ever uses a platform color.
 */
function skiaColor(color: ColorValue, fallback: string) {
  return typeof color === 'string' ? color : fallback;
}

type Props = {
  /** Oldest first; needs at least 2 points to draw. */
  points: ChartPoint[];
};

/**
 * Daily weigh-ins as dots with the smoothed trend as a line. Pressing and
 * dragging selects the nearest day; otherwise the latest day is shown above.
 */
export function BodyweightChart({ points }: Props) {
  const { colors } = useTheme();
  const primary = skiaColor(colors.primary, '#0a84ff');
  const border = skiaColor(colors.border, '#3a3a3c');
  // The phone's own system font, so no font file needs bundling.
  const font = useMemo(
    () => matchFont({ fontFamily: Platform.select({ ios: 'Helvetica', default: 'sans-serif' }), fontSize: 11 }),
    []
  );
  const { state, isActive } = useChartPressState({ x: 0, y: { weight: 0, trend: 0 } });
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  // The press gesture runs on the UI thread; copy the selected index back for the readout.
  useAnimatedReaction(
    () => (state.isActive.value ? state.matchedIndex.value : -1),
    (index, previous) => {
      if (index !== previous) scheduleOnRN(setSelectedIndex, index >= 0 ? index : null);
    }
  );

  const firstDate = points[0].date;
  const shown = points[selectedIndex ?? points.length - 1];

  return (
    <View style={styles.container}>
      <View style={styles.readout}>
        <Text style={[styles.readoutWeight, { color: colors.text }]}>{formatWeight(shown.weight)}</Text>
        <Text style={[styles.readoutDetail, { color: colors.text }]}>
          {formatDayLabel(shown.date)} · trend {formatWeight(Number(shown.trend.toFixed(1)))}
        </Text>
      </View>
      <View style={styles.chart}>
        <CartesianChart
          data={points}
          xKey="day"
          yKeys={['weight', 'trend']}
          chartPressState={state}
          domainPadding={{ left: 12, right: 12, top: 16, bottom: 16 }}
          xAxis={{
            font,
            tickCount: 4,
            labelColor: LABEL_COLOR,
            lineColor: border,
            formatXLabel: (day) => formatShortDayLabel(addDays(firstDate, Math.round(day))),
          }}
          yAxis={[
            {
              font,
              tickCount: 5,
              labelColor: LABEL_COLOR,
              lineColor: border,
              formatYLabel: (kg) => String(Number(kg.toFixed(1))),
            },
          ]}>
          {({ points: chartPoints }) => (
            <>
              <Line
                points={chartPoints.trend}
                color={primary}
                strokeWidth={3}
                curveType="natural"
              />
              <Scatter points={chartPoints.weight} radius={3.5} color={LABEL_COLOR} />
              {isActive && (
                <Circle
                  cx={state.x.position}
                  cy={state.y.weight.position}
                  r={7}
                  color={primary}
                />
              )}
            </>
          )}
        </CartesianChart>
      </View>
      <Text style={[styles.legend, { color: colors.text }]}>
        Dots: daily weigh-ins · Line: trend · Press and drag to see a day
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 8,
  },
  readout: {
    gap: 2,
  },
  readoutWeight: {
    fontSize: 28,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
  readoutDetail: {
    fontSize: 14,
    opacity: 0.6,
  },
  chart: {
    height: 220,
  },
  legend: {
    fontSize: 12,
    opacity: 0.5,
  },
});
