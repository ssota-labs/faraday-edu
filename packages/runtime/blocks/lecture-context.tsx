// Shared context for <Lecture> — title/lead and view switching flow into each
// presentation view instead of a shared header chrome.
import { createContext, useContext } from "react";
import type { ReactNode } from "react";

export interface LectureViewMeta {
  id: string;
  label: string;
}

export interface LectureContextValue {
  title: string;
  lead?: ReactNode;
  viewId: string;
  setViewId: (id: string) => void;
  views: LectureViewMeta[];
}

export const LectureContext = createContext<LectureContextValue | null>(null);

export function useLecture(): LectureContextValue | null {
  return useContext(LectureContext);
}
