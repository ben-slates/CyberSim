import { Card } from "@/components/ui/Card";
import { LineChart, Line, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid } from "recharts";

export function ScoreChart({ data }) {
  return (
    <Card className="h-[340px]">
      <div className="mb-4">
        <div className="text-xs uppercase tracking-[0.28em] text-slate-500">Performance</div>
        <h3 className="font-heading text-2xl text-primary">Score History</h3>
      </div>
      <ResponsiveContainer width="100%" height="88%">
        <LineChart data={data}>
          <CartesianGrid stroke="rgba(255,255,255,0.06)" vertical={false} />
          <XAxis dataKey="label" tick={{ fill: "#7a8d8d", fontSize: 11 }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fill: "#7a8d8d", fontSize: 11 }} axisLine={false} tickLine={false} />
          <Tooltip contentStyle={{ background: "#111518", border: "1px solid #1e2a2a", borderRadius: 16 }} />
          <Line type="monotone" dataKey="score" stroke="#00ff88" strokeWidth={3} dot={{ r: 3 }} activeDot={{ r: 5 }} />
        </LineChart>
      </ResponsiveContainer>
    </Card>
  );
}
