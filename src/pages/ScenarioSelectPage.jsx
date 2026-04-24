import { useEffect, useMemo, useState } from "react";
import { AnimatePresence } from "framer-motion";
import { Bug, DatabaseZap, Ghost, Network, ShieldAlert, UserSearch, Wifi } from "lucide-react";
import { Layout } from "@/components/layout/Layout";
import { ScenarioCard } from "@/components/game/ScenarioCard";
import { Button } from "@/components/ui/Button";
import { categoryOptions, difficultyOptions, scenarios } from "@/data/scenarios";
import { useGame } from "@/hooks/useGame";
import { useUserStore } from "@/store/userStore";
import { useNavigate } from "react-router-dom";

const categoryIcons = {
  Phishing: ShieldAlert,
  Malware: Bug,
  Intrusion: Ghost,
  Insider: UserSearch,
  Breach: DatabaseZap,
  Network: Network
};

export default function ScenarioSelectPage() {
  const navigate = useNavigate();
  const [category, setCategory] = useState("All");
  const [difficulty, setDifficulty] = useState("All");
  const history = useUserStore((state) => state.history);
  const loadHistory = useUserStore((state) => state.loadHistory);
  const { startScenario } = useGame();

  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  const completedCount = history.length;
  const bestScores = useMemo(() => {
    const map = {};
    history.forEach((entry) => {
      map[entry.scenarioId] = Math.max(map[entry.scenarioId] || 0, entry.score);
    });
    return map;
  }, [history]);

  const filtered = scenarios.filter((scenario) => {
    const categoryMatch = category === "All" || scenario.category === category;
    const difficultyMatch = difficulty === "All" || scenario.difficulty === difficulty;
    return categoryMatch && difficultyMatch;
  });

  return (
    <Layout title="Scenario Select" subtitle="Pick your incident, tune the filters, and deploy into the simulation.">
      <div className="space-y-6">
        <div className="flex flex-wrap items-center gap-3">
          {categoryOptions.map((option) => (
            <Button key={option} variant={category === option ? "primary" : "secondary"} onClick={() => setCategory(option)}>
              {option}
            </Button>
          ))}
        </div>
        <div className="flex flex-wrap items-center gap-3">
          {difficultyOptions.map((option) => (
            <Button key={option} variant={difficulty === option ? "warning" : "secondary"} onClick={() => setDifficulty(option)}>
              {option}
            </Button>
          ))}
        </div>
        <AnimatePresence>
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {filtered.map((scenario) => {
              const Icon = categoryIcons[scenario.category] || Wifi;
              const locked = scenario.difficulty === "Expert" ? completedCount < 3 : scenario.difficulty === "Advanced" ? completedCount < 1 : false;
              const lockReason =
                scenario.difficulty === "Expert"
                  ? "Complete 3 earlier simulations first."
                  : "Complete 1 earlier simulation first.";

              return (
                <ScenarioCard
                  key={scenario.id}
                  scenario={scenario}
                  bestScore={bestScores[scenario.id]}
                  locked={locked}
                  lockReason={lockReason}
                  icon={Icon}
                  onPlay={() => {
                    startScenario(scenario.id);
                    navigate(`/game/${scenario.id}`);
                  }}
                />
              );
            })}
          </div>
        </AnimatePresence>
      </div>
    </Layout>
  );
}
