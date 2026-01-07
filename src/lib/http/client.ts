type LegacyErrorPayload = { error?: string; details?: unknown };

type StandardErrorObject = { code: string; message: string; details?: unknown };
type StandardErrorPayload = { error: StandardErrorObject };

type ApiErrorPayload = LegacyErrorPayload | StandardErrorPayload;

export type HttpError = Error & {
  status?: number;
  code?: string;
  details?: unknown;
  body?: ApiErrorPayload;
};

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null;
}

function isStandardErrorPayload(v: unknown): v is StandardErrorPayload {
  if (!isRecord(v)) return false;
  const err = v.error;
  return (
    isRecord(err) &&
    typeof err.code === "string" &&
    typeof err.message === "string"
  );
}

function isLegacyErrorPayload(v: unknown): v is LegacyErrorPayload {
  if (!isRecord(v)) return false;
  const e = v.error;
  return e === undefined || typeof e === "string";
}

export async function fetchJson<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, { ...init, credentials: "include" });

  if (res.ok) return (await res.json()) as T;

  let body: unknown = null;
  try {
    body = await res.json();
  } catch {}

  let message: string | undefined;
  let code: string | undefined;
  let details: unknown = undefined;

  if (isStandardErrorPayload(body)) {
    message = body.error.message;
    code = body.error.code;
    details = body.error.details;
  } else if (isLegacyErrorPayload(body)) {
    message = body.error;
    details = body.details;
  }

  const err = new Error(message ?? `Request failed (${res.status})`) as HttpError;
  err.status = res.status;
  err.code = code;
  err.details = details;
  err.body = (isStandardErrorPayload(body) || isLegacyErrorPayload(body)) ? body : undefined;

  throw err;
}

