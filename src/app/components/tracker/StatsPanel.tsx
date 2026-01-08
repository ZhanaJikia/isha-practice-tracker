"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { fetchJson } from "@/lib/http/client";
import { UI_TEXT } from "@/config/uiText";

type StatsResponse = {
  totals: { totalPoints: number; activeDays: number };
  perPractice: Array<{ practiceId: string; label: string; count: number; points: number }>;
};

function clamp01(n: number) {
  if (!Number.isFinite(n)) return 0;
  if (n < 0) return 0;
  if (n > 1) return 1;
  return n;
}

export function StatsPanel() {
  const router = useRouter();
  const [data, setData] = useState<StatsResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      setError(null);
      try {
        const stats = await fetchJson<StatsResponse>("/api/stats?range=week", { cache: "no-store" });
        if (!mounted) return;
        setData(stats);
      } catch (e: unknown) {
        const err = e as import("@/lib/http/client").HttpError;
        if (!mounted) return;
        if (err?.status === 401) {
          setError(UI_TEXT.auth.pleaseLogin);
          router.replace("/login");
        }
        else setError(err?.message ?? UI_TEXT.errors.statsFailed);
        setData(null);
      }
    };

    load();
    const onUpdated = () => { void load(); };
    window.addEventListener("practice-updated", onUpdated);
    return () => {
      mounted = false;
      window.removeEventListener("practice-updated", onUpdated);
    };
  }, [router]);

  if (error)
    return (
      <section className="rounded border p-3 text-sm">
        {error} <a className="underline" href="/login">{UI_TEXT.auth.loginCta}</a>
      </section>
    );

  if (!data)
    return (
      <section className="rounded border p-3 text-sm opacity-70">
        Loading stats…
      </section>
    );

  const maxPoints = Math.max(1, ...data.perPractice.map((p) => p.points));

  return (
    <section className="rounded border p-4">
      <h2 className="font-medium">
        Week points: {data.totals.totalPoints} · Active days: {data.totals.activeDays}
      </h2>

      {/* Simple visual: per-practice points bars */}
      <div className="mt-4 space-y-3">
        {data.perPractice.map((p) => {
          const pct = clamp01(p.points / maxPoints);
          return (
            <div key={p.practiceId} className="space-y-1">
              <div className="flex items-baseline justify-between gap-4 text-sm">
                <div className="min-w-0">
                  <span className="truncate">{p.label}</span>
                </div>
                <div className="shrink-0 opacity-80">
                  {p.count} · {p.points} pts
                </div>
              </div>
              <div
                className="h-2 w-full overflow-hidden rounded-full bg-muted"
                aria-hidden="true"
              >
                <div
                  className="h-full rounded-full bg-primary"
                  style={{ width: `${pct * 100}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}