import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { LogoMark } from "@/app/components/Logo";

export function CtaSection() {
  return (
    <section className="px-6 py-24" style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
      <div
        className="relative mx-auto max-w-2xl overflow-hidden rounded-3xl p-12 text-center"
        style={{ border: "1px solid rgba(234,179,8,0.2)", background: "linear-gradient(135deg, rgba(234,179,8,0.12), rgba(34,197,94,0.08))" }}
      >
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <div className="h-64 w-64 rounded-full blur-3xl" style={{ background: "rgba(234,179,8,0.15)" }} />
        </div>
        <div className="relative">
          <LogoMark size={48} />
          <h2 className="mb-3 mt-4 text-3xl font-bold text-white">Start today</h2>
          <p className="mb-8" style={{ color: "rgba(255,255,255,0.55)" }}>
            Your future self is built one sacred practice at a time.
          </p>
          <Link
            href="/register"
            className="inline-flex items-center gap-2 rounded-xl px-8 py-3.5 font-semibold text-white shadow-lg transition hover:opacity-90"
            style={{ background: "linear-gradient(135deg, #ca8a04, #a16207)", boxShadow: "0 8px 24px rgba(202,138,4,0.4)" }}
          >
            Create your account <ArrowRight className="h-4 w-4" />
          </Link>
          <div className="mt-4 text-sm" style={{ color: "rgba(255,255,255,0.38)" }}>
            Already have an account?{" "}
            <Link href="/login" className="underline underline-offset-2" style={{ color: "#fde047" }}>
              Sign in
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
