"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  getOnboarding,
  getPractices,
  getTodayCompletions,
  type CompletionsResponse,
  type PracticeDto,
} from "@/lib/http/api";
import { UI_TEXT } from "@/config/uiText";


export function useTrackerData() {
  const router = useRouter();
  const [practices, setPractices] = useState<PracticeDto[] | null>(null);
  const [completions, setCompletions] = useState<CompletionsResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const reload = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const [o, p, c] = await Promise.all([getOnboarding(), getPractices(), getTodayCompletions()]);

      const byId = Object.fromEntries(p.practices.map((x) => [x.id, x]));
      const practices = o.practiceIds.map((id) => byId[id]).filter(Boolean);
      
      setPractices(practices);
      setCompletions(c);
    } catch (e: unknown) {
      const err = e as import("@/lib/http/client").HttpError;
      if (err?.status === 401) {
        setError(UI_TEXT.auth.pleaseLogin);
        router.replace("/login");
      }
      else setError(err?.message ?? UI_TEXT.errors.genericLoad);
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    
    void reload();
  }, [reload]);

  const byPracticeId = useMemo(() => completions?.byPracticeId ?? {}, [completions]);

  return { practices, completions, byPracticeId, loading, error, reload };
}
