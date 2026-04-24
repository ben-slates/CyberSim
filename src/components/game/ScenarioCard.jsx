import { motion } from "framer-motion";
import { AlertTriangle, Lock, Timer } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { getDifficultyColor } from "@/utils/badges";

export function ScenarioCard({ scenario, bestScore, locked, lockReason, onPlay, icon: Icon }) {
  return (
    <motion.div layout initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
      <Card className="h-full">
        <div className="mb-4 flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl border border-primary/20 bg-primary/10 p-3 text-primary">
              <Icon className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.28em] text-slate-500">{scenario.category}</p>
              <h3 className="font-heading text-xl text-slate-100">{scenario.title}</h3>
            </div>
          </div>
          <Badge className={getDifficultyColor(scenario.difficulty)}>{scenario.difficulty}</Badge>
        </div>
        <p className="min-h-[72px] text-sm leading-6 text-slate-400">{scenario.description}</p>
        <div className="mt-5 grid grid-cols-2 gap-3 text-sm">
          <div className="rounded-2xl border border-border bg-black/20 p-3">
            <div className="text-xs uppercase tracking-[0.22em] text-slate-500">Best Score</div>
            <div className="mt-2 text-lg text-primary">{bestScore ?? "N/A"}</div>
          </div>
          <div className="rounded-2xl border border-border bg-black/20 p-3">
            <div className="text-xs uppercase tracking-[0.22em] text-slate-500">Estimated Time</div>
            <div className="mt-2 flex items-center gap-2 text-lg text-slate-100">
              <Timer className="h-4 w-4 text-warning" />
              {Math.floor(scenario.timeLimit / 60)} min
            </div>
          </div>
        </div>
        <div className="mt-5">
          {locked ? (
            <div className="rounded-2xl border border-danger/20 bg-danger/5 p-4 text-sm text-slate-300">
              <div className="mb-2 flex items-center gap-2 text-danger">
                <Lock className="h-4 w-4" />
                Locked Scenario
              </div>
              <p className="leading-6 text-slate-400">{lockReason}</p>
            </div>
          ) : (
            <Button className="w-full" onClick={onPlay}>
              <AlertTriangle className="h-4 w-4" />
              Launch Simulation
            </Button>
          )}
        </div>
      </Card>
    </motion.div>
  );
}
