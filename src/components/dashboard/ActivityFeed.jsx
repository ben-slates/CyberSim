import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { formatDateTime, getGradeColor } from "@/utils/badges";

export function ActivityFeed({ sessions }) {
  return (
    <Card>
      <div className="mb-4">
        <div className="text-xs uppercase tracking-[0.28em] text-slate-500">Recent Ops</div>
        <h3 className="font-heading text-2xl text-primary">Recent Sessions</h3>
      </div>
      <div className="space-y-3">
        {sessions.length ? (
          sessions.map((session) => (
            <div key={session.id} className="flex items-center justify-between rounded-2xl border border-border bg-black/20 px-4 py-3">
              <div>
                <div className="text-sm text-slate-100">{session.scenarioTitle}</div>
                <div className="text-xs text-slate-500">{formatDateTime(session.completedAt)}</div>
              </div>
              <div className="flex items-center gap-3">
                <div className="text-sm text-primary">{session.score}</div>
                <Badge className={getGradeColor(session.grade)}>{session.grade}</Badge>
              </div>
            </div>
          ))
        ) : (
          <div className="rounded-2xl border border-dashed border-border px-4 py-8 text-center text-slate-500">No sessions recorded yet.</div>
        )}
      </div>
    </Card>
  );
}
