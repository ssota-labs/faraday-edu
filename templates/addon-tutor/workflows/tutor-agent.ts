// The durable tutor — a Workflow DevKit `"use workflow"` run wrapping an
// @ai-sdk/workflow `WorkflowAgent`. This file is the tutor's brain and is meant
// to be edited: the grounding + persona live in `buildInstructions`. Shape mirrors
// mirror-dimension's dimension-agent (WorkflowAgent + `getWritable` stream),
// trimmed to a single tutoring loop — no tools/compaction/cache-breakpoints yet
// (compaction, tools/RAG, and grounding gates come later).
//
// "Durable" means: the run survives a page refresh, a network drop, or a
// serverless timeout. The client (WorkflowChatTransport) reconnects to the same
// run via api/chat/[runId]/stream.get.ts and resumes the stream mid-answer.
import { WorkflowAgent, type ModelCallStreamPart } from "@ai-sdk/workflow";
import { convertToModelMessages, type UIMessage } from "ai";
import { getWritable } from "workflow";

// AI Gateway model id — a *serializable string* (WorkflowAgent step bundles reject
// live model instances). DeepSeek V4 Pro: a reasoning model that is cheap and
// supports IMPLICIT prompt caching (tags: reasoning, tool-use, implicit-caching).
// Verified live against https://ai-gateway.vercel.sh/v1/models — refetch before
// changing, don't trust memory (models are retired frequently). Swap for e.g.
// "anthropic/claude-sonnet-5" for harder subjects (but see the caching note below).
const MODEL_ID = "deepseek/deepseek-v4-pro";

// Thinking (extended reasoning). DeepSeek V4 Pro is a reasoning model; this unified
// AI SDK param turns it on and the provider translates it to native thinking. The
// reasoning stream renders in the chat as a collapsible "Thinking" block. Reasoning
// tokens bill as output, so 'medium' balances depth vs cost — bump to 'high'/'xhigh'
// for harder tutoring. Values: provider-default | none | minimal | low | medium | high | xhigh.
const REASONING: "provider-default" | "none" | "minimal" | "low" | "medium" | "high" | "xhigh" =
  "medium";

// Caching. DeepSeek caches automatically ("implicit-caching"): any request whose
// prompt PREFIX matches a recent one reads the cached tokens (billed at
// `input_cache_read`, ~120× cheaper). We don't set explicit breakpoints the way an
// Anthropic model would — we just keep the prefix stable: `buildInstructions` is
// deterministic (no timestamps/random), so the system prompt + grounding is byte-stable
// across a conversation, and each new turn cache-reads the growing prior prefix.
// (If you switch to an Anthropic model, caching needs explicit `cache_control`
// breakpoints via `prepareStep` — see mirror-dimension's dimension-agent.)

export interface RunTutorAgentInput {
  /** Raw chat history from the client's useChat (converted below). */
  messages: UIMessage[];
  /** Lesson/curriculum text the tutor is grounded in (from `<Tutor context>`). */
  context?: string;
  /** Human-facing lesson title, for framing. */
  title?: string;
}

/** Compose the grounded system prompt. Pure string work — safe in the sandbox. */
function buildInstructions(input: RunTutorAgentInput): string {
  const grounding = input.context?.trim()
    ? `\n\nYou are tutoring on this lesson${input.title ? ` — "${input.title}"` : ""}. ` +
      `Ground every answer in the material below. If a question falls outside it, ` +
      `say so plainly and steer back to the lesson:\n\n"""\n${input.context.trim()}\n"""`
    : "";
  return (
    "You are a patient, Socratic tutor embedded in an interactive textbook. " +
    "Guide the learner to the answer with hints and questions instead of dumping it. " +
    "Keep replies short and conversational. Never reveal quiz or exercise solutions " +
    "outright — scaffold toward them. If you don't know, say so." +
    grounding
  );
}

export async function runTutorAgent(input: RunTutorAgentInput) {
  "use workflow";

  // UIMessage[] (client wire format) -> ModelMessage[]. Pure transform (async).
  const modelMessages = await convertToModelMessages(input.messages);

  const agent = new WorkflowAgent({
    model: MODEL_ID,
    reasoning: REASONING, // extended thinking (see REASONING above)
    instructions: buildInstructions(input),
  });

  // Stream to the run's default writable — the API route pipes this readable to
  // the client and tags it with the run id for durable reconnection.
  const result = await agent.stream({
    messages: modelMessages,
    writable: getWritable<ModelCallStreamPart>(),
  });

  return { steps: result.steps.length };
}
