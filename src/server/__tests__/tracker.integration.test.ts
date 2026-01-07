import { describe, it, expect, beforeAll, afterAll, beforeEach } from "vitest";
import { prisma } from "@/lib/db";
import { applyCompletion } from "@/server/tracker/applyCompletion";
import { undoCompletion } from "@/server/completions/undoCompletion";


describe("integration: tracker business rules", () => {
  beforeAll(() => {
    const url = process.env.DATABASE_URL ?? "";
    expect(url).toContain("isha_practice_test");
  });

  beforeEach(async () => {
    await prisma.dailyPracticeCompletion.deleteMany();
    await prisma.session.deleteMany();
    await prisma.user.deleteMany();
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it("applyCompletion creates + increments + then blocks at maxPerDay", async () => {
    // ... unchanged ...
  });

  it("undoCompletion decrements, deletes, and noops", async () => {
    // ... unchanged ...
  });

  it("applyCompletion returns max_reached when delta > maxPerDay", async () => {
    const user = await prisma.user.create({
      data: { username: "u_test3", passwordHash: "x" },
      select: { id: true },
    });

    const dayKey = "2026-01-07";
    const now = new Date();
    const practiceId = "walk";
    const maxPerDay = 2;

    const r = await prisma.$transaction((tx) =>
      applyCompletion(tx, { userId: user.id, practiceId, dayKey, delta: 3, maxPerDay, now })
    );

    expect(r.kind).toBe("max_reached");

    const rows = await prisma.dailyPracticeCompletion.findMany({ where: { userId: user.id } });
    expect(rows).toHaveLength(0);
  });

  it("undoCompletion deletes when count equals delta (exactly reaches 0)", async () => {
    const user = await prisma.user.create({
      data: { username: "u_test4", passwordHash: "x" },
      select: { id: true },
    });

    const dayKey = "2026-01-07";
    const practiceId = "walk";

    await prisma.dailyPracticeCompletion.create({
      data: { userId: user.id, practiceId, dayKey, count: 1, lastCompletedAt: new Date() },
    });

    const u = await prisma.$transaction((tx) =>
      undoCompletion(tx, { userId: user.id, practiceId, dayKey, delta: 1 })
    );

    expect(u.kind).toBe("deleted");

    const row = await prisma.dailyPracticeCompletion.findUnique({
      where: { userId_practiceId_dayKey: { userId: user.id, practiceId, dayKey } },
    });
    expect(row).toBeNull();
  });
});