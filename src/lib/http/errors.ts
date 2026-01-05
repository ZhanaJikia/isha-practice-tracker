import { NextResponse } from "next/server";

export type ApiErrorCode =
  | "UNAUTHORIZED"
  | "VALIDATION_ERROR"
  | "INVALID_DAY_KEY"
  | "MAX_PER_DAY_REACHED"
  | "INTERNAL_ERROR";

export type ApiErrorPayload<TDetails = unknown> = {
  error: {
    code: ApiErrorCode;
    message: string;
    details?: TDetails;
  };
};

export function jsonError<TDetails = unknown>(
  status: number,
  code: ApiErrorCode,
  message: string,
  details?: TDetails
) {
  const payload: ApiErrorPayload<TDetails> = details === undefined
    ? { error: { code, message } }
    : { error: { code, message, details } };

  return NextResponse.json(payload, { status });
}

// Convenience helpers so routes don’t repeat strings/status codes
export function unauthorized() {
  return jsonError(401, "UNAUTHORIZED", "Unauthorized");
}

export function validationError(details?: unknown, message = "Invalid input") {
  return jsonError(400, "VALIDATION_ERROR", message, details);
}

export function invalidDayKey(dayKey: string) {
  return jsonError(400, "INVALID_DAY_KEY", "Invalid dayKey", { dayKey });
}

export function maxPerDayReached(details: {
  practiceId: string;
  dayKey: string;
  maxPerDay: number;
  count: number;
}) {
  return jsonError(409, "MAX_PER_DAY_REACHED", "Max per day reached", details);
}

export function internalError() {
  return jsonError(500, "INTERNAL_ERROR", "Server error");
}
