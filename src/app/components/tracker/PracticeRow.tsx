"use client";

import { Activity, Droplets, BookOpen, Sparkles, Plus, Minus } from "lucide-react";
import { cn } from "@/lib/utils";
import type { PracticeKey, Practice } from "@/config/practices";

/* ─── per-practice visual config ─────────────────────────────────── */
const PRACTICE_STYLES: Record<
  PracticeKey,
  {
    icon: React.ElementType;
    gradient: string;
    lightBg: string;
    lightText: string;
    bar: string;
    ring: string;
  }
> = {
  walk: {
    icon: Activity,
    gradient: "from-emerald-400 to-teal-500",
    lightBg: "bg-emerald-50",
    lightText: "text-emerald-700",
    bar: "bg-gradient-to-r from-emerald-400 to-teal-500",
    ring: "ring-emerald-200",
  },
  cold_shower: {
    icon: Droplets,
    gradient: "from-sky-400 to-cyan-500",
    lightBg: "bg-sky-50",
    lightText: "text-sky-700",
    bar: "bg-gradient-to-r from-sky-400 to-cyan-500",
    ring: "ring-sky-200",
  },
  journal: {
    icon: BookOpen,
    gradient: "from-amber-400 to-orange-500",
    lightBg: "bg-amber-50",
    lightText: "text-amber-700",
    bar: "bg-gradient-to-r from-amber-400 to-orange-500",
    ring: "ring-amber-200",
  },
  meditation: {
    icon: Sparkles,
    gradient: "from-violet-400 to-purple-500",
    lightBg: "bg-violet-50",
    lightText: "text-violet-700",
    bar: "bg-gradient-to-r from-violet-400 to-purple-500",
    ring: "ring-violet-200",
  },
};

/* ─── component ──────────────────────────────────────────────────── */
export function PracticeRow({
  practice,
  count,
  busy,
  onDone,
  onUndo,
}: {
  practice: Practice;
  count: number;
  busy: boolean;
  onDone: (id: PracticeKey) => void;
  onUndo: (id: PracticeKey) => void;
}) {
  const style = PRACTICE_STYLES[practice.key];
  const Icon = style.icon;

  const progress = Math.min(1, count / practice.maxPerDay);
  const isComplete = count >= practice.maxPerDay;
  const disabledDone = busy || isComplete;
  const disabledUndo = busy || count <= 0;

  return (
    <li
      className={cn(
        "group relative overflow-hidden rounded-2xl border bg-card p-5 shadow-sm transition-all duration-200",
        isComplete
          ? "border-primary/20 bg-primary/5"
          : "hover:shadow-md hover:border-border/80"
      )}
    >
      <div className="flex items-start gap-4">
        {/* Icon */}
        <div
          className={cn(
            "flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br shadow-sm transition-transform group-hover:scale-105",
            style.gradient
          )}
        >
          <Icon className="h-6 w-6 text-white" />
        </div>

        {/* Info */}
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h3 className="font-semibold leading-snug text-foreground">{practice.label}</h3>
              <p className="mt-0.5 text-xs text-muted-foreground">
                {practice.points} {practice.points === 1 ? "point" : "points"} each
              </p>
            </div>

            {/* Count badge */}
            <div
              className={cn(
                "flex shrink-0 items-center gap-1 rounded-full px-2.5 py-1 text-sm font-bold",
                isComplete ? "bg-primary text-primary-foreground" : `${style.lightBg} ${style.lightText}`
              )}
            >
              <span>{count}</span>
              <span className="font-normal opacity-60">/ {practice.maxPerDay}</span>
            </div>
          </div>

          {/* Progress bar */}
          <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-muted">
            <div
              className={cn(
                "h-full rounded-full transition-all duration-500 ease-out",
                style.bar
              )}
              style={{ width: `${progress * 100}%` }}
              aria-hidden="true"
            />
          </div>

          {/* Status text */}
          <p className="mt-1.5 text-xs text-muted-foreground">
            {isComplete
              ? "✓ Completed for today"
              : count > 0
                ? `${practice.maxPerDay - count} more available today`
                : "Not started today"}
          </p>
        </div>
      </div>

      {/* Action buttons */}
      <div className="mt-4 flex justify-end gap-2">
        <button
          className={cn(
            "flex items-center gap-1.5 rounded-xl border px-3.5 py-2 text-sm font-medium transition-all",
            disabledUndo
              ? "cursor-not-allowed opacity-40 border-border text-muted-foreground"
              : "border-border text-muted-foreground hover:border-foreground/30 hover:bg-muted hover:text-foreground active:scale-95"
          )}
          disabled={disabledUndo}
          onClick={() => onUndo(practice.key)}
        >
          <Minus className="h-3.5 w-3.5" />
          Undo
        </button>

        <button
          className={cn(
            "flex items-center gap-1.5 rounded-xl px-4 py-2 text-sm font-semibold transition-all",
            disabledDone
              ? "cursor-not-allowed opacity-40 bg-muted text-muted-foreground"
              : `bg-gradient-to-r ${style.gradient} text-white shadow-sm hover:opacity-90 active:scale-95`
          )}
          disabled={disabledDone}
          onClick={() => onDone(practice.key)}
        >
          {busy ? (
            <span className="animate-pulse">…</span>
          ) : (
            <>
              <Plus className="h-3.5 w-3.5" />
              {isComplete ? "Done" : "Mark done"}
            </>
          )}
        </button>
      </div>
    </li>
  );
}
