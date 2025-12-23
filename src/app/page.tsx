import { PRACTICES } from "../config/practices";

export default function HomePage() {
  return (
    <main className="p-6">
      <h1 className="text-2xl font-semibold">Practices</h1>

      <ul className="mt-4 space-y-2">
        {PRACTICES.map((p) => (
          <li key={p.key} className="rounded border p-3">
            <div className="font-medium">{p.label}</div>
            <div className="text-sm opacity-70">
              key: {p.key} · points: {p.points} · max/day: {p.maxPerDay}
            </div>
          </li>
        ))}
      </ul>
    </main>
  );
}
