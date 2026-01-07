import { describe, it, expect, beforeAll, afterAll, beforeEach } from "vitest";
import { prisma } from "@/lib/db";
import { applyCompletion } from "@/server/tracker/applyCompletion";
import { undoCompletion } from "@/server/completions/undoCompletion";

describe("integration: tracker business rules", () => {
  beforeAll(() => {
    // Safety: never run integration tests against your dev/prod DB
    const url = process.env.DATABASE_URL ?? "";
    expect(url).toContain("isha_practice_test");
  });

  beforeEach(async () => {
    // Clean in FK-safe order
    await prisma.dailyPracticeCompletion.deleteMany();
    await prisma.session.deleteMany();
    await prisma.user.deleteMany();
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it("applyCompletion creates + increments + then blocks at maxPerDay", async () => {
    const user = await prisma.user.create({
      data: { username: "u_test", passwordHash: "x" },
      select: { id: true },
    });

    const dayKey = "2026-01-07";
    const now = new Date();
    const practiceId = "walk"; // from PRACTICES
    const maxPerDay = 2;

    // create (0 -> 1)
    const r1 = await prisma.$transaction((tx) =>
      applyCompletion(tx, { userId: user.id, practiceId, dayKey, delta: 1, maxPerDay, now })
    );
    expect(r1.kind).toBe("ok");

    // increment (1 -> 2)
    const r2 = await prisma.$transaction((tx) =>
      applyCompletion(tx, { userId: user.id, practiceId, dayKey, delta: 1, maxPerDay, now })
    );
    expect(r2.kind).toBe("ok");

    // would exceed max (2 -> 3) => max_reached
    const r3 = await prisma.$transaction((tx) =>
      applyCompletion(tx, { userId: user.id, practiceId, dayKey, delta: 1, maxPerDay, now })
    );
    expect(r3.kind).toBe("max_reached");
  });

  it("undoCompletion decrements, deletes, and noops", async () => {
    const user = await prisma.user.create({
      data: { username: "u_test2", passwordHash: "x" },
      select: { id: true },
    });

    const dayKey = "2026-01-07";
    const practiceId = "walk";

    // seed row with count=2
    await prisma.dailyPracticeCompletion.create({
      data: { userId: user.id, practiceId, dayKey, count: 2, lastCompletedAt: new Date() },
    });

    // decrement by 1 => row remains
    const u1 = await prisma.$transaction((tx) =>
      undoCompletion(tx, { userId: user.id, practiceId, dayKey, delta: 1 })
    );
    expect(u1.kind).toBe("ok");

    // undo by 5 => delete row
    const u2 = await prisma.$transaction((tx) =>
      undoCompletion(tx, { userId: user.id, practiceId, dayKey, delta: 5 })
    );
    expect(u2.kind).toBe("deleted");

    // undo again => noop
    const u3 = await prisma.$transaction((tx) =>
      undoCompletion(tx, { userId: user.id, practiceId, dayKey, delta: 1 })
    );
    expect(u3.kind).toBe("noop");
  });
});