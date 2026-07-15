/**
 * Node-side studio tool executors — imported only inside `'use step'` bodies
 * so workflow bundles stay free of platform store / fs deps.
 */
import { getPlatform } from "@/lib/platform";
import type { StudioToolScope } from "./dispatch";

function asRecord(input: unknown): Record<string, unknown> {
  return input && typeof input === "object"
    ? (input as Record<string, unknown>)
    : {};
}

function str(input: unknown, key: string): string {
  const v = asRecord(input)[key];
  return typeof v === "string" ? v : "";
}

async function loadDraft(scope: StudioToolScope) {
  const platform = getPlatform();
  const draft = await platform.studio.getDraft(scope.draftId, scope.ownerId);
  return { platform, draft };
}

async function saveFiles(
  scope: StudioToolScope,
  files: Record<string, string>,
) {
  const platform = getPlatform();
  await platform.studio.saveDraft({
    draftId: scope.draftId,
    courseId: scope.courseId,
    ownerId: scope.ownerId,
    files,
  });
}

async function ensurePreview(scope: StudioToolScope): Promise<{ url: string }> {
  const { platform, draft } = await loadDraft(scope);
  const buildId = `prev_${scope.draftId}`;
  const html =
    draft.files["index.html"] ??
    "<!doctype html><html><body><h1>Faraday preview</h1></body></html>";
  await platform.store.saveArtifactFile(buildId, "index.html", html);
  for (const [path, content] of Object.entries(draft.files)) {
    if (path === "index.html") continue;
    await platform.store.saveArtifactFile(buildId, path, content);
  }
  return { url: `/api/preview/${buildId}/` };
}

export async function executeStudioTool(
  toolName: string,
  input: unknown,
  scope: StudioToolScope,
): Promise<unknown> {
  switch (toolName) {
    case "sandbox_read": {
      const path = str(input, "path");
      const { draft } = await loadDraft(scope);
      const content = draft.files[path];
      if (content === undefined) {
        return { ok: false, error: `NOT_FOUND:${path}` };
      }
      return { ok: true, path, content };
    }
    case "sandbox_write": {
      const path = str(input, "path");
      const content = str(input, "content");
      const { draft } = await loadDraft(scope);
      const files = { ...draft.files, [path]: content };
      await saveFiles(scope, files);
      return { ok: true, path, bytes: Buffer.byteLength(content) };
    }
    case "sandbox_str_replace": {
      const path = str(input, "path");
      const oldStr = str(input, "old_str");
      const newStr = str(input, "new_str");
      const { draft } = await loadDraft(scope);
      const prev = draft.files[path];
      if (prev === undefined) return { ok: false, error: `NOT_FOUND:${path}` };
      if (!prev.includes(oldStr)) {
        return { ok: false, error: "OLD_STR_NOT_FOUND" };
      }
      const next = prev.replace(oldStr, newStr);
      await saveFiles(scope, { ...draft.files, [path]: next });
      return { ok: true, path };
    }
    case "sandbox_delete": {
      const path = str(input, "path");
      const { draft } = await loadDraft(scope);
      if (!(path in draft.files)) return { ok: false, error: `NOT_FOUND:${path}` };
      const files = { ...draft.files };
      delete files[path];
      await saveFiles(scope, files);
      return { ok: true, path };
    }
    case "sandbox_glob": {
      const pattern = str(input, "pattern");
      const { draft } = await loadDraft(scope);
      const needle = pattern.replace(/\*/g, "");
      const matches = Object.keys(draft.files).filter((p) =>
        needle ? p.includes(needle) : true,
      );
      return { ok: true, matches };
    }
    case "sandbox_grep": {
      const pattern = str(input, "pattern");
      const { draft } = await loadDraft(scope);
      const hits: Array<{ path: string; line: number; text: string }> = [];
      for (const [path, content] of Object.entries(draft.files)) {
        content.split("\n").forEach((line, i) => {
          if (line.includes(pattern)) {
            hits.push({ path, line: i + 1, text: line.slice(0, 200) });
          }
        });
      }
      return { ok: true, hits: hits.slice(0, 50) };
    }
    case "sandbox_shell": {
      return {
        ok: false,
        error: "SHELL_UNAVAILABLE",
        message: "Shell is not available in the local Faraday Studio sandbox stub.",
        cmd: str(input, "cmd"),
      };
    }
    case "mirror_info": {
      const { draft } = await loadDraft(scope);
      return {
        ok: true,
        courseId: scope.courseId,
        draftId: scope.draftId,
        files: Object.keys(draft.files),
      };
    }
    case "mirror_dev":
    case "mirror_build": {
      const preview = await ensurePreview(scope);
      return { ok: true, url: preview.url, tool: toolName };
    }
    default:
      return { ok: false, error: `UNKNOWN_TOOL:${toolName}` };
  }
}
