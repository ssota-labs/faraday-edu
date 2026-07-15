/**
 * POST /api/studio/chat — start a durable Studio WorkflowAgent run and stream
 * UI chunks (ssota + mirror-dimension pattern).
 */
import { start } from "workflow/api";
import {
  createUIMessageStreamResponse,
  type UIMessage,
} from "ai";
import {
  createModelCallToUIChunkTransform,
  type ModelCallStreamPart,
} from "@ai-sdk/workflow";
import { StudioChatRequestSchema } from "@faraday-academy/platform-contracts";
import { getPlatform, error, learnerIdFromRequest } from "@/lib/platform";
import { runStudioAgent } from "@/app/workflows/studio-agent";
import { resolveModelId } from "@/lib/chat/models";

export async function POST(req: Request) {
  const userId = learnerIdFromRequest(req);
  if (!userId) return error("UNAUTHORIZED", "missing user", 401);

  const raw = await req.json();
  const body = StudioChatRequestSchema.parse({
    messages: raw.messages,
    courseId: raw.courseId,
    draftId: raw.draftId,
  });
  if (!body.draftId) return error("DRAFT_REQUIRED", "draftId required");

  const platform = getPlatform();
  // Authz — owner must own the draft.
  await platform.studio.getDraft(body.draftId, userId);

  const messages = body.messages as UIMessage[];
  const modelId = resolveModelId(
    typeof raw.modelId === "string" ? raw.modelId : undefined,
  );

  const run = await start(runStudioAgent, [
    {
      messages,
      courseId: body.courseId,
      draftId: body.draftId,
      ownerId: userId,
      modelId,
    },
  ]);

  const readable =
    typeof run.getReadable === "function"
      ? run.getReadable()
      : (run as { readable: ReadableStream<ModelCallStreamPart> }).readable;

  const uiChunks = (
    readable as ReadableStream<ModelCallStreamPart>
  ).pipeThrough(createModelCallToUIChunkTransform());

  return createUIMessageStreamResponse({
    stream: uiChunks,
    headers: { "x-workflow-run-id": run.runId },
  });
}
