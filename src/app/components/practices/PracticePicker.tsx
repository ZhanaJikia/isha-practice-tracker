"use client";

import { usePracticePicker, type PracticePickerMode } from "./usePracticePicker";
import { PracticePills } from "./PracticePills";
import { CustomPracticeInput } from "./CustomPracticeInput";
import { ErrorBanner } from "./ErrorBanner";
import { PracticePickerActions } from "./PracticePickerActions";

export function PracticePicker({ mode }: { mode: PracticePickerMode }) {
  const vm = usePracticePicker({ mode });

  const canSave =
    !vm.busy &&
    vm.selectedCount > 0 &&
    vm.selectedCount <= 10;

  return (
    <section className="space-y-4">
      <div>
        <h1 className="text-xl font-semibold tracking-tight">
          {mode === "onboarding" ? "Choose your practices" : "Practices"}
        </h1>
        <p className="text-sm text-muted-foreground">
          Select what you want to track. You can change this anytime.
        </p>
      </div>

      <div className="space-y-2">
        <div className="text-sm font-medium">Tap to select</div>

        {vm.practices === null ? (
          <div className="rounded border p-3 text-sm opacity-70">Loading practices…</div>
        ) : (
          <PracticePills
            items={vm.items}
            selectedIds={vm.selectedIds}
            onToggle={vm.togglePractice}
          />
        )}
      </div>

      <CustomPracticeInput
        disabled={vm.practices === null}
        busy={vm.customBusy}
        selectedCount={vm.selectedCount}
        onAdd={vm.addCustomPractice}
      />

      <ErrorBanner message={vm.error} />

      <PracticePickerActions
        mode={mode}
        busy={vm.busy}
        selectedCount={vm.selectedCount}
        canSave={canSave}
        onSave={vm.saveSelection}
      />
    </section>
  );
}