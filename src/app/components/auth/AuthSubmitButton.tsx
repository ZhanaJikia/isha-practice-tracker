"use client";

import { UI_TEXT } from "@/config/uiText";
import type { AuthMode } from "./authValidation";

export function AuthSubmitButton({
  mode,
  busy,
  onClick,
}: {
  mode: AuthMode;
  busy: boolean;
  onClick: () => void;
}) {
  return (
    <button
      className="rounded border px-3 py-2 text-sm disabled:opacity-50"
      onClick={onClick}
      disabled={busy}
    >
      {busy ? "…" : mode === "login" ? UI_TEXT.auth.loginButton : UI_TEXT.auth.registerButton}
    </button>
  );
}