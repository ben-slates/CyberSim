import { Card } from "@/components/ui/Card";
import { PolarGrid, PolarAngleAxis, Radar, RadarChart, ResponsiveContainer } from "recharts";

export function SkillRadar({ skillScores }) {
  const data = Object.entries(skillScores || {}).map(([key, value]) => ({
    skill: key.charAt(0).toUpperCase() + key.slice(1),
    value
  }));

  return (
    <Card className="h-[340px]">
      <div className="mb-4">
        <div className="text-xs uppercase tracking-[0.28em] text-slate-500">Capability</div>
        <h3 className="font-heading text-2xl text-primary">Skill Radar</h3>
      </div>
      <ResponsiveContainer width="100%" height="88%">
        <RadarChart data={data}>
          <PolarGrid stroke="rgba(255,255,255,0.12)" />
          <PolarAngleAxis dataKey="skill" tick={{ fill: "#7a8d8d", fontSize: 12 }} />
          <Radar dataKey="value" stroke="#00ff88" fill="#00ff88" fillOpacity={0.25} />
        </RadarChart>
      </ResponsiveContainer>
    </Card>
  );
}
