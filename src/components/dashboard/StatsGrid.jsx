import { Card } from "@/components/ui/Card";
import { motion } from "framer-motion";

export function StatsGrid({ items }) {
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      {items.map((item, index) => (
        <motion.div key={item.label} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.06 }}>
          <Card>
            <div className="mb-4 flex items-center justify-between">
              <item.icon className="h-5 w-5 text-primary" />
              <span className="text-xs uppercase tracking-[0.26em] text-slate-500">{item.label}</span>
            </div>
            <div className="font-heading text-4xl text-slate-100">{item.value}</div>
            <p className="mt-2 text-sm text-slate-400">{item.caption}</p>
          </Card>
        </motion.div>
      ))}
    </div>
  );
}
