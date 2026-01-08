import { PracticesList } from "@components/tracker/PracticesList";
import { StatsPanel } from "@components/tracker/StatsPanel";

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <PracticesList />
      <StatsPanel />
    </div>
  );
}


