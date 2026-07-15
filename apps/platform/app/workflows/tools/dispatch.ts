/**
 * Durable tool dispatch — workflow-safe descriptors + `'use step'` execute.
 * Tool names match mirror-dimension so ToolGroup logs stay identical.
 */
import { tool, type ToolSet } from "ai";
import { z } from "zod";

export interface StudioToolScope {
  courseId: string;
  draftId: string;
  ownerId: string;
}

const TITLE_FIELD = {
  title: z
    .string()
    .optional()
    .describe(
      '이 도구 호출이 무엇을 하는지 한 줄(한국어, ~40자)로 요약한 제목. 예: "index.html 작성", "스타일 수정". 매 호출에 채워라.',
    ),
};

async function runStudioToolStep(
  toolName: string,
  input: unknown,
  scope: StudioToolScope,
): Promise<unknown> {
  "use step";

  const { executeStudioTool } = await import("./execute");
  return executeStudioTool(toolName, input, scope);
}

export function buildStudioTools(scope: StudioToolScope): ToolSet {
  return {
    sandbox_read: tool({
      description: "Read a file from the lesson draft workspace.",
      inputSchema: z.object({
        path: z.string().describe("File path relative to the draft root"),
        ...TITLE_FIELD,
      }),
      execute: (input) => runStudioToolStep("sandbox_read", input, scope),
    }),
    sandbox_write: tool({
      description: "Write (create/overwrite) a file in the lesson draft workspace.",
      inputSchema: z.object({
        path: z.string(),
        content: z.string(),
        ...TITLE_FIELD,
      }),
      execute: (input) => runStudioToolStep("sandbox_write", input, scope),
    }),
    sandbox_str_replace: tool({
      description: "Replace a string in a draft file.",
      inputSchema: z.object({
        path: z.string(),
        old_str: z.string(),
        new_str: z.string(),
        ...TITLE_FIELD,
      }),
      execute: (input) => runStudioToolStep("sandbox_str_replace", input, scope),
    }),
    sandbox_delete: tool({
      description: "Delete a file from the draft workspace.",
      inputSchema: z.object({
        path: z.string(),
        ...TITLE_FIELD,
      }),
      execute: (input) => runStudioToolStep("sandbox_delete", input, scope),
    }),
    sandbox_glob: tool({
      description: "List draft files matching a glob-like pattern (substring match).",
      inputSchema: z.object({
        pattern: z.string(),
        ...TITLE_FIELD,
      }),
      execute: (input) => runStudioToolStep("sandbox_glob", input, scope),
    }),
    sandbox_grep: tool({
      description: "Search draft file contents for a pattern.",
      inputSchema: z.object({
        pattern: z.string(),
        ...TITLE_FIELD,
      }),
      execute: (input) => runStudioToolStep("sandbox_grep", input, scope),
    }),
    sandbox_shell: tool({
      description:
        "Run a shell command in the sandbox. Limited stub — returns not available locally.",
      inputSchema: z.object({
        cmd: z.string(),
        ...TITLE_FIELD,
      }),
      execute: (input) => runStudioToolStep("sandbox_shell", input, scope),
    }),
    mirror_info: tool({
      description: "Inspect the current draft structure (file list).",
      inputSchema: z.object({ ...TITLE_FIELD }),
      execute: (input) => runStudioToolStep("mirror_info", input, scope),
    }),
    mirror_dev: tool({
      description:
        "Start / refresh the live preview for the draft. Returns a preview URL.",
      inputSchema: z.object({ ...TITLE_FIELD }),
      execute: (input) => runStudioToolStep("mirror_dev", input, scope),
    }),
    mirror_build: tool({
      description:
        "Build a static preview snapshot of the draft. Returns a preview URL.",
      inputSchema: z.object({ ...TITLE_FIELD }),
      execute: (input) => runStudioToolStep("mirror_build", input, scope),
    }),
  };
}
