import { StatsPanel } from "@components/tracker/StatsPanel";

export default function StatsPage() {
  return (
    <div className="space-y-6">
      <div className="rounded-2xl border bg-card p-5 shadow-sm">
        <p className="text-sm text-muted-foreground">
          Your weekly practice summary — how many sessions you completed and how many points
          you earned per discipline.
        </p>
      </div>
      <StatsPanel />
    </div>
  );
}
