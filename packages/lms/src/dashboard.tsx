// <ProgressDashboard> — the teacher/analytics view over recorded events. Shows an
// optional roster (aggregated at the platform tier) plus the current learner's
// completion, time-on-task, activity, and a JSON export. Composes shadcn blocks.
import { Card, CardContent } from "@faraday-academy/ui/components/ui/card";
import { Badge } from "@faraday-academy/ui/components/ui/badge";
import { Button } from "@faraday-academy/ui/components/ui/button";
import { Stat } from "@faraday-academy/kit/blocks";
import { summarize, type LmsEvent, type LmsSummary } from "./recorder";

export interface CourseDescriptor {
  nodes: Array<{ id: string; title: string }>;
}

export interface Learner {
  id: string;
  name: string;
  summary: LmsSummary;
}

function ago(t: number | null): string {
  if (!t) return "—";
  const s = Math.round((Date.now() - t) / 1000);
  if (s < 60) return `${s}s ago`;
  if (s < 3600) return `${Math.round(s / 60)}m ago`;
  return `${Math.round(s / 3600)}h ago`;
}

function dur(ms: number): string {
  const s = Math.round(ms / 1000);
  return s < 60 ? `${s}s` : `${Math.floor(s / 60)}m ${s % 60}s`;
}

function Bar({ pct }: { pct: number }) {
  return (
    <div className="h-2 w-28 overflow-hidden rounded-full bg-muted">
      <div className="h-full rounded-full bg-primary" style={{ width: `${pct}%` }} />
    </div>
  );
}

export function ProgressDashboard(props: {
  courseId: string;
  events: LmsEvent[];
  course?: CourseDescriptor;
  learners?: Learner[];
}) {
  const me = summarize(props.events);
  const total = props.course?.nodes.length ?? me.done;
  const pct = total ? Math.round((me.done / total) * 100) : 0;
  const titleOf = (id: string) => props.course?.nodes.find((n) => n.id === id)?.title ?? id;

  const exportJson = () => {
    const blob = new Blob([JSON.stringify({ courseId: props.courseId, events: props.events }, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${props.courseId}-progress.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex flex-col gap-5">
      {props.learners && props.learners.length > 0 ? (
        <div className="flex flex-col gap-2">
          <h2 className="text-sm font-semibold tracking-wide text-muted-foreground uppercase">Roster</h2>
          <Card>
            <CardContent className="p-0">
              <table className="w-full text-sm">
                <thead className="text-muted-foreground">
                  <tr className="border-b [&_th]:px-4 [&_th]:py-2 [&_th]:text-left [&_th]:font-medium">
                    <th>Student</th>
                    <th>Progress</th>
                    <th>XP</th>
                    <th>Last active</th>
                  </tr>
                </thead>
                <tbody>
                  {props.learners.map((l) => {
                    const p = total ? Math.round((l.summary.done / total) * 100) : 0;
                    return (
                      <tr key={l.id} className="border-b last:border-0 [&_td]:px-4 [&_td]:py-2.5">
                        <td className="font-medium">{l.name}</td>
                        <td>
                          <div className="flex items-center gap-2">
                            <Bar pct={p} />
                            <span className="tabular-nums text-muted-foreground">{p}%</span>
                          </div>
                        </td>
                        <td className="tabular-nums">{l.summary.xp}</td>
                        <td className="text-muted-foreground">{ago(l.summary.lastActiveAt)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </div>
      ) : null}

      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold tracking-wide text-muted-foreground uppercase">This learner</h2>
        <Button variant="outline" size="xs" onClick={exportJson}>Export JSON</Button>
      </div>
      <div className="grid grid-cols-3 gap-3">
        <Stat label="Completed" value={`${me.done}/${total}`} delta={{ text: `${pct}%` }} />
        <Stat label="XP" value={me.xp} />
        <Stat label="Time on task" value={dur(me.activeMs)} />
      </div>

      {props.course ? (
        <Card>
          <CardContent className="flex flex-col gap-1 p-3 text-sm">
            {props.course.nodes.map((n) => {
              const s = me.perNode[n.id];
              return (
                <div key={n.id} className="flex items-center justify-between rounded px-2 py-1.5 odd:bg-muted/40">
                  <span className="flex items-center gap-2">
                    <span className={s?.completed ? "text-[var(--chart-3)]" : "text-muted-foreground"}>
                      {s?.completed ? "✓" : "○"}
                    </span>
                    {n.title}
                  </span>
                  <span className="tabular-nums text-muted-foreground">{s?.timeMs != null ? dur(s.timeMs) : "—"}</span>
                </div>
              );
            })}
          </CardContent>
        </Card>
      ) : null}

      <div className="flex flex-col gap-1">
        <h3 className="text-xs font-medium tracking-wide text-muted-foreground uppercase">Recent activity</h3>
        {props.events.length === 0 ? (
          <p className="text-sm text-muted-foreground">No activity yet — go do a lesson.</p>
        ) : (
          [...props.events].slice(-6).reverse().map((e, i) => (
            <div key={i} className="flex items-center gap-2 text-sm">
              <Badge variant="secondary" className="w-20 justify-center">{e.type}</Badge>
              <span className="flex-1 truncate">{e.nodeId ? titleOf(e.nodeId) : "—"}</span>
              <span className="tabular-nums text-muted-foreground">{ago(e.at)}</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
