export type ApiErrorShape = { error?: string; details?: unknown };

export async function fetchJson<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, { ...init, credentials: "include" });

  if (res.ok) return (await res.json()) as T;

  let body: ApiErrorShape | null = null;
  try {
    body = (await res.json()) as ApiErrorShape;
  } catch {}

  const msg = body?.error ?? `Request failed (${res.status})`;
  const err = new Error(msg) as Error & { status?: number; body?: ApiErrorShape };
  err.status = res.status;
  err.body = body ?? undefined;
  throw err;
}
