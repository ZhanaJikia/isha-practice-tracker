import Link from "next/link";
import { ArrowRight } from "lucide-react";

export function HeroSection() {
  return (
    <section className="relative overflow-hidden px-6 pb-24 pt-20">
      <div
        className="pointer-events-none absolute left-1/2 top-0 h-[600px] w-[900px] -translate-x-1/2 rounded-full blur-3xl"
        style={{ background: "radial-gradient(ellipse, rgba(161,200,0,0.12) 0%, transparent 70%)" }}
      />
      <div
        className="pointer-events-none absolute -right-32 top-40 h-80 w-80 rounded-full blur-3xl"
        style={{ background: "rgba(234,179,8,0.12)" }}
      />
      <div
        className="pointer-events-none absolute -left-32 top-60 h-64 w-64 rounded-full blur-3xl"
        style={{ background: "rgba(34,197,94,0.1)" }}
      />

      <div className="relative mx-auto max-w-4xl text-center">
        <div
          className="mb-6 inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-sm"
          style={{ borderColor: "rgba(234,179,8,0.35)", background: "rgba(234,179,8,0.1)", color: "#fde047" }}
        >
          <span className="relative flex h-2 w-2">
            <span
              className="absolute inline-flex h-full w-full animate-ping rounded-full opacity-75"
              style={{ background: "#fde047" }}
            />
            <span className="relative inline-flex h-2 w-2 rounded-full" style={{ background: "#fde047" }} />
          </span>
          Five daily practices. One focused life.
        </div>

        <h1 className="mb-6 text-5xl font-extrabold leading-tight tracking-tight md:text-7xl">
          Build your{" "}
          <span
            style={{
              background: "linear-gradient(135deg, #fde047 0%, #86efac 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            sacred practices
          </span>
        </h1>

        <p className="mx-auto mb-10 max-w-xl text-lg leading-relaxed" style={{ color: "rgba(255,255,255,0.58)" }}>
          Walks. Cold showers. Journaling. Meditation. Track them daily, earn points, and build the discipline that
          changes everything.
        </p>

        <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
          <Link
            href="/register"
            className="flex w-full items-center justify-center gap-2 rounded-xl px-8 py-3.5 font-semibold text-white shadow-lg transition hover:opacity-90 sm:w-auto"
            style={{ background: "linear-gradient(135deg, #ca8a04, #a16207)", boxShadow: "0 8px 24px rgba(202,138,4,0.35)" }}
          >
            Start tracking free <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            href="/login"
            className="flex w-full items-center justify-center rounded-xl border px-8 py-3.5 font-semibold transition hover:border-white/25 sm:w-auto"
            style={{ borderColor: "rgba(255,255,255,0.12)", color: "rgba(255,255,255,0.75)" }}
          >
            Sign in
          </Link>
        </div>
      </div>
    </section>
  );
}
