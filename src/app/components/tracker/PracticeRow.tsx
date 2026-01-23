"use client";

import type { PracticeDto } from "@/lib/http/api";

export function PracticeRow({
  practice,
  count,
  busy,
  onDone,
  onUndo,
}: {
  practice: PracticeDto;
  count: number;
  busy: boolean;
  onDone: (id: string) => void;
  onUndo: (id: string) => void;
}) {
  const disabledDone = busy || count >= practice.maxPerDay;
  const disabledUndo = busy || count <= 0;

  return (
    <li className="rounded border p-3">
      <div className="flex items-center justify-between gap-4">
        <div>
          <div className="font-medium">{practice.name}</div>
          <div className="text-sm opacity-70">
            today: {count}/{practice.maxPerDay} · {practice.points} pts each
          </div>
        </div>

        <div className="flex gap-2">
          <button
            className="rounded border px-3 py-2 text-sm disabled:opacity-50"
            disabled={disabledUndo}
            onClick={() => onUndo(practice.id)}
          >
            Undo
          </button>

          <button
            className="rounded border px-3 py-2 text-sm disabled:opacity-50"
            disabled={disabledDone}
            onClick={() => onDone(practice.id)}
          >
            Done
          </button>
        </div>
      </div>
    </li>
  );
}
