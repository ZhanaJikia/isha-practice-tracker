import { features } from "@/app/components/welcome/constants";

export function FeaturesSection() {
  return (
    <section className="px-6 py-24" style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
      <div className="mx-auto max-w-5xl">
        <div className="mb-12 text-center">
          <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
            Everything you need. <span style={{ color: "rgba(255,255,255,0.38)" }}>Nothing you don&apos;t.</span>
          </h2>
          <p className="mt-3" style={{ color: "rgba(255,255,255,0.45)" }}>
            Simple by design. Powerful by habit.
          </p>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          {features.map((f) => (
            <div
              key={f.title}
              className="rounded-2xl p-6 transition"
              style={{ border: "1px solid rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.03)" }}
            >
              <div
                className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl"
                style={{ background: "rgba(234,179,8,0.15)" }}
              >
                <f.icon className="h-5 w-5" style={{ color: "#fde047" }} />
              </div>
              <h3 className="mb-2 font-semibold text-white">{f.title}</h3>
              <p className="text-sm leading-relaxed" style={{ color: "rgba(255,255,255,0.48)" }}>
                {f.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
