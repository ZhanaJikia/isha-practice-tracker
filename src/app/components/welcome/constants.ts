import { Activity, BarChart3, BookOpen, Droplets, Flame, Shield, Sparkles } from "lucide-react";
import type React from "react";

export type WelcomeIcon = React.ComponentType<{ className?: string; style?: React.CSSProperties }>;

export type Practice = {
  key: string;
  label: string;
  description: string;
  pts: string;
  max: string;
  icon: WelcomeIcon;
  gradient: string;
  badge: string;
};

export type Feature = {
  icon: WelcomeIcon;
  title: string;
  description: string;
};

export const practices: Practice[] = [
  {
    key: "walk",
    label: "Walk",
    description: "Ground yourself with mindful movement.",
    pts: "2 pts",
    max: "2× daily",
    icon: Activity,
    gradient: "from-emerald-400 to-teal-500",
    badge: "bg-emerald-900/60 text-emerald-300",
  },
  {
    key: "cold_shower",
    label: "Cold Shower",
    description: "Shock your system into full alertness.",
    pts: "5 pts",
    max: "1× daily",
    icon: Droplets,
    gradient: "from-sky-400 to-cyan-500",
    badge: "bg-sky-900/60 text-sky-300",
  },
  {
    key: "journal",
    label: "Journal",
    description: "Reflect, process, and clarify your mind.",
    pts: "1 pt",
    max: "1× daily",
    icon: BookOpen,
    gradient: "from-yellow-400 to-amber-500",
    badge: "bg-yellow-900/60 text-yellow-300",
  },
  {
    key: "meditation",
    label: "Meditation",
    description: "Still the noise. Deepen your awareness.",
    pts: "5 pts",
    max: "2× daily",
    icon: Sparkles,
    gradient: "from-lime-400 to-green-500",
    badge: "bg-lime-900/60 text-lime-300",
  },
];

export const features: Feature[] = [
  {
    icon: Flame,
    title: "Build streaks",
    description:
      "Log each practice in one tap. Daily counts and per-day limits keep things real — no inflating the numbers.",
  },
  {
    icon: BarChart3,
    title: "See your progress",
    description:
      "Weekly and monthly stats show exactly which practices you're nailing and where you can push further.",
  },
  {
    icon: Shield,
    title: "Private by design",
    description: "No ads. No social feed. Just you and your discipline. Secure session auth, your data only.",
  },
];

export const statWidths = ["85%", "60%", "100%", "70%"] as const;
