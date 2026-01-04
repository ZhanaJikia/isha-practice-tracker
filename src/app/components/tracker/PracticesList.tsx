"use client";

import { PracticeRow } from "./PracticeRow";
import { useTrackerData } from "./useTrackerData";
import { useTrackerActions } from "./useTrackerActions";

export function PracticesList() {
  const { practices, completions, byPracticeId, error, reload } = useTrackerData();
  const { busyKey, actionError, onDone, onUndo } = useTrackerActions(reload);

  const msg = actionError ?? error;

  if (msg) {
    return (
      <section className="rounded border p-3">
        <div className="text-sm">
          {msg}{" "}
          <a className="underline" href="/login">
            Login
          </a>
        </div>
        <div className="mt-3">
          <button className="rounded border px-3 py-2 text-sm" onClick={reload}>
            Retry
          </button>
        </div>
      </section>
    );
  }

  if (!practices || !completions) {
    return (
      <section className="rounded border p-3 text-sm opacity-70">
        Loading practices…
      </section>
    );
  }

  return (
    <section className="space-y-3">
      <div className="text-sm opacity-70">
        Today: <span className="font-medium">{completions.dayKey}</span>
      </div>

      <ul className="space-y-2">
        {practices.map((p) => (
          <PracticeRow
            key={p.key}
            practice={p}
            count={byPracticeId[p.key]?.count ?? 0}
            busy={busyKey === p.key}
            onDone={onDone}
            onUndo={onUndo}
          />
        ))}
      </ul>
    </section>
  );
}
