// GET /api/chat/:runId/stream — reconnect to an in-progress or finished tutor run.
//
// This is what makes the tutor *durable*. WorkflowChatTransport calls this route
// (with `?startIndex=`) whenever the POST /api/chat connection drops before the
// run finishes — a refresh, a flaky network, a serverless timeout. The run keeps
// executing on the server; the client re-attaches to its stream from where it
// left off instead of re-asking. Pattern from the Workflow SDK resumable-streams
// guide.
import { defineEventHandler, getRouterParam, getQuery } from "nitro/h3";
import { getRun } from "workflow/api";
import { createUIMessageStreamResponse } from "ai";
import {
  createModelCallToUIChunkTransform,
  type ModelCallStreamPart,
} from "@ai-sdk/workflow";

export default defineEventHandler(async (event) => {
  const runId = getRouterParam(event, "runId");
  if (!runId) return new Response("Missing runId", { status: 400 });

  // The client tells us the last chunk index it received; replay from there.
  const raw = getQuery(event).startIndex;
  const startIndex = typeof raw === "string" ? Number.parseInt(raw, 10) : undefined;

  const run = getRun(runId);
  const readable = run.getReadable(
    startIndex !== undefined ? { startIndex } : undefined,
  );

  const uiChunks = (readable as ReadableStream<ModelCallStreamPart>).pipeThrough(
    createModelCallToUIChunkTransform(),
  );

  return createUIMessageStreamResponse({
    stream: uiChunks,
    headers: { "x-workflow-run-id": runId },
  });
});
