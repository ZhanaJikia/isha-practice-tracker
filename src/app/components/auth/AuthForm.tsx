"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { UI_TEXT } from "@/config/uiText";
import { authErrorMessage, validateAuthInput, type AuthMode } from "./authValidation";
import { cn } from "@/lib/utils";

export function AuthForm({
  initialMode = "login",
  successRedirectTo = "/",
  modeRoutes = { login: "/login", register: "/register" },
}: {
  initialMode?: AuthMode;
  successRedirectTo?: string;
  modeRoutes?: { login: string; register: string };
}) {
  const router = useRouter();

  const [mode, setMode] = useState<AuthMode>(initialMode);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

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

  const isLogin = mode === "login";

  return (
    <section className="space-y-5">
      {/* Mode tabs */}
      <div className="flex rounded-xl bg-muted p-1">
        {(["login", "register"] as AuthMode[]).map((m) => (
          <button
            key={m}
            type="button"
            onClick={() => {
              setError(null);
              setMode(m);
              router.push(m === "login" ? modeRoutes.login : modeRoutes.register);
            }}
            className={cn(
              "flex-1 rounded-lg py-2 text-sm font-medium transition-all",
              mode === m
                ? "bg-card text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            {m === "login" ? "Sign in" : "Create account"}
          </button>
        ))}
      </div>

      {/* Fields */}
      <div className="space-y-3">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-foreground" htmlFor="username">
            Username
          </label>
          <input
            id="username"
            className={cn(
              "w-full rounded-xl border bg-background px-3.5 py-2.5 text-sm transition",
              "placeholder:text-muted-foreground",
              "focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring",
              error && "border-destructive focus:ring-destructive"
            )}
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="your_username"
            autoCapitalize="none"
            autoCorrect="off"
            spellCheck={false}
            onKeyDown={(e) => e.key === "Enter" && void submit()}
          />
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-foreground" htmlFor="password">
            Password
          </label>
          <div className="relative">
            <input
              id="password"
              className={cn(
                "w-full rounded-xl border bg-background px-3.5 py-2.5 pr-10 text-sm transition",
                "placeholder:text-muted-foreground",
                "focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring",
                error && "border-destructive focus:ring-destructive"
              )}
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              onKeyDown={(e) => e.key === "Enter" && void submit()}
            />
            <button
              type="button"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground transition hover:text-foreground"
              onClick={() => setShowPassword((v) => !v)}
              tabIndex={-1}
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="rounded-xl border border-destructive/30 bg-destructive/8 px-3.5 py-3 text-sm text-destructive">
          {error}
        </div>
      )}

      {/* Submit button */}
      <button
        className={cn(
          "relative w-full rounded-xl px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-all",
          "bg-primary hover:bg-primary/90 active:scale-[0.98]",
          "disabled:cursor-not-allowed disabled:opacity-60"
        )}
        onClick={() => void submit()}
        disabled={busy}
      >
        {busy ? (
          <span className="flex items-center justify-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            {isLogin ? "Signing in…" : "Creating account…"}
          </span>
        ) : isLogin ? (
          UI_TEXT.auth.loginButton
        ) : (
          UI_TEXT.auth.registerButton
        )}
      </button>
    </section>
  );
}
