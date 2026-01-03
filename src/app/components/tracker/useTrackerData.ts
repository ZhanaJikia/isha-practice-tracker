"use client";

import { useEffect, useMemo, useState } from "react";
import type { Practice } from "@/config/practices";
import type { CompletionsResponse } from "./types";
import { getPractices, getCompletions } from "./api";

export function useTrackerData() {
  const [practices, setPractices] = useState<Practice[] | null>(null);
  const [completions, setCompletions] = useState<CompletionsResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function reload() {
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
    reload();
  }, []);

  const byPracticeId = useMemo(
    () => completions?.byPracticeId ?? {},
    [completions]
  );

  return { practices, completions, byPracticeId, error, reload };
}
