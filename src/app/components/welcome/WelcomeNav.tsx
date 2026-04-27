import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { LogoMark } from "@/app/components/Logo";

export function WelcomeNav() {
  return (
    <header
      className="sticky top-0 z-50 border-b backdrop-blur-xl"
      style={{ borderColor: "rgba(255,255,255,0.07)", background: "rgba(6,14,7,0.85)" }}
    >
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <div className="flex items-center gap-2.5">
          <LogoMark size={34} />
          <span className="font-bold tracking-tight text-white">Sacred 5</span>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/login" className="rounded-lg px-4 py-2 text-sm font-medium text-white/65 transition hover:text-white">
            Sign in
          </Link>
          <Link
            href="/register"
            className="flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-semibold text-white transition"
            style={{ background: "#ca8a04" }}
          >
            Get started <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>
    </header>
  );
}
