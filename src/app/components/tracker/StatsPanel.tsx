"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { fetchJson } from "@/lib/http/client";
import { UI_TEXT } from "@/config/uiText";
import { TrendingUp, Calendar, Activity, Droplets, BookOpen, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

type StatsResponse = {
  totals: { totalPoints: number; activeDays: number };
  perPractice: Array<{ practiceId: string; label: string; count: number; points: number }>;
};

function clamp01(n: number) {
  if (!Number.isFinite(n)) return 0;
  return Math.max(0, Math.min(1, n));
}

const PRACTICE_STYLES: Record<
  string,
  { gradient: string; lightBg: string; lightText: string; icon: React.ElementType }
> = {
  walk: {
    gradient: "from-emerald-400 to-teal-500",
    lightBg: "bg-emerald-50",
    lightText: "text-emerald-700",
    icon: Activity,
  },
  cold_shower: {
    gradient: "from-sky-400 to-cyan-500",
    lightBg: "bg-sky-50",
    lightText: "text-sky-700",
    icon: Droplets,
  },
  journal: {
    gradient: "from-amber-400 to-orange-500",
    lightBg: "bg-amber-50",
    lightText: "text-amber-700",
    icon: BookOpen,
  },
  meditation: {
    gradient: "from-violet-400 to-purple-500",
    lightBg: "bg-violet-50",
    lightText: "text-violet-700",
    icon: Sparkles,
  },
};

/* ─── Skeleton ────────────────────────────────────────────────────── */
function StatsSkeleton() {
  return (
    <section className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        {[0, 1].map((i) => (
          <div key={i} className="rounded-2xl border bg-card p-4">
            <div className="h-7 w-16 animate-pulse rounded bg-muted" />
            <div className="mt-2 h-3 w-24 animate-pulse rounded bg-muted" />
          </div>
        ))}
      </div>
      <div className="rounded-2xl border bg-card p-5 space-y-4">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="space-y-1.5">
            <div className="flex justify-between">
              <div className="h-4 w-24 animate-pulse rounded bg-muted" />
              <div className="h-4 w-16 animate-pulse rounded bg-muted" />
            </div>
            <div className="h-1.5 w-full animate-pulse rounded-full bg-muted" />
          </div>
        ))}
      </div>
    </section>
  );
}

/* ─── Main component ──────────────────────────────────────────────── */
export function StatsPanel() {
  const router = useRouter();
  const [data, setData] = useState<StatsResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      setError(null);
      try {
        const stats = await fetchJson<StatsResponse>("/api/stats?range=week", {
          cache: "no-store",
        });
        if (!mounted) return;
        setData(stats);
      } catch (e: unknown) {
        const err = e as import("@/lib/http/client").HttpError;
        if (!mounted) return;
        if (err?.status === 401) {
          setError(UI_TEXT.auth.pleaseLogin);
          router.replace("/login");
        } else {
          setError(err?.message ?? UI_TEXT.errors.statsFailed);
        }
        setData(null);
      }
    };

    void load();
    const onUpdated = () => { void load(); };
    window.addEventListener("practice-updated", onUpdated);
    return () => {
      mounted = false;
      window.removeEventListener("practice-updated", onUpdated);
    };
  }, [router]);

  if (error) {
    return (
      <section className="rounded-2xl border border-destructive/20 bg-destructive/5 p-4 text-sm text-destructive">
        {error}{" "}
        <a className="underline underline-offset-2" href="/login">
          {UI_TEXT.auth.loginCta}
        </a>
      </section>
    );
  }

  if (!data) return <StatsSkeleton />;

  const maxPoints = Math.max(1, ...data.perPractice.map((p) => p.points));

  return (
    <section className="space-y-4">
      {/* Summary metric cards */}
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-2xl border bg-card p-4 shadow-sm">
          <div className="flex items-center gap-2 text-muted-foreground">
            <TrendingUp className="h-4 w-4" />
            <span className="text-xs font-medium uppercase tracking-wide">Week pts</span>
          </div>
          <div className="mt-2 text-3xl font-bold text-primary">
            {data.totals.totalPoints}
          </div>
          <p className="mt-0.5 text-xs text-muted-foreground">points earned this week</p>
        </div>

        <div className="rounded-2xl border bg-card p-4 shadow-sm">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Calendar className="h-4 w-4" />
            <span className="text-xs font-medium uppercase tracking-wide">Active days</span>
          </div>
          <div className="mt-2 text-3xl font-bold text-primary">
            {data.totals.activeDays}
          </div>
          <p className="mt-0.5 text-xs text-muted-foreground">days with practice</p>
        </div>
      </div>

      {/* Per-practice breakdown */}
      {data.perPractice.length > 0 && (
        <div className="rounded-2xl border bg-card p-5 shadow-sm">
          <h3 className="mb-4 text-sm font-semibold text-foreground">Practice breakdown</h3>
          <div className="space-y-4">
            {data.perPractice.map((p) => {
              const pct = clamp01(p.points / maxPoints);
              const style = PRACTICE_STYLES[p.practiceId];
              const Icon = style?.icon ?? Activity;

              return (
                <div key={p.practiceId}>
                  <div className="mb-1.5 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <div
                        className={cn(
                          "flex h-6 w-6 items-center justify-center rounded-md bg-gradient-to-br",
                          style?.gradient ?? "from-gray-400 to-gray-500"
                        )}
                      >
                        <Icon className="h-3 w-3 text-white" />
                      </div>
                      <span className="text-sm font-medium text-foreground">{p.label}</span>
                    </div>
                    <div className="flex shrink-0 items-center gap-2 text-sm">
                      <span className="text-muted-foreground">{p.count}×</span>
                      <span
                        className={cn(
                          "rounded-full px-2 py-0.5 text-xs font-semibold",
                          style?.lightBg ?? "bg-muted",
                          style?.lightText ?? "text-foreground"
                        )}
                      >
                        {p.points} pts
                      </span>
                    </div>
                  </div>
                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                    <div
                      className={cn(
                        "h-full rounded-full bg-gradient-to-r transition-all duration-700",
                        style?.gradient ?? "from-gray-400 to-gray-500"
                      )}
                      style={{ width: `${pct * 100}%` }}
                      aria-hidden="true"
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {data.perPractice.length === 0 && (
        <div className="rounded-2xl border bg-card p-8 text-center shadow-sm">
          <div className="text-3xl">🌱</div>
          <p className="mt-2 text-sm font-medium text-foreground">No practices logged this week</p>
          <p className="mt-1 text-xs text-muted-foreground">
            Mark a practice as done above to start building your streak.
          </p>
        </div>
      )}
    </section>
  );
}
