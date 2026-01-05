export const PRACTICES = [
  { key: "walk", label: "Walk", points: 2, maxPerDay: 2 },
  { key: "cold_shower", label: "Cold shower", points: 5, maxPerDay: 1 },
  { key: "journal", label: "Journal", points: 1, maxPerDay: 1 },
  { key: "meditation", label: "Mditation", points: 5, maxPerDay: 2 },

] as const;

export type Practice = (typeof PRACTICES)[number];
export type PracticeKey = Practice["key"];

export const PRACTICE_KEYS = PRACTICES.map((p) => p.key) as PracticeKey[];

// Dev-only sanity check
if (process.env.NODE_ENV !== "production") {
  const unique = new Set(PRACTICE_KEYS);
  if (unique.size !== PRACTICE_KEYS.length) {
    throw new Error("PRACTICES contains duplicate keys");
  }
}

// Typed map builder (no unsafe Record cast as much as possible)
export const PRACTICE_BY_KEY = PRACTICES.reduce((acc, p) => {
  acc[p.key] = p;
  return acc;
}, {} as Record<PracticeKey, Practice>);

export function isPracticeKey(value: string): value is PracticeKey {
  return value in PRACTICE_BY_KEY;
}
