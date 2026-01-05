import type { Db } from "./types";

export async function fetchCountByPractice(db: Db, userId: string, whereRange: object) {
  const rows = await db.dailyPracticeCompletion.groupBy({
    by: ["practiceId"],
    where: { userId, ...whereRange },
    _sum: { count: true },
  });

  const out: Record<string, number> = {};
  for (const r of rows) out[r.practiceId] = r._sum.count ?? 0;
  return out;
}

export async function fetchActiveDays(db: Db, userId: string, whereRange: object) {
  const rows = await db.dailyPracticeCompletion.groupBy({
    by: ["dayKey"],
    where: { userId, ...whereRange },
    _sum: { count: true },
  });

  // robust even if you later allow count=0 rows
  return rows.filter((r) => (r._sum.count ?? 0) > 0).length;
}

export async function fetchDailyPracticeSums(db: Db, userId: string, whereRange: object) {
  const rows = await db.dailyPracticeCompletion.groupBy({
    by: ["dayKey", "practiceId"],
    where: { userId, ...whereRange },
    _sum: { count: true },
  });

  return rows.map((r) => ({
    dayKey: r.dayKey,
    practiceId: r.practiceId,
    count: r._sum.count ?? 0,
  }));
}
