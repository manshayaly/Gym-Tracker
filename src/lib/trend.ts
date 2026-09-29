/** How strongly each new weigh-in moves the trend (0–1). Lower = smoother. */
const SMOOTHING = 0.25;

/**
 * Exponentially smoothed trend through weigh-ins given oldest first: each
 * point moves a quarter of the way from the previous trend toward that day's
 * weight, so single-day swings (water, food) barely register.
 */
export function smoothedTrend(weightsOldestFirst: readonly number[]) {
  const trend: number[] = [];
  for (const weight of weightsOldestFirst) {
    const previous = trend.at(-1);
    trend.push(previous === undefined ? weight : previous + SMOOTHING * (weight - previous));
  }
  return trend;
}

/** Whole days from one "YYYY-MM-DD" local day to another (positive if `to` is later). */
export function daysBetween(from: string, to: string) {
  const toUtc = (day: string) => {
    const [y, m, d] = day.split('-').map(Number);
    return Date.UTC(y, m - 1, d); // UTC so daylight-saving changes can't skew the count
  };
  return Math.round((toUtc(to) - toUtc(from)) / 86_400_000);
}

export type ChartPoint = {
  /** Days since the first weigh-in, so gaps between weigh-ins keep their real width. */
  day: number;
  date: string;
  weight: number;
  trend: number;
};

/** Turns entries (newest first, as the list shows them) into oldest-first chart points. */
export function buildChartPoints(entriesNewestFirst: readonly { date: string; weight_kg: number }[]) {
  const oldestFirst = [...entriesNewestFirst].reverse();
  const trend = smoothedTrend(oldestFirst.map((e) => e.weight_kg));
  const firstDate = oldestFirst[0]?.date;
  return oldestFirst.map(
    (entry, i): ChartPoint => ({
      day: daysBetween(firstDate, entry.date),
      date: entry.date,
      weight: entry.weight_kg,
      trend: trend[i],
    })
  );
}
