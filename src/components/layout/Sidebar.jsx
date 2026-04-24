import { Home, LayoutGrid, Medal, PlayCircle, UserCircle2 } from "lucide-react";
import { NavLink } from "react-router-dom";
import clsx from "clsx";

const navItems = [
  { to: "/dashboard", label: "Dashboard", icon: Home },
  { to: "/scenarios", label: "Scenarios", icon: PlayCircle },
  { to: "/leaderboard", label: "Leaderboard", icon: Medal },
  { to: "/profile", label: "Profile", icon: UserCircle2 }
];

export function Sidebar() {
  return (
    <aside className="w-72 border-r border-border bg-black/20 p-4">
      <div className="panel-surface mb-6 rounded-3xl p-5">
        <div className="mb-2 text-xs uppercase tracking-[0.32em] text-slate-500">Ops Console</div>
        <h2 className="font-heading text-3xl text-primary text-glow">Mission Grid</h2>
        <p className="mt-2 text-sm leading-6 text-slate-400">Train on phishing, malware, breach, insider, and network response without ever leaving the desktop app.</p>
      </div>
      <nav className="space-y-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                clsx(
                  "flex items-center gap-3 rounded-2xl border px-4 py-3 text-sm transition-all",
                  isActive
                    ? "border-primary/40 bg-primary/10 text-primary shadow-neon"
                    : "border-border bg-surface/60 text-slate-300 hover:border-primary/25 hover:text-primary"
                )
              }
            >
              <Icon className="h-5 w-5" />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </nav>
      <div className="mt-6 rounded-2xl border border-border bg-surface/70 p-4">
        <div className="mb-1 flex items-center gap-2 text-sm text-primary">
          <LayoutGrid className="h-4 w-4" />
          Daily Drill
        </div>
        <p className="text-xs leading-6 text-slate-400">Operational pressure is part of the score. Use hints sparingly and keep your streak alive.</p>
      </div>
    </aside>
  );
}
