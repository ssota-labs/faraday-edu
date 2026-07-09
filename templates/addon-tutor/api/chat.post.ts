// POST /api/chat — start a durable tutor run and stream it to the client.
//
// The run id is returned in the `x-workflow-run-id` header so the client's
// WorkflowChatTransport can reconnect to the *same* run after a refresh, network
// drop, or serverless timeout (see api/chat/[runId]/stream.get.ts). Pattern from
// the Workflow SDK resumable-streams guide + mirror-dimension's chat route.
//
// Nitro serves this h3 handler at /api/chat (see vite.config.ts). Needs
// AI_GATEWAY_API_KEY in the environment (.env.local) for the model call.
import { defineEventHandler } from "nitro/h3";
import { start } from "workflow/api";
import { createUIMessageStreamResponse, type UIMessage } from "ai";
import {
  createModelCallToUIChunkTransform,
  type ModelCallStreamPart,
} from "@ai-sdk/workflow";
import { runTutorAgent } from "../workflows/tutor-agent";

interface ChatRequestBody {
  messages: UIMessage[];
  context?: string;
  title?: string;
}

export default defineEventHandler(async (event) => {
  const body = (await event.req.json()) as ChatRequestBody;

  // Detached durable run — returns immediately with a readable + run id.
  const run = await start(runTutorAgent, [
    { messages: body.messages, context: body.context, title: body.title },
  ]);

  // The workflow streams ModelCallStreamPart chunks; convert them to the UI
  // message stream the AI SDK client understands.
  const uiChunks = (run.readable as ReadableStream<ModelCallStreamPart>).pipeThrough(
    createModelCallToUIChunkTransform(),
  );

  return createUIMessageStreamResponse({
    stream: uiChunks,
    headers: { "x-workflow-run-id": run.runId },
  });
});
