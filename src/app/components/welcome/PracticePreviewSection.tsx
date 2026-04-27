import { practices, statWidths } from "@/app/components/welcome/constants";

export function PracticePreviewSection() {
  return (
    <section className="relative mx-auto mt-20 max-w-5xl px-6">
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {practices.map((p) => (
          <div
            key={p.key}
            className="group rounded-2xl p-5 transition-all hover:-translate-y-1"
            style={{ border: "1px solid rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.04)" }}
          >
            <div className={`mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br ${p.gradient}`}>
              <p.icon className="h-5 w-5 text-white" />
            </div>
            <div className="font-semibold text-white">{p.label}</div>
            <div className="mt-1 text-xs" style={{ color: "rgba(255,255,255,0.5)" }}>
              {p.description}
            </div>
            <div className="mt-3 flex items-center gap-2">
              <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${p.badge}`}>{p.pts}</span>
              <span className="text-xs" style={{ color: "rgba(255,255,255,0.35)" }}>
                {p.max}
              </span>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 rounded-2xl p-5" style={{ border: "1px solid rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.04)" }}>
        <div className="flex items-center justify-between">
          <div className="text-sm font-medium" style={{ color: "rgba(255,255,255,0.6)" }}>
            This week
          </div>
          <div className="text-sm font-bold" style={{ color: "#fde047" }}>
            34 pts · 6 active days
          </div>
        </div>
        <div className="mt-4 space-y-3">
          {practices.map((p, i) => (
            <div key={p.key} className="flex items-center gap-3">
              <div className="w-24 truncate text-xs" style={{ color: "rgba(255,255,255,0.45)" }}>
                {p.label}
              </div>
              <div className="h-1.5 flex-1 overflow-hidden rounded-full" style={{ background: "rgba(255,255,255,0.08)" }}>
                <div className={`h-full rounded-full bg-gradient-to-r ${p.gradient}`} style={{ width: statWidths[i] }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
