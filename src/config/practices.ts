

export const PRACTICES = [
    { key: "walk", label: "Walk", points: 2, maxPerDay: 2 },
    { key: "cold_shower", label: "Cold shower", points: 5, maxPerDay: 1 },
    { key: "journal", label: "Journal", points: 1, maxPerDay: 1 },
  ] as const;
  
  export type Practice = (typeof PRACTICES)[number];
  export type PracticeKey = Practice["key"];
  
  const keys = PRACTICES.map((p) => p.key);
  const uniqueKeys = new Set(keys);
  if (uniqueKeys.size !== keys.length) {
    throw new Error("PRACTICES contains duplicate keys");
  }
  
  export const PRACTICE_BY_KEY: Record<PracticeKey, Practice> = Object.fromEntries(
    PRACTICES.map((p) => [p.key, p])
  ) as Record<PracticeKey, Practice>;
  
  export function isPracticeKey(value: string): value is PracticeKey {
    return value in PRACTICE_BY_KEY;
  }
  