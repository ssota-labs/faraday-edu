/**
 * POST /v1/tutor/runs — entitlement gate + durable Tutor WorkflowAgent stream.
 */
import { start } from "workflow/api";
import { createUIMessageStreamResponse, type UIMessage } from "ai";
import {
  createModelCallToUIChunkTransform,
  type ModelCallStreamPart,
} from "@ai-sdk/workflow";
import { PlatformTutorRequestSchema } from "@faraday-academy/platform-contracts";
import { getPlatform, error, learnerIdFromRequest } from "@/lib/platform";
import { runPlatformTutor } from "@/app/workflows/tutor-agent";

export async function POST(req: Request) {
  const userId = learnerIdFromRequest(req);
  if (!userId) return error("UNAUTHORIZED", "missing user", 401);
  const body = PlatformTutorRequestSchema.parse(await req.json());
  const platform = getPlatform();

  const version = await platform.store.getCourseVersion(body.courseVersionId);
  if (!version) return error("NOT_FOUND", "course version not found", 404);
  const ok = await platform.lms.hasAccess(version.courseId, userId);
  if (!ok) {
    const course = await platform.store.getCourse(version.courseId);
    if (course?.access === "PUBLIC_FREE") {
      await platform.lms.ensureFreeEntitlement({
        courseId: version.courseId,
        userId,
      });
    } else {
      return error("FORBIDDEN", "no entitlement", 403);
    }
  }

  let started;
  try {
    started = await platform.tutor.startRun({
      userId,
      courseId: version.courseId,
      courseVersionId: body.courseVersionId,
      conversationId: body.conversationId,
      officialAttemptId: body.officialAttemptId,
      messages: body.messages,
      clientContext: (body as { context?: unknown }).context,
    });
  } catch (e) {
    const err = e as { message?: string };
    if (err.message === "BUDGET_EXCEEDED") {
      return error("BUDGET_EXCEEDED", "tutor budget exceeded", 429);
    }
    return error("TUTOR_FAILED", err.message ?? "failed", 400);
  }

  const messages = body.messages as UIMessage[];
  const run = await start(runPlatformTutor, [
    {
      messages,
      grounding: started.grounding.text,
      title: (await platform.store.getCourse(version.courseId))?.title,
      locked: started.locked,
    },
  ]);

  const readable =
    typeof run.getReadable === "function"
      ? run.getReadable()
      : (run as { readable: ReadableStream<ModelCallStreamPart> }).readable;

  return createUIMessageStreamResponse({
    stream: (readable as ReadableStream<ModelCallStreamPart>).pipeThrough(
      createModelCallToUIChunkTransform(),
    ),
    headers: {
      "x-workflow-run-id": run.runId,
      "x-faraday-tutor-run-id": started.run.id,
      "x-faraday-conversation-id": started.run.conversationId,
    },
  });
}
