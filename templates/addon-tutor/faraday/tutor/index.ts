// Tutor AI v0 — the durable chat widget. Import from "@/faraday/tutor" in lesson
// code: <Tutor context={lessonText} title="…" greeting="…" />.
//
// Client-only barrel on purpose — it must NOT re-export the workflow/agent
// (workflows/tutor-agent.ts) or the api routes, so server code never leaks into
// the browser bundle. The server side is wired via api/** + workflows/**.
export { Tutor, type TutorProps } from "./tutor";
