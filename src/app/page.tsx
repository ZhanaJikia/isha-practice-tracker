import { PracticesList } from "@components/tracker/PracticesList";
import { StatsPanel } from "@components/StatsPanel";
import { LogoutButton } from "@components/auth/LogoutButton";

export default function HomePage() {
  return (
    <main className="p-6 space-y-6">
      <header className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Practices</h1>
        <LogoutButton />
      </header>

      <PracticesList />
      <StatsPanel />
    </main>
  );
}
