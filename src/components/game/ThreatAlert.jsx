import { AlertTriangle } from "lucide-react";

export function ThreatAlert({ text }) {
  return (
    <div className="critical-pulse rounded-2xl border border-danger/30 bg-danger/10 p-4">
      <div className="mb-2 flex items-center gap-2 text-danger">
        <AlertTriangle className="h-4 w-4" />
        <span className="text-xs uppercase tracking-[0.28em]">Threat Alert</span>
      </div>
      <div className="threat-glitch font-heading text-lg text-danger" data-text={text}>
        {text}
      </div>
    </div>
  );
}
