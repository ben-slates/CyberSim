import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Brain, CircleDot, Lightbulb, Network, ShieldAlert } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { DecisionPanel } from "@/components/game/DecisionPanel";
import { ConsequenceDisplay } from "@/components/game/ConsequenceDisplay";
import { ThreatAlert } from "@/components/game/ThreatAlert";
import { TitleBar } from "@/components/layout/TitleBar";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Timer } from "@/components/ui/Timer";
import { useGame } from "@/hooks/useGame";
import { useTimer } from "@/hooks/useTimer";

const feedMessages = [
  "Telemetry drift detected on external edge.",
  "Correlation engine is reprioritizing indicators.",
  "Business stakeholder waiting on updated impact statement.",
  "Asset inventory confirms critical dependency overlap.",
  "Containment window narrowing on live threat."
];

export default function GamePage() {
  const { scenarioId } = useParams();
  const navigate = useNavigate();
  const logsRef = useRef(null);
  const [typedLength, setTypedLength] = useState(0);
  const [outcomePanel, setOutcomePanel] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const {
    scenario,
    currentStage,
    stageIndex,
    score,
    threatLevel,
    decisions,
    hintsUsed,
    currentHint,
    timeRemaining,
    completedResult,
    startScenario,
    makeDecision,
    useHint,
    tick
  } = useGame();

  useEffect(() => {
    if (!scenario || scenario.id !== scenarioId) {
      try {
        startScenario(scenarioId);
      } catch {
        navigate("/scenarios");
      }
    }
  }, [navigate, scenario, scenarioId, startScenario]);

  useEffect(() => {
    setTypedLength(0);
  }, [currentStage?.id]);

  useEffect(() => {
    if (!currentStage) return undefined;
    const interval = window.setInterval(() => {
      setTypedLength((value) => {
        if (value >= currentStage.content.length) {
          window.clearInterval(interval);
          return value;
        }
        return value + 1;
      });
    }, 30);

    return () => window.clearInterval(interval);
  }, [currentStage]);

  useEffect(() => {
    if (logsRef.current) {
      logsRef.current.scrollTop = logsRef.current.scrollHeight;
    }
  }, [currentStage]);

  useTimer({
    duration: timeRemaining,
    isActive: Boolean(scenario),
    onTick: tick,
    onComplete: () => {}
  });

  const typedText = currentStage?.content.slice(0, typedLength) || "";
  const textComplete = currentStage ? typedLength >= currentStage.content.length : false;
  const progressDots = scenario?.stages || [];
  const threatFeed = useMemo(
    () => decisions.slice(-4).map((decision, index) => `${index + 1}. ${decision.choiceLabel}`),
    [decisions]
  );

  async function handleChoice(choice) {
    setSubmitting(true);
    setOutcomePanel(choice.outcome);
    const result = await makeDecision(currentStage.id, choice.id);
    window.setTimeout(() => {
      setOutcomePanel(null);
      setSubmitting(false);
      if (result?.score) {
        navigate("/results");
      }
    }, 3500);
  }

  if (!scenario || !currentStage) {
    return (
      <div className="app-shell flex min-h-screen flex-col">
        <TitleBar />
        <div className="flex flex-1 items-center justify-center text-slate-500">Loading simulation...</div>
      </div>
    );
  }

  return (
    <div className="app-shell flex min-h-screen flex-col">
      <TitleBar />
      <div className="flex flex-1 overflow-hidden">
        <aside className="w-[280px] border-r border-border bg-black/25 p-5">
          <div className="rounded-3xl border border-primary/20 bg-primary/5 p-4">
            <div className="text-xs uppercase tracking-[0.28em] text-slate-500">{scenario.category}</div>
            <h2 className="mt-2 font-heading text-2xl text-primary">{scenario.title}</h2>
            <p className="mt-3 text-sm leading-6 text-slate-400">{scenario.briefing}</p>
          </div>
          <div className="mt-6 space-y-5">
            <Card className="p-4">
              <div className="mb-3 text-xs uppercase tracking-[0.28em] text-slate-500">Threat Level</div>
              <div className="flex items-end gap-2">
                {[1, 2, 3, 4, 5].map((value) => (
                  <div key={value} className={`w-full rounded-t-xl transition-all ${value <= threatLevel ? "bg-danger critical-pulse" : "bg-white/10"}`} style={{ height: `${value * 18}px` }} />
                ))}
              </div>
            </Card>
            <Timer seconds={timeRemaining} warning={timeRemaining < 60} />
            <Card className="p-4">
              <div className="text-xs uppercase tracking-[0.28em] text-slate-500">Current Score</div>
              <motion.div key={score} initial={{ opacity: 0.6, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="font-heading text-4xl text-primary">
                {score}
              </motion.div>
            </Card>
            <Card className="p-4">
              <div className="mb-3 text-xs uppercase tracking-[0.28em] text-slate-500">Stage Progress</div>
              <div className="flex gap-2">
                {progressDots.map((entry, index) => (
                  <CircleDot key={entry.id} className={`h-5 w-5 ${index === stageIndex ? "text-primary" : "text-white/20"}`} />
                ))}
              </div>
            </Card>
            <Button variant="warning" className="w-full" disabled={hintsUsed >= 3} onClick={useHint}>
              <Lightbulb className="h-4 w-4" />
              Use Hint ({3 - hintsUsed} left)
            </Button>
            {currentHint ? <div className="rounded-2xl border border-warning/20 bg-warning/10 p-4 text-sm text-warning">{currentHint}</div> : null}
          </div>
        </aside>
        <main className="relative flex flex-1 overflow-hidden">
          <div className="flex-1 overflow-y-auto p-6 terminal-scroll">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <div className="text-xs uppercase tracking-[0.28em] text-slate-500">Stage {stageIndex + 1}</div>
                <h1 className="font-heading text-3xl text-slate-100">{currentStage.title}</h1>
              </div>
              <Badge className="border-danger/30 bg-danger/10 text-danger">{currentStage.alertLevel}</Badge>
            </div>
            <Card className="mb-6">
              <p className={`min-h-[120px] text-lg leading-8 text-slate-200 ${textComplete ? "" : "typewriter-cursor"}`}>{typedText}</p>
            </Card>
            <Card className="mb-6 bg-[#051113]">
              <div className="mb-3 flex items-center gap-2 text-xs uppercase tracking-[0.28em] text-primary">
                <Brain className="h-4 w-4" />
                System Logs
              </div>
              <div ref={logsRef} className="terminal-scroll max-h-[220px] space-y-2 overflow-y-auto font-heading text-sm text-primary">
                {currentStage.systemLogs.map((line) => (
                  <div key={line}>{line}</div>
                ))}
              </div>
            </Card>
            <AnimatePresence>{textComplete ? <DecisionPanel choices={currentStage.choices} disabled={submitting} onChoose={handleChoice} /> : null}</AnimatePresence>
          </div>
          <aside className="w-[240px] border-l border-border bg-black/20 p-5">
            <div className="mb-5 rounded-3xl border border-border bg-surface/70 p-4">
              <div className="mb-3 flex items-center gap-2 text-xs uppercase tracking-[0.28em] text-slate-500">
                <Network className="h-4 w-4" />
                Network Map
              </div>
              <svg viewBox="0 0 220 220" className="w-full">
                {[{ x: 30, y: 40 }, { x: 110, y: 20 }, { x: 180, y: 50 }, { x: 50, y: 120 }, { x: 120, y: 110 }, { x: 190, y: 150 }, { x: 95, y: 190 }].map((node, index, list) => (
                  <g key={`${node.x}-${node.y}`}>
                    {index < list.length - 1 ? <line x1={node.x} y1={node.y} x2={list[index + 1].x} y2={list[index + 1].y} stroke="rgba(0,255,136,0.18)" /> : null}
                    <circle cx={node.x} cy={node.y} r="12" fill={index < threatLevel + 1 ? "#ff3366" : "#00ff88"} opacity={index < threatLevel + 1 ? 0.9 : 0.7} />
                  </g>
                ))}
              </svg>
            </div>
            <div className="mb-5 space-y-3">
              <ThreatAlert text={currentStage.alertLevel === "Critical" ? "Hostile activity rising" : "Operational vigilance required"} />
            </div>
            <Card className="mb-5 p-4">
              <div className="mb-3 flex items-center gap-2 text-xs uppercase tracking-[0.28em] text-slate-500">
                <ShieldAlert className="h-4 w-4" />
                Threat Feed
              </div>
              <div className="space-y-2 text-sm text-slate-400">
                {[...feedMessages, ...threatFeed].slice(0, 5).map((message) => (
                  <div key={message} className="rounded-2xl border border-border bg-black/20 px-3 py-2">
                    {message}
                  </div>
                ))}
              </div>
            </Card>
            <Card className="p-4">
              <div className="mb-3 text-xs uppercase tracking-[0.28em] text-slate-500">Decision Log</div>
              <div className="terminal-scroll max-h-[240px] space-y-2 overflow-y-auto text-sm text-slate-400">
                {decisions.length ? (
                  decisions.map((decision) => (
                    <div key={`${decision.stageId}-${decision.choiceId}`} className="rounded-2xl border border-border bg-black/20 px-3 py-3">
                      <div className="text-slate-200">{decision.stageTitle}</div>
                      <div className="mt-1 text-xs">{decision.choiceLabel}</div>
                    </div>
                  ))
                ) : (
                  <div className="text-slate-500">No decisions committed yet.</div>
                )}
              </div>
            </Card>
          </aside>
          <AnimatePresence>{outcomePanel ? <ConsequenceDisplay outcome={outcomePanel} /> : null}</AnimatePresence>
        </main>
      </div>
    </div>
  );
}
