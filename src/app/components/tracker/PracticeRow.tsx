"use client";

import type { PracticeKey, Practice } from "@/config/practices";

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
  const disabledDone = busy || count >= practice.maxPerDay;
  const disabledUndo = busy || count <= 0;

  return (
    <li className="rounded border p-3">
      <div className="flex items-center justify-between gap-4">
        <div>
          <div className="font-medium">{practice.label}</div>
          <div className="text-sm opacity-70">
            today: {count}/{practice.maxPerDay} · {practice.points} pts each · key:{" "}
            <span className="font-mono">{practice.key}</span>
          </div>
        </div>

        <div className="flex gap-2">
          <button
            className="rounded border px-3 py-2 text-sm disabled:opacity-50"
            disabled={disabledUndo}
            onClick={() => onUndo(practice.key)}
          >
            Undo
          </button>

          <button
            className="rounded border px-3 py-2 text-sm disabled:opacity-50"
            disabled={disabledDone}
            onClick={() => onDone(practice.key)}
          >
            Done
          </button>
        </div>
      </div>
    </li>
  );
}
