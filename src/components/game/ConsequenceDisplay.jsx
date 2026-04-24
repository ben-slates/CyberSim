import { motion } from "framer-motion";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";

export function ConsequenceDisplay({ outcome }) {
  if (!outcome) return null;

  return (
    <motion.div
      initial={{ opacity: 0, x: 24 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 24 }}
      className="absolute inset-y-6 right-6 z-30 w-[380px]"
    >
      <Card className="h-full border-primary/20 bg-black/85">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="font-heading text-2xl text-primary">{outcome.title}</h3>
          <Badge className={outcome.scoreChange >= 0 ? "border-primary/30 bg-primary/10 text-primary" : "border-danger/30 bg-danger/10 text-danger"}>
            {outcome.scoreChange >= 0 ? "+" : ""}
            {outcome.scoreChange}
          </Badge>
        </div>
        <p className="text-sm leading-6 text-slate-300">{outcome.description}</p>
        <div className="mt-5 space-y-2">
          {outcome.consequences.map((item) => (
            <div key={item} className="rounded-2xl border border-border bg-surface/70 px-4 py-3 text-sm text-slate-400">
              {item}
            </div>
          ))}
        </div>
      </Card>
    </motion.div>
  );
}
