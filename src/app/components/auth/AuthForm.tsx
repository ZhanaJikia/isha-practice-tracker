"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Mode = "login" | "register";

export function AuthForm({
  initialMode = "login",
  successRedirectTo = "/",
}: {
  initialMode?: Mode;
  successRedirectTo?: string;
}) {
  const router = useRouter();

  const [mode, setMode] = useState<Mode>(initialMode);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit() {
    setError(null);

    const u = username.trim();
    if (!u) return setError("Username is required");
    if (!password) return setError("Password is required");

    setBusy(true);
    try {
      const endpoint = mode === "login" ? "/api/login" : "/api/register";

      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ username: u, password }),
      });

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        setError(data?.error ?? `${mode} failed`);
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
        {mode === "login" ? "Login" : "Create account"}
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

      <button
        className="rounded border px-3 py-2 text-sm disabled:opacity-50"
        onClick={submit}
        disabled={busy}
      >
        {busy ? "…" : mode === "login" ? "Login" : "Register"}
      </button>

      <button
        className="text-sm underline opacity-80"
        onClick={() => {
          setError(null);
          setMode(mode === "login" ? "register" : "login");
        }}
      >
        {mode === "login" ? "Need an account? Register" : "Have an account? Login"}
      </button>
    </section>
  );
}
