import {
  Award,
  BadgeCheck,
  Bomb,
  Ghost,
  ShieldCheck,
  Skull,
  TimerReset,
  Trophy,
  UserRoundCheck,
  Zap
} from "lucide-react";

export const badgeCatalog = [
  { id: "first_blood", name: "First Blood", hint: "Complete your first scenario.", icon: Award },
  { id: "speed_demon", name: "Speed Demon", hint: "Finish with more than 80% time remaining.", icon: Zap },
  { id: "perfect_score", name: "Perfect Score", hint: "Earn 100% on any scenario.", icon: Trophy },
  { id: "no_hints", name: "No Hints", hint: "Complete a scenario without hints.", icon: ShieldCheck },
  { id: "phishing_expert", name: "Phishing Expert", hint: "Clear all phishing scenarios.", icon: BadgeCheck },
  { id: "malware_hunter", name: "Malware Hunter", hint: "Clear all malware scenarios.", icon: Bomb },
  { id: "ghost_buster", name: "Ghost Buster", hint: "Earn S grade on Ghost Login.", icon: Ghost },
  { id: "ransomware_stopper", name: "Ransomware Stopper", hint: "Earn A or better on RansomStrike.", icon: ShieldCheck },
  { id: "insider_catcher", name: "Insider Catcher", hint: "Complete The Mole.", icon: UserRoundCheck },
  { id: "iron_wall", name: "Iron Wall", hint: "Complete five scenarios.", icon: ShieldCheck },
  { id: "veteran", name: "Veteran", hint: "Complete twenty scenarios.", icon: Award },
  { id: "streak_3", name: "Three-Day Streak", hint: "Log in across three days.", icon: TimerReset },
  { id: "streak_7", name: "Seven-Day Streak", hint: "Log in across seven days.", icon: TimerReset },
  { id: "under_pressure", name: "Under Pressure", hint: "Finish an advanced scenario with under 30 seconds left.", icon: Skull },
  { id: "clean_sweep", name: "Clean Sweep", hint: "Complete all eight scenarios.", icon: Trophy }
];

export const badgeMap = Object.fromEntries(badgeCatalog.map((badge) => [badge.id, badge]));

export function formatSeconds(totalSeconds = 0) {
  const minutes = Math.floor(totalSeconds / 60)
    .toString()
    .padStart(2, "0");
  const seconds = Math.floor(totalSeconds % 60)
    .toString()
    .padStart(2, "0");
  return `${minutes}:${seconds}`;
}

export function formatDateTime(value) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  }).format(new Date(value));
}

export function getGradeColor(grade) {
  return {
    S: "text-primary border-primary/40 bg-primary/10",
    A: "text-info border-info/40 bg-info/10",
    B: "text-warning border-warning/40 bg-warning/10",
    C: "text-yellow-200 border-yellow-400/30 bg-yellow-500/10",
    D: "text-orange-300 border-orange-500/30 bg-orange-500/10",
    F: "text-danger border-danger/40 bg-danger/10"
  }[grade] || "text-slate-200 border-border bg-white/5";
}

export function getDifficultyColor(difficulty) {
  return {
    Beginner: "bg-info/10 text-info border-info/30",
    Intermediate: "bg-primary/10 text-primary border-primary/30",
    Advanced: "bg-warning/10 text-warning border-warning/30",
    Expert: "bg-danger/10 text-danger border-danger/30"
  }[difficulty] || "bg-white/5 text-slate-200 border-border";
}
