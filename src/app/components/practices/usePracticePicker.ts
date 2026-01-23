"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { createCustomPractice, getOnboarding, getPractices, type PracticeDto } from "@/lib/http/api";

export type PracticePickerMode = "onboarding" | "manage";
export const MAX_SELECTED = 10;

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null;
}

function extractErrorMessage(data: unknown): string | null {
  if (isRecord(data) && isRecord(data.error)) {
    const err = data.error as Record<string, unknown>;
    return typeof err.message === "string" ? err.message : null;
  }
  
  if (isRecord(data) && typeof data.error === "string") return data.error;
  return null;
}

export function usePracticePicker(params: { mode: PracticePickerMode }) {
  const { mode } = params;
  const router = useRouter();

  const [practices, setPractices] = useState<PracticeDto[] | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);
  const [customBusy, setCustomBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const selectedCount = selectedIds.length;
  const canSelectMore = selectedCount < MAX_SELECTED;

  const items = useMemo(() => practices ?? [], [practices]);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const [p, o] = await Promise.all([getPractices(), getOnboarding()]);
        if (cancelled) return;

        setPractices(p.practices);

        const allowed = new Set(p.practices.map((x) => x.id));
        const initial = o.practiceIds.filter((id) => allowed.has(id));
        setSelectedIds(initial);
      } catch (e: unknown) {
        const err = e as import("@/lib/http/client").HttpError;
        if (err?.status === 401) router.replace("/login");
        else setError(err?.message ?? "Failed to load practices.");
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [router]);

  function togglePractice(id: string) {
    setError(null);

    setSelectedIds((prev) => {
      const on = prev.includes(id);
      if (on) return prev.filter((x) => x !== id);

      if (prev.length >= MAX_SELECTED) {
        setError(`You can select up to ${MAX_SELECTED} practices.`);
        return prev;
      }

      return [...prev, id];
    });
  }

  async function addCustomPractice(nameRaw: string) {
    setError(null);

    if (selectedIds.length >= MAX_SELECTED) {
      setError(`You already selected ${MAX_SELECTED} practices. Remove one first.`);
      return;
    }

    const name = nameRaw.trim();
    if (!name) {
      setError("Custom practice name is required.");
      return;
    }

    setCustomBusy(true);
    try {
      const res = await createCustomPractice({ name });

      setPractices((prev) => (prev ? [...prev, res.practice] : [res.practice]));
      setSelectedIds((prev) => (prev.includes(res.practice.id) ? prev : [...prev, res.practice.id]));
    } catch (e: unknown) {
      const err = e as import("@/lib/http/client").HttpError;
      setError(err?.message ?? "Failed to create custom practice.");
    } finally {
      setCustomBusy(false);
    }
  }

  async function saveSelection() {
    setError(null);

    if (selectedIds.length < 1) {
      setError("Please choose at least one practice.");
      return;
    }
    if (selectedIds.length > MAX_SELECTED) {
      setError(`You can select up to ${MAX_SELECTED} practices.`);
      return;
    }

    setBusy(true);
    try {
      const res = await fetch("/api/onboarding/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ practiceIds: selectedIds }),
      });

      const data: unknown = await res.json().catch(() => null);
      if (!res.ok) {
        setError(extractErrorMessage(data) ?? "Failed to save practices.");
        return;
      }

      if (mode === "onboarding") router.push("/");
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  return {
    // data
    practices,
    items,
    selectedIds,
    selectedCount,
    canSelectMore,

    // ui state
    busy,
    customBusy,
    error,

    // actions
    togglePractice,
    addCustomPractice,
    saveSelection,
    clearError: () => setError(null),
  };
}