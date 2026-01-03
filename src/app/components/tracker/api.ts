import { fetchJson } from "@/lib/http/client";
import type { Practice } from "@/config/practices";
import type { CompletionsResponse } from "./types";

export async function getPractices(): Promise<{ practices: Practice[] }> {
  return fetchJson("/api/practices", { cache: "no-store" });
}

export async function getCompletions(): Promise<CompletionsResponse> {
  return fetchJson("/api/completions", { cache: "no-store" });
}

export async function donePractice(practiceId: string) {
  return fetchJson("/api/done", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ practiceId }),
  });
}

export async function undoPractice(practiceId: string) {
  return fetchJson("/api/undo", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ practiceId }),
  });
}
