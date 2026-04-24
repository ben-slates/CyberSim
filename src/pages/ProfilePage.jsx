import { useEffect, useMemo, useState } from "react";
import { Layout } from "@/components/layout/Layout";
import { Card } from "@/components/ui/Card";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { Button } from "@/components/ui/Button";
import { badgeCatalog, formatDateTime, formatSeconds } from "@/utils/badges";
import { useUserStore } from "@/store/userStore";

const avatarColors = ["#00ff88", "#00aaff", "#ffaa00", "#ff3366", "#8cff00", "#42d392", "#00f5d4", "#f97316", "#f43f5e", "#60a5fa", "#a3e635", "#facc15"];
const skillLevels = ["Novice", "Apprentice", "Analyst", "Expert", "Master"];

export default function ProfilePage() {
  const [sortBy, setSortBy] = useState("date");
  const profile = useUserStore((state) => state.profile);
  const loadProfile = useUserStore((state) => state.loadProfile);
  const updateAvatar = useUserStore((state) => state.updateAvatar);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  const sortedHistory = useMemo(() => {
    const list = [...(profile?.history || [])];
    list.sort((left, right) => {
      if (sortBy === "score") return right.score - left.score;
      if (sortBy === "grade") return right.grade.localeCompare(left.grade);
      return new Date(right.completedAt).getTime() - new Date(left.completedAt).getTime();
    });
    return list;
  }, [profile?.history, sortBy]);

  const initials = profile?.username?.slice(0, 2).toUpperCase() || "OP";

  return (
    <Layout title="Profile" subtitle="Tune your operator identity, inspect long-term metrics, and review the archive.">
      <div className="space-y-6">
        <div className="grid gap-6 xl:grid-cols-[0.8fr_1.2fr]">
          <Card>
            <div className="flex items-center gap-5">
              <div className="flex h-24 w-24 items-center justify-center rounded-full text-2xl font-heading text-black" style={{ backgroundColor: profile?.avatarColor || "#00ff88" }}>
                {initials}
              </div>
              <div>
                <div className="text-xs uppercase tracking-[0.28em] text-slate-500">Operator Identity</div>
                <h2 className="mt-2 font-heading text-3xl text-primary">{profile?.username || "Loading"}</h2>
                <p className="mt-1 text-sm text-slate-400">{profile?.email}</p>
              </div>
            </div>
            <div className="mt-6 grid grid-cols-4 gap-3">
              {avatarColors.map((color) => (
                <button
                  key={color}
                  className="h-10 rounded-full border border-white/10 transition hover:scale-105"
                  style={{ backgroundColor: color }}
                  onClick={() => updateAvatar(color)}
                />
              ))}
            </div>
          </Card>
          <Card>
            <div className="grid gap-4 md:grid-cols-3">
              <div>
                <div className="text-xs uppercase tracking-[0.28em] text-slate-500">Total Score</div>
                <div className="mt-2 font-heading text-4xl text-slate-100">{profile?.stats?.totalScore || 0}</div>
              </div>
              <div>
                <div className="text-xs uppercase tracking-[0.28em] text-slate-500">Games</div>
                <div className="mt-2 font-heading text-4xl text-slate-100">{profile?.stats?.gamesPlayed || 0}</div>
              </div>
              <div>
                <div className="text-xs uppercase tracking-[0.28em] text-slate-500">Average</div>
                <div className="mt-2 font-heading text-4xl text-slate-100">{profile?.stats?.avgScore || 0}</div>
              </div>
              <div>
                <div className="text-xs uppercase tracking-[0.28em] text-slate-500">Playtime</div>
                <div className="mt-2 text-lg text-primary">{formatSeconds(profile?.stats?.totalTimePlayed || 0)}</div>
              </div>
              <div>
                <div className="text-xs uppercase tracking-[0.28em] text-slate-500">Best Grade</div>
                <div className="mt-2 text-lg text-primary">{profile?.stats?.bestGrade || "F"}</div>
              </div>
              <div>
                <div className="text-xs uppercase tracking-[0.28em] text-slate-500">Favorite Category</div>
                <div className="mt-2 text-lg text-primary">{profile?.stats?.favoriteCategory || "None"}</div>
              </div>
            </div>
          </Card>
        </div>

        <div className="grid gap-6 xl:grid-cols-[0.8fr_1.2fr]">
          <Card>
            <div className="mb-4">
              <div className="text-xs uppercase tracking-[0.28em] text-slate-500">Skill Breakdown</div>
              <h3 className="font-heading text-2xl text-primary">Progression</h3>
            </div>
            <div className="space-y-4">
              {Object.entries(profile?.stats?.skillScores || {}).map(([key, value]) => {
                const levelIndex = Math.min(skillLevels.length - 1, Math.floor(value / 40));
                return (
                  <div key={key}>
                    <div className="mb-2 flex items-center justify-between text-sm">
                      <span className="capitalize text-slate-300">{key}</span>
                      <span className="text-primary">{skillLevels[levelIndex]}</span>
                    </div>
                    <ProgressBar value={value % 200} max={200} />
                  </div>
                );
              })}
            </div>
          </Card>
          <Card>
            <div className="mb-4">
              <div className="text-xs uppercase tracking-[0.28em] text-slate-500">Badge Collection</div>
              <h3 className="font-heading text-2xl text-primary">All Badges</h3>
            </div>
            <div className="grid gap-4 md:grid-cols-3">
              {badgeCatalog.map((badge) => {
                const earned = (profile?.stats?.badges || []).includes(badge.id);
                const Icon = badge.icon;
                return (
                  <div key={badge.id} className={`rounded-2xl border p-4 ${earned ? "border-primary/30 bg-primary/10" : "border-border bg-black/20 opacity-50"}`}>
                    <Icon className={`mb-3 h-5 w-5 ${earned ? "text-primary" : "text-slate-500"}`} />
                    <div className="text-sm text-slate-100">{badge.name}</div>
                    <div className="mt-2 text-xs leading-5 text-slate-400">{badge.hint}</div>
                  </div>
                );
              })}
            </div>
          </Card>
        </div>

        <Card>
          <div className="mb-4 flex items-center justify-between">
            <div>
              <div className="text-xs uppercase tracking-[0.28em] text-slate-500">Session Archive</div>
              <h3 className="font-heading text-2xl text-primary">Last 50 Runs</h3>
            </div>
            <div className="flex gap-2">
              <Button variant={sortBy === "date" ? "primary" : "secondary"} onClick={() => setSortBy("date")}>
                Date
              </Button>
              <Button variant={sortBy === "score" ? "primary" : "secondary"} onClick={() => setSortBy("score")}>
                Score
              </Button>
              <Button variant={sortBy === "grade" ? "primary" : "secondary"} onClick={() => setSortBy("grade")}>
                Grade
              </Button>
            </div>
          </div>
          <div className="overflow-x-auto rounded-2xl border border-border">
            <table className="w-full text-left text-sm">
              <thead className="bg-black/30 text-slate-500">
                <tr>
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3">Scenario</th>
                  <th className="px-4 py-3">Score</th>
                  <th className="px-4 py-3">Grade</th>
                  <th className="px-4 py-3">Time</th>
                </tr>
              </thead>
              <tbody>
                {sortedHistory.map((row) => (
                  <tr key={row.id} className="border-t border-border bg-surface/40">
                    <td className="px-4 py-3 text-slate-400">{formatDateTime(row.completedAt)}</td>
                    <td className="px-4 py-3 text-slate-100">{row.scenarioTitle}</td>
                    <td className="px-4 py-3 text-primary">{row.score}</td>
                    <td className="px-4 py-3 text-slate-200">{row.grade}</td>
                    <td className="px-4 py-3 text-slate-400">{formatSeconds(row.timeTaken)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </Layout>
  );
}
