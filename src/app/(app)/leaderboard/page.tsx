import { Trophy, Clock } from "lucide-react";

export default function LeaderboardPage() {
  const mockPlayers = [
    { rank: 1, name: "You", pts: 142, streak: 12, avatar: "Y" },
    { rank: 2, name: "sadhana_k", pts: 138, streak: 9, avatar: "S" },
    { rank: 3, name: "inner_fire", pts: 121, streak: 8, avatar: "I" },
  ];

  return (
    <div className="space-y-6">
      {/* Coming soon banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary/10 to-violet-500/10 border border-primary/20 p-6">
        <div className="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full bg-primary/10 blur-2xl" />
        <div className="relative flex items-start gap-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/15">
            <Clock className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h2 className="font-semibold text-foreground">Coming soon</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Leaderboards are in development. Compete with others and climb the ranks.
            </p>
          </div>
        </div>
      </div>

      {/* Preview — blurred placeholder */}
      <div className="relative overflow-hidden rounded-2xl border bg-card p-5 shadow-sm">
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-card/60 backdrop-blur-[2px]">
          <div className="text-center">
            <Trophy className="mx-auto h-8 w-8 text-primary/60" />
            <p className="mt-2 text-sm font-medium text-muted-foreground">
              Leaderboard unlocks soon
            </p>
          </div>
        </div>

        <h3 className="mb-4 text-sm font-semibold text-foreground">This week&apos;s top practitioners</h3>
        <div className="space-y-3">
          {mockPlayers.map((p) => (
            <div key={p.rank} className="flex items-center gap-3 select-none">
              <div className="w-5 text-center text-sm font-bold text-muted-foreground">
                {p.rank}
              </div>
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/15 text-sm font-bold text-primary">
                {p.avatar}
              </div>
              <div className="flex-1">
                <div className="text-sm font-medium">{p.name}</div>
                <div className="text-xs text-muted-foreground">{p.streak} day streak</div>
              </div>
              <div className="text-sm font-bold text-foreground">{p.pts} pts</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
