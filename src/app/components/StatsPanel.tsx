"use client";

import { useEffect, useState } from "react";

type StatsResponse = {
  totals: { totalPoints: number; activeDays: number };
  perPractice: Array<{ practiceId: string; label: string; count: number; points: number }>;
};

export function StatsPanel() {
  const [data, setData] = useState<StatsResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    setError(null);

    const res = await fetch("/api/stats?range=week", {
      credentials: "include",
      cache: "no-store",
    });

    if (res.status === 401) {
      setError("Unauthorized");
      setData(null);
      return;
    }
    if (!res.ok) {
      setError("Stats failed");
      return;
    }

    setData(await res.json());
  }

  useEffect(() => {
    load();

    const onUpdated = () => load();
    window.addEventListener("practice-updated", onUpdated);

    return () => {
      window.removeEventListener("practice-updated", onUpdated);
    };
  }, []);

  if (error)
    return (
      <section className="rounded border p-3 text-sm">
        {error}{" "}
        <a className="underline" href="/login">
          Login
        </a>
      </section>
    );
  
  if (!data) return <section className="rounded border p-3 text-sm opacity-70">Loading stats…</section>;

  return (
    <section className="rounded border p-3">
      <h2 className="font-medium">
        Week points: {data.totals.totalPoints} · Active days: {data.totals.activeDays}
      </h2>

      <ul className="mt-2 space-y-1 text-sm">
        {data.perPractice.map((p) => (
          <li key={p.practiceId} className="flex justify-between">
            <span>{p.label}</span>
            <span className="opacity-80">
              {p.count} · {p.points} pts
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}
