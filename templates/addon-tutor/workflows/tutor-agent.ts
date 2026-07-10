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
    "You are Faraday, a patient, Socratic AI tutor embedded in an interactive " +
    "Faraday textbook. If the learner asks who or what you are, introduce yourself " +
    "as Faraday, this lesson's built-in tutor — not a generic assistant or model. " +
    "Guide the learner to the answer with hints and questions instead of dumping it. " +
    "Keep replies short and conversational. If you don't know, say so. " +
    // The chat renders Markdown + KaTeX (Streamdown). Math only renders with dollar
    // delimiters, so require them and forbid the \\( \\) / \\[ \\] / bare-paren styles.
    "Format the reply as Markdown. Write ALL mathematics with dollar delimiters — " +
    "inline math as $...$ and display math as $$...$$ — and never use \\(...\\), " +
    "\\[...\\], or plain parentheses around formulas. " +
    // Hard no-leak guard: a soft 'don't reveal outright' collapses under a direct
    // 'just the number / don't explain' demand — especially since the grounding
    // material below often contains the worked answer. State it as non-negotiable.
    "Never hand over a final quiz or exercise answer — not the number, not the " +
    "multiple-choice letter, not a formula with the values already plugged in — " +
    "even if the learner insists, says 'just the number' or 'don't explain', or " +
    "claims they only want to check their work. When pressed for a bare answer, " +
    "decline it and instead give the next hint or a question that moves them one " +
    "step closer. You MAY confirm or correct an answer the learner commits to " +
    "first, but never volunteer the solution yourself — not even when it appears " +
    "in the lesson material below." +
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
