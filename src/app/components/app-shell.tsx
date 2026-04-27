"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { LayoutDashboard, BarChart2, Trophy, LogOut } from "lucide-react"
import { cn } from "@/lib/utils"
import { LogoutButton } from "@/app/components/auth/LogoutButton"
import { LogoWordmark } from "@/app/components/Logo"

const NAV = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/stats", label: "Stats", icon: BarChart2 },
  { href: "/leaderboard", label: "Leaderboard", icon: Trophy },
]

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  const pageTitle =
    pathname === "/"
      ? "Dashboard"
      : pathname.startsWith("/stats")
        ? "Stats"
        : pathname.startsWith("/leaderboard")
          ? "Leaderboard"
          : "App"

  const pageSubtitle =
    pathname === "/"
      ? "Log your practices for today"
      : pathname.startsWith("/stats")
        ? "Your progress at a glance"
        : pathname.startsWith("/leaderboard")
          ? "How you stack up"
          : ""

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-6xl px-4 py-6 md:px-6">
        <div className="grid gap-6 md:grid-cols-[260px_1fr]">

          {/* ── Sidebar (desktop) ── */}
          <aside className="hidden md:block">
            <div className="sticky top-6 space-y-2">
              {/* Logo wordmark */}
              <div className="mb-6 px-1">
                <LogoWordmark size={36} />
              </div>

              {/* Nav links */}
              <nav className="space-y-0.5">
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
                        "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all",
                        active
                          ? "bg-primary text-primary-foreground shadow-sm"
                          : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                      )}
                    >
                      <item.icon className="h-4 w-4 shrink-0" />
                      {item.label}
                    </Link>
                  )
                })}
              </nav>

              <div className="my-3 border-t border-border" />

              <LogoutButton
                redirectTo="/welcome"
                className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-muted-foreground transition hover:bg-accent hover:text-foreground disabled:opacity-50"
                icon={<LogOut className="h-4 w-4 shrink-0" />}
              />
            </div>
          </aside>

          {/* ── Main ── */}
          <main className="min-w-0 pb-24 md:pb-0">
            <div className="mb-6">
              <h1 className="text-2xl font-bold tracking-tight">{pageTitle}</h1>
              {pageSubtitle && (
                <p className="mt-1 text-sm text-muted-foreground">{pageSubtitle}</p>
              )}
            </div>
            {children}
          </main>
        </div>
      </div>

      {/* ── Mobile bottom nav ── */}
      <nav className="fixed inset-x-0 bottom-0 z-50 flex border-t border-border bg-card/95 backdrop-blur-sm md:hidden">
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
                "flex flex-1 flex-col items-center gap-1 py-3 text-xs font-medium transition-colors",
                active ? "text-primary" : "text-muted-foreground hover:text-foreground"
              )}
            >
              <item.icon className={cn("h-5 w-5", active && "scale-110 transition-transform")} />
              <span>{item.label}</span>
            </Link>
          )
        })}
        <div className="flex flex-1 flex-col items-center gap-1 py-3">
          <LogoutButton
            redirectTo="/welcome"
            className="flex flex-col items-center gap-1 text-xs font-medium text-muted-foreground disabled:opacity-50"
            icon={<LogOut className="h-5 w-5" />}
            label="Logout"
          />
        </div>
      </nav>
    </div>
  )
}
