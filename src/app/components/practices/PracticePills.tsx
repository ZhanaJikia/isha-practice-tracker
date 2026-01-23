"use client";

import type { PracticeDto } from "@/lib/http/api";
import { MAX_SELECTED } from "./usePracticePicker";

export function PracticePills({
  items,
  selectedIds,
  onToggle,
}: {
  items: PracticeDto[];
  selectedIds: string[];
  onToggle: (id: string) => void;
}) {
  const selectedCount = selectedIds.length;

  return (
    <div className="flex flex-wrap gap-2">
      {items.map((p) => {
        const on = selectedIds.includes(p.id);
        const disableTurnOn = !on && selectedCount >= MAX_SELECTED;

        return (
          <button
            key={p.id}
            type="button"
            aria-pressed={on}
            disabled={disableTurnOn}
            onClick={() => onToggle(p.id)}
            className={[
              "rounded-full border px-4 py-2 text-left text-sm transition disabled:opacity-50",
              "hover:bg-accent hover:text-accent-foreground",
              on ? "bg-primary text-primary-foreground border-primary" : "bg-transparent",
            ].join(" ")}
          >
            <div className="font-medium leading-5">{p.name}</div>
            <div className={["text-xs", on ? "opacity-90" : "opacity-70"].join(" ")}>
              {p.points} pts · max {p.maxPerDay}/day
            </div>
          </button>
        );
      })}
    </div>
  );
}