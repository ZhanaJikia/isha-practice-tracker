"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Separator } from "@/components/ui/separator"
import { LogoutButton } from "@/app/components/auth/LogoutButton"

const NAV = [
  { href: "/", label: "Dashboard" },
  { href: "/stats", label: "Stats" },
  { href: "/leaderboard", label: "Leaderboard" },
]

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const title =
    pathname === "/"
      ? "Dashboard"
      : pathname.startsWith("/stats")
        ? "Stats"
        : pathname.startsWith("/leaderboard")
          ? "Leaderboard"
          : "App"

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-6xl px-4 py-6">
        <div className="grid gap-6 md:grid-cols-[240px_1fr]">
          {/* Sidebar */}
          <aside className="hidden md:block">
            <div className="rounded-xl border bg-card p-4">
              <div className="flex items-center gap-2 text-sm font-semibold">
                <img src="/favicon.ico" alt="" className="h-4 w-4" />
                <span>Isha Practice Tracker</span>
              </div>
              <div className="mt-3">
                <Separator />
              </div>
              <nav className="mt-3 flex flex-col gap-1">
                {NAV.map((item) => {
                  const active =
                    item.href === "/"
                      ? pathname === "/"
                      : pathname.startsWith(item.href)

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={cn(
                        "rounded-md px-3 py-2 text-sm transition hover:bg-muted",
                        active && "bg-muted font-medium"
                      )}
                    >
                      {item.label}
                    </Link>
                  )
                })}
              </nav>

              <div className="mt-4">
                <Separator />
              </div>

              <div className="mt-4 flex gap-2">
                <LogoutButton
                  className="w-full rounded-md border border-black/10 bg-white px-3 py-2 text-sm shadow-sm transition hover:bg-black/5 disabled:opacity-50 dark:border-white/10 dark:bg-white/5 dark:hover:bg-white/10"
                />
              </div>
            </div>
          </aside>

          {/* Main */}
          <main>
            {/* Topbar (simple) */}
            <div className="mb-6 flex items-center justify-between">
              <div>
                <div className="text-lg font-semibold">{title}</div>
                <div className="text-sm text-muted-foreground">
                  Track your practices and see progress.
                </div>
              </div>
            </div>

            {children}
          </main>
        </div>
      </div>
    </div>
  )
}
