"use client";

import { useState } from "react";
import type { PracticeKey } from "@/config/practices";
import { donePractice, undoPractice } from "./api";

import { UI_TEXT } from "@/config/uiText";

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
    } catch (e: unknown) {
      const err = e as { status?: number; message?: string };
      // #region agent log
      fetch("http://127.0.0.1:7242/ingest/61dcf881-21e5-4676-b8e9-1cebecb865b5", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId: "debug-session",
          runId: "prefix",
          hypothesisId: "H2",
          location: "useTrackerActions.ts:onDone:error",
          message: "onDone failed",
          data: { status: err?.status, message: err?.message, practiceId },
          timestamp: Date.now(),
        }),
      }).catch(() => {});
      // #endregion
      if (err?.status === 409) setActionError(err?.message ?? UI_TEXT.errors.maxReached);
      else if (err?.status === 401) setActionError(UI_TEXT.auth.pleaseLogin);
      else setActionError(err?.message ?? UI_TEXT.errors.doneFailed);
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
    } catch (e: unknown) {
      const err = e as { status?: number; message?: string };
      // #region agent log
      fetch("http://127.0.0.1:7242/ingest/61dcf881-21e5-4676-b8e9-1cebecb865b5", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId: "debug-session",
          runId: "prefix",
          hypothesisId: "H2",
          location: "useTrackerActions.ts:onUndo:error",
          message: "onUndo failed",
          data: { status: err?.status, message: err?.message, practiceId },
          timestamp: Date.now(),
        }),
      }).catch(() => {});
      // #endregion
      if (err?.status === 401) setActionError(UI_TEXT.auth.pleaseLogin);
      else setActionError(err?.message ?? "Undo failed");
    } finally {
      setBusyKey(null);
    }
  }

  return { busyKey, actionError, onDone, onUndo };
}
