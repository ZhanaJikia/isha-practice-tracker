import { UI_TEXT } from "@/config/uiText";

export type AuthMode = "login" | "register";

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null;
}

export function validateAuthInput(params: { username: string; password: string }): string | null {
  const u = params.username.trim();
  if (!u) return UI_TEXT.auth.usernameRequired;
  if (!params.password) return UI_TEXT.auth.passwordRequired;
  return null;
}

export function authErrorMessage(mode: AuthMode, data: unknown): string {

  if (isRecord(data) && isRecord(data.error)) {
    const err = data.error as Record<string, unknown>;
    const code = typeof err.code === "string" ? err.code : undefined;
    const message = typeof err.message === "string" ? err.message : undefined;

    switch (code) {
      case "INVALID_CREDENTIALS":
        return UI_TEXT.auth.invalidCredentials;
      case "USERNAME_TAKEN":
        return UI_TEXT.auth.usernameTaken;
      case "VALIDATION_ERROR":
        return message ?? UI_TEXT.auth.invalidInput;
      default:
        return message ?? `${mode} failed`;
    }
  }

  // Legacy shape: { error?: string, details?: unknown }
  if (isRecord(data)) {
    const legacyError = data.error;
    if (typeof legacyError === "string") return legacyError;
  }

  return `${mode} failed`;
}

