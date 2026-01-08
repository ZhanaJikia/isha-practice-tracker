"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { UI_TEXT } from "@/config/uiText";
import { AuthSubmitButton } from "./AuthSubmitButton";
import { AuthModeToggleButton } from "./AuthModeToggleButton";
import { authErrorMessage, validateAuthInput, type AuthMode } from "./authValidation";

export function AuthForm({
  initialMode = "login",
  successRedirectTo = "/",
}: {
  initialMode?: AuthMode;
  successRedirectTo?: string;
}) {
  const router = useRouter();

  const [mode, setMode] = useState<AuthMode>(initialMode);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit() {
    setError(null);

    const inputError = validateAuthInput({ username, password });
    if (inputError) return setError(inputError);

    const u = username.trim();

    setBusy(true);
    try {
      const endpoint = mode === "login" ? "/api/login" : "/api/register";

      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ username: u, password }),
      });

      const data: unknown = await res.json().catch(() => null);

      if (!res.ok) {
        setError(authErrorMessage(mode, data));
        return;
      }

      router.push(successRedirectTo);
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="space-y-4">
      <h1 className="text-2xl font-semibold">
        {mode === "login" ? UI_TEXT.auth.loginTitle : UI_TEXT.auth.registerTitle}
      </h1>

      <div className="space-y-3">
        <label className="block text-sm">
          Username
          <input
            className="mt-1 w-full rounded border bg-transparent p-2"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="your_username"
            autoCapitalize="none"
            autoCorrect="off"
            spellCheck={false}
          />
        </label>

        <label className="block text-sm">
          Password
          <input
            className="mt-1 w-full rounded border bg-transparent p-2"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
          />
        </label>
      </div>

      {error && <div className="rounded border p-3 text-sm">{error}</div>}

      <AuthSubmitButton mode={mode} busy={busy} onClick={submit} />
      <AuthModeToggleButton
        mode={mode}
        onToggle={() => {
          setError(null);
          setMode(mode === "login" ? "register" : "login");
        }}
      />
    </section>
  );
}

