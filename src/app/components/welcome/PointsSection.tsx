import { Check } from "lucide-react";
import { practices } from "@/app/components/welcome/constants";

export function PointsSection() {
  return (
    <section className="px-6 py-24" style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
      <div className="mx-auto max-w-4xl">
        <div className="mb-12 text-center">
          <h2 className="text-3xl font-bold tracking-tight">How points work</h2>
          <p className="mt-3" style={{ color: "rgba(255,255,255,0.45)" }}>
            Each practice earns you points. Stack them daily.
          </p>
        </div>
        <div className="overflow-hidden rounded-2xl" style={{ border: "1px solid rgba(255,255,255,0.08)" }}>
          {practices.map((p, i) => (
            <div
              key={p.key}
              className="flex items-center gap-4 px-6 py-4"
              style={{ borderTop: i !== 0 ? "1px solid rgba(255,255,255,0.06)" : undefined }}
            >
              <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br ${p.gradient}`}>
                <p.icon className="h-4 w-4 text-white" />
              </div>
              <div className="flex-1">
                <div className="font-medium text-white">{p.label}</div>
                <div className="text-xs" style={{ color: "rgba(255,255,255,0.38)" }}>
                  {p.max}
                </div>
              </div>
              <div className="text-right">
                <div className="font-bold" style={{ color: "#fde047" }}>
                  {p.pts}
                </div>
                <div className="text-xs" style={{ color: "rgba(255,255,255,0.35)" }}>
                  per session
                </div>
              </div>
              <Check className="h-4 w-4" style={{ color: "#4ade80" }} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
