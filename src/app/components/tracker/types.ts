export type CompletionRow = {
    practiceId: string;
    count: number;
    lastCompletedAt: string | null;
    updatedAt: string;
  };
  
  export type CompletionsResponse = {
    dayKey: string;
    completions: CompletionRow[];
    byPracticeId: Record<string, CompletionRow>;
  };
  