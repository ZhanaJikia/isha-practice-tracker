"use client";

import { MAX_SELECTED, type PracticePickerMode } from "./usePracticePicker";

export function PracticePickerActions({
  mode,
  busy,
  selectedCount,
  canSave,
  onSave,
}: {
  mode: PracticePickerMode;
  busy: boolean;
  selectedCount: number;
  canSave: boolean;
  onSave: () => Promise<void>;
}) {
  return (
    <div className="space-y-2">
      <div className="text-xs opacity-70">
        {selectedCount}/{MAX_SELECTED} selected
      </div>

      <button
        className="w-full rounded border px-3 py-2 text-sm disabled:opacity-50"
        disabled={!canSave}
        onClick={onSave}
      >
        {busy ? "Saving…" : mode === "onboarding" ? "Save & Continue" : "Save changes"}
      </button>
    </div>
  );
}