import { LogoMark } from "@/app/components/Logo";

export function WelcomeFooter() {
  return (
    <footer className="px-6 py-8" style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
      <div className="mx-auto flex max-w-6xl items-center justify-between">
        <div className="flex items-center gap-2 text-sm" style={{ color: "rgba(255,255,255,0.28)" }}>
          <LogoMark size={20} />
          <span>Sacred 5</span>
        </div>
        <div className="text-xs" style={{ color: "rgba(255,255,255,0.2)" }}>
          Built with Next.js · Prisma · Postgres
        </div>
      </div>
    </footer>
  );
}
