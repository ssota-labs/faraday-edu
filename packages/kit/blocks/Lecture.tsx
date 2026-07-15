// <Lecture> — lecture shell: each presentation view owns its full layout.
// Title and lead flow into slide/textbook content — not a shared header chrome.
import { useState } from "react";
import type { ReactNode } from "react";
import { LectureContext, type LectureViewMeta } from "./lecture-context";

export interface LectureView {
  id: string;
  label: string;
  content: ReactNode;
}

export function Lecture(props: {
  title: string;
  lead?: ReactNode;
  views: LectureView[];
  defaultView?: string;
}) {
  const { title, views } = props;
  const [viewId, setViewId] = useState(props.defaultView ?? views[0]?.id ?? "");
  const active = views.find((v) => v.id === viewId) ?? views[0];

  if (!active) return null;

  const meta: LectureViewMeta[] = views.map((v) => ({ id: v.id, label: v.label }));

  return (
    <LectureContext.Provider
      value={{ title, lead: props.lead, viewId, setViewId, views: meta }}
    >
      <div className="fixed inset-0 z-30 bg-background">
        <div key={active.id} className="h-full min-h-0">
          {active.content}
        </div>
      </div>
    </LectureContext.Provider>
  );
}
