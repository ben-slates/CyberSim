import { Minus, Square, X } from "lucide-react";
import { useEffect, useState } from "react";

export function TitleBar() {
  const [version, setVersion] = useState("...");

  useEffect(() => {
    window.electronAPI.getAppVersion().then(setVersion).catch(() => setVersion("dev"));
  }, []);

  return (
    <div className="drag-region flex h-12 items-center justify-between border-b border-border bg-black/30 px-4">
      <div className="flex items-center gap-3">
        <div className="h-3 w-3 rounded-full bg-danger" />
        <div>
          <div className="font-heading text-sm tracking-[0.35em] text-primary">CYBERSIM</div>
          <div className="text-[10px] uppercase tracking-[0.28em] text-slate-500">Cybersecurity Decision Simulator v{version}</div>
        </div>
      </div>
      <div className="no-drag flex items-center gap-2">
        <button className="h-8 w-8 rounded-full bg-warning/90 text-black transition hover:scale-105" onClick={() => window.electronAPI.minimizeWindow()}>
          <Minus className="mx-auto h-4 w-4" />
        </button>
        <button className="h-8 w-8 rounded-full bg-primary/90 text-black transition hover:scale-105" onClick={() => window.electronAPI.maximizeWindow()}>
          <Square className="mx-auto h-3.5 w-3.5" />
        </button>
        <button className="h-8 w-8 rounded-full bg-danger/90 text-black transition hover:scale-105" onClick={() => window.electronAPI.closeWindow()}>
          <X className="mx-auto h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
