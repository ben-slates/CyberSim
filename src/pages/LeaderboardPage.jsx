import { useEffect, useState } from "react";
import { Layout } from "@/components/layout/Layout";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { scenarios } from "@/data/scenarios";
import { useUserStore } from "@/store/userStore";

export default function LeaderboardPage() {
  const [mode, setMode] = useState("global");
  const [scenarioId, setScenarioId] = useState(scenarios[0].id);
  const leaderboard = useUserStore((state) => state.leaderboard);
  const scenarioLeaderboard = useUserStore((state) => state.scenarioLeaderboard);
  const loadLeaderboard = useUserStore((state) => state.loadLeaderboard);
  const loadScenarioLeaderboard = useUserStore((state) => state.loadScenarioLeaderboard);

  useEffect(() => {
    loadLeaderboard();
  }, [loadLeaderboard]);

  useEffect(() => {
    if (mode === "scenario") {
      loadScenarioLeaderboard(scenarioId);
    }
  }, [loadScenarioLeaderboard, mode, scenarioId]);

  const rows = mode === "global" ? leaderboard : scenarioLeaderboard?.entries || [];

  return (
    <Layout title="Leaderboard" subtitle="See how your local campaign stacks up across all operators on this desktop instance.">
      <div className="space-y-6">
        <div className="flex flex-wrap items-center gap-3">
          <Button variant={mode === "global" ? "primary" : "secondary"} onClick={() => setMode("global")}>
            Global
          </Button>
          <Button variant={mode === "scenario" ? "primary" : "secondary"} onClick={() => setMode("scenario")}>
            By Scenario
          </Button>
          {mode === "scenario" ? (
            <select className="rounded-2xl border border-border bg-surface px-4 py-2 outline-none" value={scenarioId} onChange={(event) => setScenarioId(event.target.value)}>
              {scenarios.map((scenario) => (
                <option key={scenario.id} value={scenario.id}>
                  {scenario.title}
                </option>
              ))}
            </select>
          ) : null}
        </div>
        <Card className="overflow-hidden p-0">
          <table className="w-full text-left text-sm">
            <thead className="bg-black/30 text-slate-500">
              <tr>
                <th className="px-4 py-4">Rank</th>
                <th className="px-4 py-4">Operator</th>
                <th className="px-4 py-4">Score</th>
                <th className="px-4 py-4">Grade</th>
                <th className="px-4 py-4">Games</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, index) => (
                <tr
                  key={`${row.userId}-${index}`}
                  className={`border-t border-border transition ${row.isCurrentUser ? "bg-primary/10" : "bg-surface/50"} ${
                    index === 0 ? "text-yellow-300" : index === 1 ? "text-slate-300" : index === 2 ? "text-amber-600" : ""
                  }`}
                >
                  <td className="px-4 py-4 font-heading">{row.rank}</td>
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full text-black" style={{ backgroundColor: row.avatarColor }}>
                        {row.username.slice(0, 2).toUpperCase()}
                      </div>
                      <span>{row.username}</span>
                    </div>
                  </td>
                  <td className="px-4 py-4">{row.score}</td>
                  <td className="px-4 py-4">{row.grade}</td>
                  <td className="px-4 py-4">{row.gamesPlayed}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      </div>
    </Layout>
  );
}
