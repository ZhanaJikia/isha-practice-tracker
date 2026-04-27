import Link from "next/link";
import { AuthForm } from "@components/auth/AuthForm";
import { LogoMark } from "@/app/components/Logo";

export default function RegisterPage() {
  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-background px-4 py-12">
      {/* Background glow */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -right-32 -top-32 h-96 w-96 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute -bottom-32 -left-32 h-96 w-96 rounded-full blur-3xl" style={{ background: "oklch(0.60 0.17 145 / 0.1)" }} />
      </div>

      <div className="relative w-full max-w-sm">
        {/* Logo */}
        <div className="mb-8 flex flex-col items-center text-center">
          <LogoMark size={52} />
          <h1 className="mt-4 text-2xl font-bold tracking-tight">Start your journey</h1>
          <p className="mt-1.5 text-sm text-muted-foreground">Create a free account and begin tracking</p>
        </div>

        {/* Form card */}
        <div className="rounded-2xl border bg-card p-6 shadow-sm">
          <AuthForm initialMode="register" successRedirectTo="/" />
        </div>

        {/* Back link */}
        <div className="mt-6 text-center text-sm text-muted-foreground">
          <Link href="/welcome" className="underline underline-offset-2 hover:text-foreground transition-colors">
            ← Back to home
          </Link>
        </div>
      </div>
    </main>
  );
}
