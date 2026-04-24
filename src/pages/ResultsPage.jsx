import { useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { useGame } from "@/hooks/useGame";
import { getGradeColor, formatSeconds } from "@/utils/badges";

export default function ResultsPage() {
  const navigate = useNavigate();
  const { completedResult, scenario, startScenario } = useGame();

  const result = completedResult;
  const skillItems = useMemo(() => Object.entries(result?.skillXP || {}), [result]);

  useEffect(() => {
    if (!result) {
      navigate("/dashboard");
    }
  }, [navigate, result]);

  if (!result) return null;

  return (
    <Layout title="Results" subtitle="Review the outcome, compare decisions, and launch the next run.">
      <div className="space-y-6">
        <Card className="text-center">
          <div className="text-xs uppercase tracking-[0.32em] text-slate-500">Final Grade</div>
          <div className={`mx-auto mt-4 inline-flex rounded-full border px-10 py-6 font-heading text-7xl ${getGradeColor(result.grade)}`}>{result.grade}</div>
          <div className="mt-5 font-heading text-3xl text-primary">
            {result.score} / {result.maxScore} ({Math.round(result.percentage)}%)
          </div>
          <div className="mt-2 text-sm text-slate-400">Time Taken: {formatSeconds(result.timeTaken)}</div>
        </Card>

        <Card>
          <div className="mb-4">
            <div className="text-xs uppercase tracking-[0.28em] text-slate-500">Decision Timeline</div>
            <h3 className="font-heading text-2xl text-primary">How You Responded</h3>
          </div>
          <div className="space-y-3">
            {result.decisions.map((decision) => (
              <div key={`${decision.stageId}-${decision.choiceId}`} className="grid gap-3 rounded-2xl border border-border bg-black/20 p-4 xl:grid-cols-4">
                <div>
                  <div className="text-xs uppercase tracking-[0.22em] text-slate-500">Stage</div>
                  <div className="mt-1 text-slate-100">{decision.stageTitle}</div>
                </div>
                <div>
                  <div className="text-xs uppercase tracking-[0.22em] text-slate-500">Your Choice</div>
                  <div className="mt-1 text-slate-300">{decision.choiceLabel}</div>
                </div>
                <div>
                  <div className="text-xs uppercase tracking-[0.22em] text-slate-500">Optimal Choice</div>
                  <div className="mt-1 text-primary">{decision.optimalChoice}</div>
                </div>
                <div>
                  <div className="text-xs uppercase tracking-[0.22em] text-slate-500">Score Delta</div>
                  <div className={`mt-1 ${decision.scoreDelta >= 0 ? "text-primary" : "text-danger"}`}>
                    {decision.scoreDelta >= 0 ? "+" : ""}
                    {decision.scoreDelta}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <div className="grid gap-6 xl:grid-cols-[0.8fr_1.2fr]">
          <Card>
            <div className="mb-4">
              <div className="text-xs uppercase tracking-[0.28em] text-slate-500">Skill XP</div>
              <h3 className="font-heading text-2xl text-primary">Capability Gains</h3>
            </div>
            <div className="space-y-4">
              {skillItems.map(([key, value]) => (
                <div key={key}>
                  <div className="mb-2 flex items-center justify-between text-sm">
                    <span className="capitalize text-slate-300">{key}</span>
                    <span className="text-primary">+{value}</span>
                  </div>
                  <ProgressBar value={value} max={40} />
                </div>
              ))}
            </div>
          </Card>
          <Card>
            <div className="mb-4">
              <div className="text-xs uppercase tracking-[0.28em] text-slate-500">Lessons Learned</div>
              <h3 className="font-heading text-2xl text-primary">{result.ending.title}</h3>
            </div>
            <p className="text-sm leading-7 text-slate-300">{result.ending.description}</p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Button
                onClick={() => {
                  if (scenario?.id) {
                    startScenario(scenario.id);
                    navigate(`/game/${scenario.id}`);
                  }
                }}
              >
                Play Again
              </Button>
              <Button variant="secondary" onClick={() => navigate("/scenarios")}>
                Try Another
              </Button>
              <Button variant="ghost" onClick={() => navigate("/dashboard")}>
                Back to Dashboard
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </Layout>
  );
}
