"use client";

import { useState } from "react";
import type { PracticeKey } from "@/config/practices";
import { donePractice, undoPractice } from "./api";

function emitPracticeUpdated() {
  window.dispatchEvent(new Event("practice-updated"));
}

export function useTrackerActions(reload: () => Promise<void>) {
  const [busyKey, setBusyKey] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  async function onDone(practiceId: PracticeKey) {
    try {
      setBusyKey(practiceId);
      setActionError(null);
      await donePractice(practiceId);
      await reload();
      emitPracticeUpdated();
    } catch (e: any) {
      if (e?.status === 409) setActionError(e?.message ?? "Max per day reached");
      else if (e?.status === 401) setActionError("Please log in");
      else setActionError(e?.message ?? "Done failed");
    } finally {
      setBusyKey(null);
    }
  }

  async function onUndo(practiceId: PracticeKey) {
    try {
      setBusyKey(practiceId);
      setActionError(null);
      await undoPractice(practiceId);
      await reload();
      emitPracticeUpdated();
    } catch (e: any) {
      if (e?.status === 401) setActionError("Please log in");
      else setActionError(e?.message ?? "Undo failed");
    } finally {
      setBusyKey(null);
    }
  }

  return { busyKey, actionError, onDone, onUndo };
}
