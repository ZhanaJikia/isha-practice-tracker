"use client";

import { useEffect, useMemo, useState } from "react";
import type { Practice, PracticeKey } from "@/config/practices";

import { LogoutButton } from "@components/auth/LogoutButton";


type CompletionRow = {
  practiceId: string;
  count: number;
  lastCompletedAt: string | null;
  updatedAt: string;
};

type CompletionsResponse = {
  dayKey: string;
  completions: CompletionRow[];
  byPracticeId: Record<string, CompletionRow>;
};

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

    const [pRes, cRes] = await Promise.all([
      fetch("/api/practices", { cache: "no-store" }),
      fetch("/api/completions", { cache: "no-store", credentials: "include" }),
    ]);

    if (cRes.status === 401) {
      setError("Unauthorized (please login)");
      return;
    }
    if (!pRes.ok) {
      setError("Failed to load practices");
      return;
    }
    if (!cRes.ok) {
      setError("Failed to load completions");
      return;
    }

    const pJson = await pRes.json();
    const cJson = await cRes.json();

    setPractices(pJson.practices as Practice[]);
    setCompletions(cJson as CompletionsResponse);
  }

  useEffect(() => {
    load();
  }, []);

  const byPracticeId = useMemo(
    () => completions?.byPracticeId ?? {},
    [completions]
  );

  async function postJSON(url: string, body: unknown) {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(body),
    });
    const data = await res.json().catch(() => null);
    return { res, data };
  }

  async function handleDone(practiceId: PracticeKey) {
    try {
      setBusyKey(practiceId);
      setError(null);

      const { res, data } = await postJSON("/api/done", { practiceId });

      if (res.status === 401) {
        setError("Unauthorized (please login)");
        return;
      }
      if (res.status === 409) {
        setError(data?.error ?? "Max per day reached");
        return;
      }
      if (!res.ok) {
        setError(data?.error ?? "Done failed");
        return;
      }

      await load();
      emitPracticeUpdated();
    } finally {
      setBusyKey(null);
    }
  }

  async function handleUndo(practiceId: PracticeKey) {
    try {
      setBusyKey(practiceId);
      setError(null);

      const { res, data } = await postJSON("/api/undo", { practiceId });

      if (res.status === 401) {
        setError("Unauthorized (please login)");
        return;
      }
      if (!res.ok) {
        setError(data?.error ?? "Undo failed");
        return;
      }

      await load();
      emitPracticeUpdated();
    } finally {
      setBusyKey(null);
    }
  }

  if (error) {
    return (
      <section className="rounded border p-3">
        <div className="text-sm">{error}</div>
  
        <div className="mt-3 flex gap-2">
          <a className="rounded border px-3 py-2 text-sm" href="/login">
            Go to login
          </a>
  
          <button
            className="rounded border px-3 py-2 text-sm"
            onClick={() => load()}
          >
            Retry
          </button>
        </div>
      </section>
    );
  }
  

  if (!practices || !completions) {
    return (
      <section className="rounded border p-3">
        <div className="text-sm opacity-70">Loading practices…</div>
      </section>
    );
  }

  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="text-sm opacity-70">
          Today: <span className="font-medium">{completions.dayKey}</span>
        </div>
        <LogoutButton />
        <a className="rounded border px-3 py-2 text-sm" href="/api/logout">
          {/* don't do this - it won't POST */}
        </a>
      </div>

      <ul className="space-y-2">
        {practices.map((p) => {
          const row = byPracticeId[p.key];
          const count = row?.count ?? 0;

          const disabledDone = busyKey === p.key || count >= p.maxPerDay;
          const disabledUndo = busyKey === p.key || count <= 0;

          return (
            <li key={p.key} className="rounded border p-3">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <div className="font-medium">{p.label}</div>
                  <div className="text-sm opacity-70">
                    today: {count}/{p.maxPerDay} · {p.points} pts each · key:{" "}
                    <span className="font-mono">{p.key}</span>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    className="rounded border px-3 py-2 text-sm disabled:opacity-50"
                    disabled={disabledUndo}
                    onClick={() => handleUndo(p.key)}
                  >
                    Undo
                  </button>
                  <button
                    className="rounded border px-3 py-2 text-sm disabled:opacity-50"
                    disabled={disabledDone}
                    onClick={() => handleDone(p.key)}
                  >
                    Done
                  </button>
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
