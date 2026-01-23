"use client";

import { useState } from "react";
import { MAX_SELECTED } from "./usePracticePicker";

export function CustomPracticeInput({
  disabled,
  busy,
  selectedCount,
  onAdd,
}: {
  disabled: boolean;
  busy: boolean;
  selectedCount: number;
  onAdd: (name: string) => Promise<void>;
}) {
  const [name, setName] = useState("");

  const atLimit = selectedCount >= MAX_SELECTED;
  const canAdd = !disabled && !busy && !atLimit;

  return (
    <div className="space-y-2 rounded border p-3">
      <div className="text-sm font-medium">Add a custom practice</div>

      <div className="flex gap-2">
        <input
          className="w-full rounded border bg-transparent p-2 text-sm"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Reading"
        />
        <button
          className="rounded border px-3 py-2 text-sm disabled:opacity-50"
          disabled={!canAdd}
          onClick={async () => {
            await onAdd(name);
            setName("");
          }}
        >
          {busy ? "Adding…" : "Add"}
        </button>
      </div>

      {atLimit && (
        <div className="text-xs opacity-70">Remove one to add a new practice.</div>
      )}
    </div>
  );
}