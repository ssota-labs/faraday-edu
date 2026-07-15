/**
 * Faraday Studio agent — Vercel AI SDK WorkflowAgent on WDK, same shape as
 * ssota `runMainWorkflowAgent` / mirror-dimension `runDimensionAgent`.
 *
 * Tools use mirror-dimension names (`sandbox_*`, `mirror_*`) so ToolGroup logs
 * in the chat UI stay identical.
 */
import { WorkflowAgent, type ModelCallStreamPart } from "@ai-sdk/workflow";
import { convertToModelMessages, type UIMessage } from "ai";
import { getWritable } from "workflow";
import { buildStudioTools } from "./tools/dispatch";

const DEFAULT_MODEL_ID = "anthropic/claude-haiku-4.5";
const REASONING = "medium" as const;

export interface RunStudioAgentInput {
  messages: UIMessage[];
  courseId: string;
  draftId: string;
  ownerId: string;
  modelId?: string;
}

function buildInstructions(input: RunStudioAgentInput): string {
  return [
    "You are Faraday Studio, an AI course authoring agent.",
    "Help the creator design interactive Faraday Academy lessons.",
    "Use sandbox_* tools to read/write lesson files in the draft workspace.",
    "When the lesson has a previewable index.html, call mirror_build (or mirror_dev) so the live preview appears.",
    "Prefer short Markdown replies. Write math with $...$ / $$...$$ only.",
    `Course id: ${input.courseId}. Draft id: ${input.draftId}.`,
  ].join(" ");
}

export async function runStudioAgent(input: RunStudioAgentInput) {
  "use workflow";

  const modelMessages = await convertToModelMessages(input.messages);
  const model = input.modelId?.trim() || DEFAULT_MODEL_ID;

  const agent = new WorkflowAgent({
    model,
    reasoning: REASONING,
    instructions: buildInstructions(input),
    tools: buildStudioTools({
      courseId: input.courseId,
      draftId: input.draftId,
      ownerId: input.ownerId,
    }),
  });

  const result = await agent.stream({
    messages: modelMessages,
    writable: getWritable<ModelCallStreamPart>(),
  });

  return { steps: result.steps.length, courseId: input.courseId };
}
