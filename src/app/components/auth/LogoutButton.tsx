"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function LogoutButton({
  redirectTo = "/welcome",
  className = "rounded border px-3 py-2 text-sm disabled:opacity-50",
  label = "Logout",
  icon,
}: {
  redirectTo?: string;
  className?: string;
  label?: string;
  icon?: React.ReactNode;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function logout() {
    setBusy(true);
    try {
      await fetch("/api/logout", {
        method: "POST",
        credentials: "include",
      });
      router.push(redirectTo);
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  return (
    <button className={className} onClick={() => void logout()} disabled={busy}>
      {icon}
      <span>{busy ? "…" : label}</span>
    </button>
  );
}
