import { fetchJson } from "@/lib/http/client";
import type { Practice } from "@/config/practices";

export type CompletionsResponse = {
  dayKey: string;
  completions: Array<{
    practiceId: string;
    count: number;
    lastCompletedAt: string | null;
    updatedAt: string;
  }>;
  byPracticeId: Record<
    string,
    { practiceId: string; count: number; lastCompletedAt: string | null; updatedAt: string }
  >;
};

export function getPractices() {
  return fetchJson<{ practices: Practice[] }>("/api/practices", { cache: "no-store" });
}

export function getTodayCompletions() {
  return fetchJson<CompletionsResponse>("/api/completions", { cache: "no-store" });
}

export function postDone(practiceId: string) {
  return fetchJson("/api/done", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ practiceId }),
  });
}

export function postUndo(practiceId: string) {
  return fetchJson("/api/undo", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ practiceId }),
  });
}
