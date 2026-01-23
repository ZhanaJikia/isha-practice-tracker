type PracticeForStats = { id: string; name: string; points: number; maxPerDay: number };

export function buildPerPractice(
  practices: PracticeForStats[],
  countByPractice: Record<string, number>
) {
  return practices.map((p) => {
    const count = countByPractice[p.id] ?? 0;
    const points = count * p.points;
    return {
      practiceId: p.id,
      label: p.name,
      maxPerDay: p.maxPerDay,
      pointsPer: p.points,
      count,
      points,
    };
  });
}

export function buildDailySeries(
  practices: PracticeForStats[],
  rows: Array<{ dayKey: string; practiceId: string; count: number }>
) {
  const byDay: Record<string, { dayKey: string; totalCount: number; totalPoints: number }> = {};
  const pointsById = Object.fromEntries(practices.map((p) => [p.id, p.points]));

  for (const r of rows) {
    const pointsPer = pointsById[r.practiceId];
    if (typeof pointsPer !== "number") continue;
    const pts = r.count * pointsPer;

    const slot = (byDay[r.dayKey] ??= { dayKey: r.dayKey, totalCount: 0, totalPoints: 0 });
    slot.totalCount += r.count;
    slot.totalPoints += pts;
  }

  return Object.values(byDay).sort((a, b) => a.dayKey.localeCompare(b.dayKey));
}
