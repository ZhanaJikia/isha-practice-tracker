"use client";

export function ErrorBanner({ message }: { message: string | null }) {
  if (!message) return null;
  return <div className="rounded border p-3 text-sm">{message}</div>;
}