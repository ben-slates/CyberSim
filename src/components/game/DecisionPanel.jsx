import { motion } from "framer-motion";
import { AlertOctagon, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/Button";

export function DecisionPanel({ choices, disabled, onChoose }) {
  return (
    <div className="space-y-3">
      {choices.map((choice, index) => (
        <motion.div
          key={choice.id}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.08 }}
          className="rounded-2xl border border-border bg-surface/80 p-4 hover:border-primary/25"
        >
          <div className="mb-2 flex items-center justify-between">
            <h4 className="font-semibold text-slate-100">{choice.label}</h4>
            <div className={`rounded-full px-2 py-1 text-[10px] uppercase tracking-[0.24em] ${choice.isOptimal ? "bg-primary/10 text-primary" : "bg-danger/10 text-danger"}`}>
              {choice.riskLevel}
            </div>
          </div>
          <p className="text-sm leading-6 text-slate-400">{choice.description}</p>
          <Button className="mt-4 w-full" variant={choice.isOptimal ? "primary" : "secondary"} disabled={disabled} onClick={() => onChoose(choice)}>
            {choice.isOptimal ? <CheckCircle2 className="h-4 w-4" /> : <AlertOctagon className="h-4 w-4" />}
            Commit Decision
          </Button>
        </motion.div>
      ))}
    </div>
  );
}
