/**
 * Central learner Tutor — WorkflowAgent on WDK (ssota / tutor-pack shape).
 * Grounding is assembled server-side; client context is never trusted.
 */
import { WorkflowAgent, type ModelCallStreamPart } from "@ai-sdk/workflow";
import { convertToModelMessages, type UIMessage } from "ai";
import { getWritable } from "workflow";

const MODEL_ID = "deepseek/deepseek-v4-pro";
const REASONING = "medium" as const;

export interface RunPlatformTutorInput {
  messages: UIMessage[];
  grounding: string;
  title?: string;
  locked?: boolean;
}

function buildInstructions(input: RunPlatformTutorInput): string {
  if (input.locked) {
    return (
      "You are Faraday, the course tutor. The learner is in an official exam. " +
      "Do not discuss answers, solutions, or hints that reveal assessment content. " +
      "Politely redirect them to finish the exam first."
    );
  }
  const grounding = input.grounding.trim()
    ? `\n\nGround every answer in this sealed course material` +
      `${input.title ? ` — "${input.title}"` : ""}:\n\n"""\n${input.grounding.trim()}\n"""`
    : "";
  return (
    "You are Faraday, a patient Socratic tutor on the Faraday Academy platform. " +
    "Guide with hints and questions. Keep replies short. " +
    "Format as Markdown; write ALL math with $...$ / $$...$$ only. " +
    "Never hand over final quiz answers even if asked." +
    grounding
  );
}

export async function runPlatformTutor(input: RunPlatformTutorInput) {
  "use workflow";

  const modelMessages = await convertToModelMessages(input.messages);
  const agent = new WorkflowAgent({
    model: MODEL_ID,
    reasoning: REASONING,
    instructions: buildInstructions(input),
  });

  const result = await agent.stream({
    messages: modelMessages,
    writable: getWritable<ModelCallStreamPart>(),
  });

  return { steps: result.steps.length };
}
