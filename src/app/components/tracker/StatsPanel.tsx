import { useEffect, useState } from "react";
import { fetchJson } from "@/lib/http/client";
import { UI_TEXT } from "@/config/uiText";

type StatsResponse = {
  totals: { totalPoints: number; activeDays: number };
  perPractice: Array<{ practiceId: string; label: string; count: number; points: number }>;
};

export function StatsPanel() {
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
        const err = e as { status?: number; message?: string };
        if (!mounted) return;
        if (err?.status === 401) setError(UI_TEXT.auth.pleaseLogin);
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
  }, []);

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