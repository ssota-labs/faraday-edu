/**
 * GET /api/studio/chat/[runId]/stream — reconnect to an in-progress Studio run
 * (WorkflowChatTransport durable resume; same as ssota / mirror-dimension).
 */
import { getRun } from "workflow/api";
import { createUIMessageStreamResponse } from "ai";
import {
  createModelCallToUIChunkTransform,
  type ModelCallStreamPart,
} from "@ai-sdk/workflow";
import { error, learnerIdFromRequest } from "@/lib/platform";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ runId: string }> },
) {
  const userId = learnerIdFromRequest(request);
  if (!userId) return error("UNAUTHORIZED", "missing user", 401);

  const { runId } = await params;
  if (!runId) return error("BAD_REQUEST", "missing runId", 400);

  const startIndexParam = new URL(request.url).searchParams.get("startIndex");
  const startIndex =
    startIndexParam !== null ? Number(startIndexParam) : undefined;

  const run = getRun(runId);
  const readable = run.getReadable(
    startIndex !== undefined && Number.isFinite(startIndex)
      ? { startIndex }
      : undefined,
  ) as ReadableStream<ModelCallStreamPart>;

  return createUIMessageStreamResponse({
    stream: readable.pipeThrough(createModelCallToUIChunkTransform()),
    headers: { "x-workflow-run-id": runId },
  });
}
