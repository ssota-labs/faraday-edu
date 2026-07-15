import type { TutorRun, UsageMeter } from "@faraday-academy/platform-contracts";
import type { PlatformStore } from "./ports";
import { createId, nowIso } from "./ports";

const DEFAULT_TUTOR_TOKEN_BUDGET = 100_000;

export function createTutorService(
  store: PlatformStore,
  opts?: { tokenBudget?: number },
) {
  const budget = opts?.tokenBudget ?? DEFAULT_TUTOR_TOKEN_BUDGET;

  return {
    async startRun(input: {
      userId: string;
      courseId: string;
      courseVersionId: string;
      conversationId?: string;
      officialAttemptId?: string;
      messages: unknown[];
      /** Client-supplied context/system/answers — always ignored. */
      clientContext?: unknown;
      clientSystem?: unknown;
      clientAnswerKey?: unknown;
    }): Promise<{ run: TutorRun; grounding: { version: string; text: string }; locked: boolean }> {
      void input.clientContext;
      void input.clientSystem;
      void input.clientAnswerKey;
      void input.messages;

      const used = await store.sumUsage(
        input.userId,
        input.courseId,
        "TUTOR_TOKENS",
      );
      if (used >= budget) {
        const run: TutorRun = {
          id: createId("trun"),
          userId: input.userId,
          courseId: input.courseId,
          courseVersionId: input.courseVersionId,
          conversationId: input.conversationId ?? createId("conv"),
          status: "BUDGET_EXCEEDED",
          officialAttemptId: input.officialAttemptId ?? null,
          modelVersion: null,
          groundingVersion: null,
          createdAt: nowIso(),
        };
        await store.saveTutorRun(run);
        throw Object.assign(new Error("BUDGET_EXCEEDED"), { run });
      }

      let locked = false;
      if (input.officialAttemptId) {
        const attempt = await store.getAttempt(input.officialAttemptId);
        if (
          attempt &&
          (attempt.status === "IN_PROGRESS" || attempt.status === "SUBMITTED")
        ) {
          locked = true;
        }
      }

      const sealed = await store.getSealedBundle(input.courseVersionId);
      const groundingVersion = sealed
        ? `sealed:${input.courseVersionId}`
        : `empty:${input.courseVersionId}`;
      const groundingText = locked
        ? "Exam mode: tutor will not discuss answers."
        : typeof sealed === "object" &&
            sealed &&
            "grounding" in (sealed as object)
          ? String((sealed as { grounding?: string }).grounding ?? "")
          : "Course grounding unavailable.";

      const run: TutorRun = {
        id: createId("trun"),
        userId: input.userId,
        courseId: input.courseId,
        courseVersionId: input.courseVersionId,
        conversationId: input.conversationId ?? createId("conv"),
        status: "RUNNING",
        officialAttemptId: input.officialAttemptId ?? null,
        modelVersion: "platform-stub-v1",
        groundingVersion,
        createdAt: nowIso(),
      };
      await store.saveTutorRun(run);

      const meter: UsageMeter = {
        id: createId("use"),
        userId: input.userId,
        courseId: input.courseId,
        kind: "TUTOR_TOKENS",
        quantity: 500,
        occurredAt: nowIso(),
      };
      await store.appendUsage(meter);

      return {
        run,
        grounding: { version: groundingVersion, text: groundingText },
        locked,
      };
    },

    async getRun(runId: string, userId: string): Promise<TutorRun> {
      const run = await store.getTutorRun(runId);
      if (!run) throw new Error("RUN_NOT_FOUND");
      if (run.userId !== userId) throw new Error("FORBIDDEN");
      return run;
    },
  };
}

export function createStudioService(store: PlatformStore) {
  return {
    async saveDraft(input: {
      draftId?: string;
      courseId: string;
      ownerId: string;
      files: Record<string, string>;
    }) {
      const draftId = input.draftId ?? createId("draft");
      await store.saveDraft(draftId, {
        courseId: input.courseId,
        ownerId: input.ownerId,
        files: input.files,
      });
      return { draftId };
    },

    async getDraft(draftId: string, ownerId: string) {
      const draft = await store.getDraft(draftId);
      if (!draft) throw new Error("DRAFT_NOT_FOUND");
      if (draft.ownerId !== ownerId) throw new Error("FORBIDDEN");
      return draft;
    },

    async getDraftByCourseId(courseId: string, ownerId: string) {
      const draft = await store.getDraftByCourseId(courseId);
      if (!draft) throw new Error("DRAFT_NOT_FOUND");
      if (draft.ownerId !== ownerId) throw new Error("FORBIDDEN");
      return draft;
    },

    async listOwnerCourses(ownerId: string) {
      const all = await store.listCourses();
      return all
        .filter((c) => c.ownerId === ownerId)
        .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
    },

    /** Stub agent turn — records intent; real WDK wired in P2 host. */
    async agentTurn(input: {
      ownerId: string;
      courseId: string;
      draftId: string;
      message: string;
    }): Promise<{ reply: string; previewBuildId: string | null }> {
      const draft = await this.getDraft(input.draftId, input.ownerId);
      const reply = `Studio agent received: ${input.message.slice(0, 200)}. Files: ${Object.keys(draft.files).length}.`;
      const hasIndex = "index.html" in draft.files;
      return {
        reply,
        previewBuildId: hasIndex ? input.draftId : null,
      };
    },

    derivePreviewUrl(buildId: string, base = "https://preview.faraday.com") {
      return `${base.replace(/\/$/, "")}/${buildId}/`;
    },
  };
}
