import { useEffect, useMemo } from "react";
import { Flame, Medal, Target, Trophy } from "lucide-react";
import { Layout } from "@/components/layout/Layout";
import { StatsGrid } from "@/components/dashboard/StatsGrid";
import { SkillRadar } from "@/components/dashboard/SkillRadar";
import { ScoreChart } from "@/components/dashboard/ScoreChart";
import { ActivityFeed } from "@/components/dashboard/ActivityFeed";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { badgeCatalog, badgeMap, formatSeconds } from "@/utils/badges";
import { useUserStore } from "@/store/userStore";
import { useNavigate } from "react-router-dom";

export default function DashboardPage() {
  const navigate = useNavigate();
  const stats = useUserStore((state) => state.stats);
  const history = useUserStore((state) => state.history);
  const loadStats = useUserStore((state) => state.loadStats);
  const loadHistory = useUserStore((state) => state.loadHistory);

  useEffect(() => {
    loadStats();
    loadHistory();
  }, [loadHistory, loadStats]);

  const statItems = useMemo(
    () => [
      { label: "Total Score", value: stats?.totalScore ?? 0, caption: "Cumulative response output", icon: Trophy },
      { label: "Games Played", value: stats?.gamesPlayed ?? 0, caption: "Completed simulations", icon: Medal },
      { label: "Win Rate", value: `${stats?.winRate ?? 0}%`, caption: "B grade or better outcomes", icon: Target },
      { label: "Current Streak", value: stats?.streak ?? 0, caption: "Daily login streak", icon: Flame }
    ],
    [stats]
  );

  const chartData = (stats?.history || []).slice(-8).map((item, index) => ({
    label: `Run ${index + 1}`,
    score: item.score
  }));

  const recentSessions = history.slice(0, 5);
  const badges = (stats?.badges || []).map((id) => badgeMap[id]).filter(Boolean);
  const countdown = formatSeconds(60 * 60 * 2 + 27 * 60);

  return (
    <Layout title="Dashboard" subtitle="Track performance, skills, and the next high-pressure drill.">
      <div className="space-y-6">
        <StatsGrid items={statItems} />
        <div className="grid gap-6 xl:grid-cols-2">
          <SkillRadar skillScores={stats?.skillScores || { phishing: 0, malware: 0, intrusion: 0, insider: 0, breach: 0, network: 0 }} />
          <ScoreChart data={chartData} />
        </div>
        <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
          <ActivityFeed sessions={recentSessions} />
          <div className="space-y-6">
            <Card>
              <div className="text-xs uppercase tracking-[0.28em] text-slate-500">Rapid Launch</div>
              <h3 className="mt-2 font-heading text-2xl text-primary">Quick Play</h3>
              <p className="mt-3 text-sm leading-6 text-slate-400">Drop directly into a scenario grid and start training with your progress already synced from local SQLite.</p>
              <Button className="mt-5 w-full" onClick={() => navigate("/scenarios")}>
                Open Scenario Select
              </Button>
            </Card>
            <Card className="border-warning/30">
              <div className="text-xs uppercase tracking-[0.28em] text-warning">Daily Challenge</div>
              <h3 className="mt-2 font-heading text-2xl text-slate-100">Double XP Window</h3>
              <p className="mt-3 text-sm leading-6 text-slate-400">Finish any scenario before the timer expires to simulate an intensified response tempo.</p>
              <div className="mt-5 rounded-2xl border border-warning/20 bg-warning/10 px-4 py-3 font-heading text-xl text-warning">{countdown}</div>
            </Card>
          </div>
        </div>
        <Card>
          <div className="mb-4">
            <div className="text-xs uppercase tracking-[0.28em] text-slate-500">Decorations</div>
            <h3 className="font-heading text-2xl text-primary">Earned Badges</h3>
          </div>
          <div className="grid gap-4 md:grid-cols-3 xl:grid-cols-5">
            {badgeCatalog.map((badge) => {
              const earned = badges.some((item) => item?.id === badge.id);
              const Icon = badge.icon;
              return (
                <div key={badge.id} className={`rounded-2xl border p-4 ${earned ? "border-primary/30 bg-primary/10" : "border-border bg-black/20 opacity-50"}`}>
                  <Icon className={`mb-3 h-6 w-6 ${earned ? "text-primary" : "text-slate-500"}`} />
                  <div className="text-sm font-semibold text-slate-100">{badge.name}</div>
                  <div className="mt-2 text-xs leading-5 text-slate-400">{badge.hint}</div>
                </div>
              );
            })}
          </div>
        </Card>
      </div>
    </Layout>
  );
}
