"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { Practice } from "@/config/practices";
import type { CompletionsResponse } from "./types";
import { getPractices, getCompletions } from "./api";
import { UI_TEXT } from "@/config/uiText";

type HttpLikeError = { status?: number; message?: string };

export function useTrackerData() {
  const [practices, setPractices] = useState<Practice[] | null>(null);
  const [completions, setCompletions] = useState<CompletionsResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const reload = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const [p, c] = await Promise.all([getPractices(), getCompletions()]);
      setPractices(p.practices);
      setCompletions(c);
    } catch (e: unknown) {
      const err = e as HttpLikeError;
      if (err?.status === 401) setError(UI_TEXT.auth.pleaseLogin);
      else setError(err?.message ?? UI_TEXT.errors.genericLoad);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    
    void reload();
  }, [reload]);

  const byPracticeId = useMemo(() => completions?.byPracticeId ?? {}, [completions]);

  return { practices, completions, byPracticeId, loading, error, reload };
}
