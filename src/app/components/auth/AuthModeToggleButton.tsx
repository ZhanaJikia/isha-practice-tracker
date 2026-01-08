"use client";

import { UI_TEXT } from "@/config/uiText";
import type { AuthMode } from "./authValidation";

export function AuthModeToggleButton({
  mode,
  onToggle,
}: {
  mode: AuthMode;
  onToggle: () => void;
}) {
  return (
    <button className="text-sm underline opacity-80" onClick={onToggle} type="button">
      {mode === "login" ? UI_TEXT.auth.toggleToRegister : UI_TEXT.auth.toggleToLogin}
    </button>
  );
}