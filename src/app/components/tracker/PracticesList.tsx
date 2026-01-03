"use client";

import { useEffect, useMemo, useState } from "react";
import type { PracticeKey } from "@/config/practices";

import { PracticeRow } from "./PracticeRow";
import { getPractices, getCompletions, donePractice, undoPractice } from "./api";
import type { CompletionsResponse } from "./types";
import type { Practice } from "@/config/practices";

function emitPracticeUpdated() {
  window.dispatchEvent(new Event("practice-updated"));
}

export function PracticesList() {
  const [practices, setPractices] = useState<Practice[] | null>(null);
  const [completions, setCompletions] = useState<CompletionsResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busyKey, setBusyKey] = useState<string | null>(null);

  async function load() {
    setError(null);
    try {
      const [p, c] = await Promise.all([getPractices(), getCompletions()]);
      setPractices(p.practices);
      setCompletions(c);
    } catch (e: any) {
      if (e?.status === 401) setError("Please log in");
      else setError(e?.message ?? "Failed to load");
    }
  }

  useEffect(() => {
    load();
  }, []);

  const byPracticeId = useMemo(
    () => completions?.byPracticeId ?? {},
    [completions]
  );

  async function handleDone(practiceId: PracticeKey) {
    try {
      setBusyKey(practiceId);
      setError(null);

      await donePractice(practiceId);
      await load();
      emitPracticeUpdated();
    } catch (e: any) {
      if (e?.status === 409) setError(e?.message ?? "Max per day reached");
      else if (e?.status === 401) setError("Please log in");
      else setError(e?.message ?? "Done failed");
    } finally {
      setBusyKey(null);
    }
  }

  async function handleUndo(practiceId: PracticeKey) {
    try {
      setBusyKey(practiceId);
      setError(null);

      await undoPractice(practiceId);
      await load();
      emitPracticeUpdated();
    } catch (e: any) {
      if (e?.status === 401) setError("Please log in");
      else setError(e?.message ?? "Undo failed");
    } finally {
      setBusyKey(null);
    }
  }

  if (error) {
    return (
      <section className="rounded border p-3">
        <div className="text-sm">
          {error}{" "}
          <a className="underline" href="/login">
            Login
          </a>
        </div>

        <div className="mt-3 flex gap-2">
          <button className="rounded border px-3 py-2 text-sm" onClick={load}>
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
        {practices.map((p) => {
          const count = byPracticeId[p.key]?.count ?? 0;
          const busy = busyKey === p.key;
          return (
            <PracticeRow
              key={p.key}
              practice={p}
              count={count}
              busy={busy}
              onDone={handleDone}
              onUndo={handleUndo}
            />
          );
        })}
      </ul>
    </section>
  );
}
