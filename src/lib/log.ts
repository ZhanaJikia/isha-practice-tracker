import "server-only";

export function logError(scope: string, err: unknown, extra?: Record<string, unknown>) {
  console.error(scope, { err, ...extra });
}