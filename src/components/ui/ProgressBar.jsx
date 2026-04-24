import clsx from "clsx";
import { motion } from "framer-motion";

export function ProgressBar({ value, max = 100, color = "primary", className }) {
  const percentage = Math.max(0, Math.min(100, (value / max) * 100));
  const tone = {
    primary: "bg-primary",
    danger: "bg-danger",
    warning: "bg-warning",
    info: "bg-info"
  }[color];

  return (
    <div className={clsx("h-3 overflow-hidden rounded-full bg-white/5", className)}>
      <motion.div
        className={clsx("h-full rounded-full", tone)}
        initial={{ width: 0 }}
        animate={{ width: `${percentage}%` }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      />
    </div>
  );
}
