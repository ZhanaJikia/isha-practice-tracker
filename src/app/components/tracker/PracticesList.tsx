"use client";

import { PracticeRow } from "./PracticeRow";
import { useTrackerData } from "./useTrackerData";
import { useTrackerActions } from "./useTrackerActions";
import { AlertCircle, RefreshCw } from "lucide-react";

/* ─── Skeleton loader ─────────────────────────────────────────────── */
function PracticeRowSkeleton() {
  return (
    <li className="rounded-2xl border bg-card p-5 shadow-sm">
      <div className="flex items-start gap-4">
        <div className="h-12 w-12 shrink-0 animate-pulse rounded-xl bg-muted" />
        <div className="flex-1 space-y-2">
          <div className="flex items-start justify-between gap-2">
            <div className="space-y-1.5">
              <div className="h-4 w-28 animate-pulse rounded bg-muted" />
              <div className="h-3 w-16 animate-pulse rounded bg-muted" />
            </div>
            <div className="h-7 w-14 animate-pulse rounded-full bg-muted" />
          </div>
          <div className="mt-3 h-1.5 w-full animate-pulse rounded-full bg-muted" />
          <div className="h-3 w-32 animate-pulse rounded bg-muted" />
        </div>
      </div>
      <div className="mt-4 flex justify-end gap-2">
        <div className="h-9 w-20 animate-pulse rounded-xl bg-muted" />
        <div className="h-9 w-28 animate-pulse rounded-xl bg-muted" />
      </div>
    </li>
  );
}

/* ─── Main component ──────────────────────────────────────────────── */
export function PracticesList() {
  const { practices, completions, byPracticeId, error, loading, reload } = useTrackerData();
  const { busyKey, actionError, onDone, onUndo } = useTrackerActions(reload);

  const msg = actionError ?? error;

  /* Error state */
  if (msg && !loading) {
    return (
      <section className="rounded-2xl border border-destructive/20 bg-destructive/5 p-6">
        <div className="flex items-start gap-3">
          <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-destructive" />
          <div className="flex-1">
            <p className="text-sm font-medium text-destructive">{msg}</p>
            <div className="mt-3 flex items-center gap-3">
              <button
                className="flex items-center gap-1.5 rounded-xl border border-border bg-card px-3 py-2 text-sm font-medium text-foreground transition hover:bg-muted"
                onClick={() => void reload()}
              >
                <RefreshCw className="h-3.5 w-3.5" />
                Retry
              </button>
              <a className="text-sm text-muted-foreground underline underline-offset-2" href="/login">
                Go to login
              </a>
            </div>
          </div>
        </div>
      </section>
    );
  }

  /* Loading state — skeletons */
  if (loading || !practices || !completions) {
    return (
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="h-4 w-24 animate-pulse rounded bg-muted" />
          <div className="h-4 w-16 animate-pulse rounded bg-muted" />
        </div>
        <ul className="space-y-3">
          {[0, 1, 2, 3].map((i) => (
            <PracticeRowSkeleton key={i} />
          ))}
        </ul>
      </section>
    );
  }

  /* Compute a total for today */
  const totalToday = Object.values(byPracticeId).reduce((sum, c) => sum + c.count, 0);
  const maxTotal = practices.reduce((sum, p) => sum + p.maxPerDay, 0);

  return (
    <section className="space-y-4">
      {/* Header row */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Today · {completions.dayKey}
          </p>
        </div>
        <div className="flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
          {totalToday} / {maxTotal} completed
        </div>
      </div>

      {/* Practice list */}
      <ul className="space-y-3">
        {practices.map((p) => (
          <PracticeRow
            key={p.id}
            practice={p}
            count={byPracticeId[p.id]?.count ?? 0}
            busy={busyKey === p.id}
            onDone={onDone}
            onUndo={onUndo}
          />
        ))}
      </ul>
    </section>
  );
}
