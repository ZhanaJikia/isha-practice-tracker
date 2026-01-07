"use client";

import { useState } from "react";
import type { PracticeKey } from "@/config/practices";
import { postDone, postUndo } from "@/lib/http/api";
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
      await postDone(practiceId);
      await reload();
      emitPracticeUpdated();
    } catch (e: unknown) {
      const err = e as import("@/lib/http/client").HttpError;

      if (err?.code === "MAX_PER_DAY_REACHED") {
        setActionError(UI_TEXT.errors.maxReached);
      } else if (err?.status === 401) {
        setActionError(UI_TEXT.auth.pleaseLogin);
      } else {
        setActionError(err?.message ?? UI_TEXT.errors.doneFailed);
      }
    } finally {
      setBusyKey(null);
    }
  }

  async function onUndo(practiceId: PracticeKey) {
    try {
      setBusyKey(practiceId);
      setActionError(null);
      await postUndo(practiceId);
      await reload();
      emitPracticeUpdated();
    } catch (e: unknown) {
      const err = e as { status?: number; message?: string };
      if (err?.status === 401) setActionError(UI_TEXT.auth.pleaseLogin);
      else setActionError(err?.message ?? UI_TEXT.errors.undoFailed);
    } finally {
      setBusyKey(null);
    }
  }

  return { busyKey, actionError, onDone, onUndo };
}
