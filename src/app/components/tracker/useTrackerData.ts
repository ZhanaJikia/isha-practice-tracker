"use client";

import { useEffect, useMemo, useState } from "react";
import type { Practice } from "@/config/practices";
import type { CompletionsResponse } from "./types";
import { getPractices, getCompletions } from "./api";

import { UI_TEXT } from "@/config/uiText";


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
      if (e?.status === 401) setError(UI_TEXT.auth.pleaseLogin);
      else setError(e?.message ?? UI_TEXT.errors.genericLoad);
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
