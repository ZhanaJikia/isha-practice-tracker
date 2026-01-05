import type { Prisma, PrismaClient } from "@prisma/client";

export type Db = PrismaClient | Prisma.TransactionClient;

export type StatsRange = "today" | "week" | "month" | "all";

export type StatsResponse = {
  range: StatsRange;
  asOfDayKey: string;
  startDayKey: string | null;
  endDayKey: string | null;
  totals: { totalCount: number; totalPoints: number; activeDays: number };
  perPractice: Array<{
    practiceId: string;
    label: string;
    maxPerDay: number;
    pointsPer: number;
    count: number;
    points: number;
  }>;
  dailySeries: Array<{ dayKey: string; totalCount: number; totalPoints: number }>;
  chartWindow: null | { days: number; startDayKey: string; endDayKey: string };
};
