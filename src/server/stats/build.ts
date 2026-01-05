import { PRACTICES, PRACTICE_BY_KEY, isPracticeKey } from "@/config/practices";

export function buildPerPractice(countByPractice: Record<string, number>) {
  return PRACTICES.map((p) => {
    const count = countByPractice[p.key] ?? 0;
    const points = count * p.points;
    return {
      practiceId: p.key,
      label: p.label,
      maxPerDay: p.maxPerDay,
      pointsPer: p.points,
      count,
      points,
    };
  });
}

export function buildDailySeries(rows: Array<{ dayKey: string; practiceId: string; count: number }>) {
  const byDay: Record<string, { dayKey: string; totalCount: number; totalPoints: number }> = {};

  for (const r of rows) {
    if (!isPracticeKey(r.practiceId)) continue;
    const pts = r.count * PRACTICE_BY_KEY[r.practiceId].points;

    const slot = (byDay[r.dayKey] ??= { dayKey: r.dayKey, totalCount: 0, totalPoints: 0 });
    slot.totalCount += r.count;
    slot.totalPoints += pts;
  }

  return Object.values(byDay).sort((a, b) => a.dayKey.localeCompare(b.dayKey));
}
