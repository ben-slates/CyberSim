import clsx from "clsx";
import { Clock3 } from "lucide-react";
import { formatSeconds } from "@/utils/badges";

export function Timer({ seconds, warning = false }) {
  return (
    <div
      className={clsx(
        "flex items-center gap-2 rounded-2xl border px-4 py-3 font-heading text-lg",
        warning ? "critical-pulse border-danger/40 bg-danger/10 text-danger" : "border-primary/30 bg-primary/10 text-primary"
      )}
    >
      <Clock3 className="h-5 w-5" />
      <span>{formatSeconds(seconds)}</span>
    </div>
  );
}
