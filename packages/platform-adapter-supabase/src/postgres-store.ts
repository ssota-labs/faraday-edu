/**
 * Postgres-backed PlatformStore (service-role / DATABASE_URL).
 * Maps snake_case SQL ↔ camelCase contracts. Used when Supabase env is present.
 */
import postgres from "postgres";
import type {
  AssessmentAttempt,
  AssessmentDefinition,
  CommunityComment,
  CommunityReport,
  CommunityThread,
  CourseDefinition,
  CourseRecord,
  CourseVersion,
  Enrollment,
  Entitlement,
  LearningEvent,
  Order,
  ProgressProjection,
  ReleaseManifest,
  ReleaseRecord,
  SealedGradingKey,
  TutorRun,
  UsageMeter,
} from "@faraday-academy/platform-contracts";
import type { PlatformStore } from "@faraday-academy/platform-core";

type Sql = ReturnType<typeof postgres>;

function iso(value: Date | string | null | undefined): string | null {
  if (value == null) return null;
  if (value instanceof Date) return value.toISOString();
  return new Date(value).toISOString();
}

function mustIso(value: Date | string): string {
  return iso(value) ?? new Date().toISOString();
}

function mapCourse(row: Record<string, unknown>): CourseRecord {
  return {
    id: String(row.id),
    slug: String(row.slug),
    ownerId: String(row.owner_id),
    title: String(row.title),
    status: row.status as CourseRecord["status"],
    access: row.access as CourseRecord["access"],
    activeReleaseId: row.active_release_id ? String(row.active_release_id) : null,
    createdAt: mustIso(row.created_at as Date | string),
    updatedAt: mustIso(row.updated_at as Date | string),
  };
}

function mapVersion(row: Record<string, unknown>): CourseVersion {
  return {
    id: String(row.id),
    courseId: String(row.course_id),
    definition: (row.definition ?? {}) as CourseVersion["definition"],
    createdAt: mustIso(row.created_at as Date | string),
    publishedAt: iso(row.published_at as Date | string | null),
  };
}

function mapRelease(row: Record<string, unknown>): ReleaseRecord {
  return {
    id: String(row.id),
    courseId: String(row.course_id),
    courseVersionId: String(row.course_version_id),
    buildHash: String(row.build_hash),
    status: row.status as ReleaseRecord["status"],
    manifestSha256: String(row.manifest_sha256),
    publicArtifactPath: String(row.public_artifact_path),
    sealedBundlePath: String(row.sealed_bundle_path),
    createdAt: mustIso(row.created_at as Date | string),
    createdBy: String(row.created_by),
  };
}

function mapEntitlement(row: Record<string, unknown>): Entitlement {
  return {
    id: String(row.id),
    courseId: String(row.course_id),
    userId: row.user_id == null ? null : String(row.user_id),
    status: row.status as Entitlement["status"],
    source: row.source as Entitlement["source"],
    providerReference: row.provider_reference
      ? String(row.provider_reference)
      : null,
    startsAt: mustIso(row.starts_at as Date | string),
    expiresAt: iso(row.expires_at as Date | string | null),
    reason: row.reason == null ? null : String(row.reason),
    createdAt: mustIso(row.created_at as Date | string),
  };
}

function mapEnrollment(row: Record<string, unknown>): Enrollment {
  return {
    id: String(row.id),
    courseId: String(row.course_id),
    learnerId: String(row.learner_id),
    courseVersionId: String(row.course_version_id),
    createdAt: mustIso(row.created_at as Date | string),
  };
}

function mapEvent(row: Record<string, unknown>): LearningEvent {
  return {
    eventId: String(row.event_id),
    schemaVersion: 1,
    courseId: String(row.course_id),
    courseVersionId: String(row.course_version_id),
    learnerId: String(row.learner_id),
    sessionId: String(row.session_id),
    ...(row.node_id ? { nodeId: String(row.node_id) } : {}),
    type: String(row.type),
    occurredAt: mustIso(row.occurred_at as Date | string),
    ...(row.payload !== undefined ? { payload: row.payload } : {}),
  };
}

function mapProjection(row: Record<string, unknown>): ProgressProjection {
  const completed = row.completed_node_ids;
  return {
    courseId: String(row.course_id),
    courseVersionId: String(row.course_version_id),
    learnerId: String(row.learner_id),
    completedNodeIds: Array.isArray(completed)
      ? completed.map(String)
      : [],
    xp: Number(row.xp ?? 0),
    lastEventAt: iso(row.last_event_at as Date | string | null),
    updatedAt: mustIso(row.updated_at as Date | string),
  };
}

function mapAttempt(row: Record<string, unknown>): AssessmentAttempt {
  return {
    id: String(row.id),
    assessmentId: String(row.assessment_id),
    assessmentVersionId: String(row.assessment_version_id),
    courseId: String(row.course_id),
    courseVersionId: String(row.course_version_id),
    learnerId: String(row.learner_id),
    status: row.status as AssessmentAttempt["status"],
    itemOrder: Array.isArray(row.item_order)
      ? (row.item_order as string[])
      : [],
    responses: (row.responses ?? {}) as Record<string, unknown>,
    score: row.score == null ? null : Number(row.score),
    passed: row.passed == null ? null : Boolean(row.passed),
    startedAt: mustIso(row.started_at as Date | string),
    submittedAt: iso(row.submitted_at as Date | string | null),
    gradedAt: iso(row.graded_at as Date | string | null),
    idempotencyKey: String(row.idempotency_key),
  };
}

function mapThread(row: Record<string, unknown>): CommunityThread {
  return {
    id: String(row.id),
    courseId: String(row.course_id),
    authorId: String(row.author_id),
    title: String(row.title),
    body: String(row.body),
    pinned: Boolean(row.pinned),
    locked: Boolean(row.locked),
    hidden: Boolean(row.hidden),
    createdAt: mustIso(row.created_at as Date | string),
    updatedAt: mustIso(row.updated_at as Date | string),
  };
}

function mapOrder(row: Record<string, unknown>): Order {
  return {
    id: String(row.id),
    courseId: String(row.course_id),
    buyerId: String(row.buyer_id),
    amountCents: Number(row.amount_cents),
    currency: String(row.currency),
    status: row.status as Order["status"],
    provider: "stripe",
    providerPaymentId: row.provider_payment_id
      ? String(row.provider_payment_id)
      : null,
    entitlementId: row.entitlement_id ? String(row.entitlement_id) : null,
    createdAt: mustIso(row.created_at as Date | string),
    updatedAt: mustIso(row.updated_at as Date | string),
  };
}

function mapTutor(row: Record<string, unknown>): TutorRun {
  return {
    id: String(row.id),
    userId: String(row.user_id),
    courseId: String(row.course_id),
    courseVersionId: String(row.course_version_id),
    conversationId: String(row.conversation_id),
    status: row.status as TutorRun["status"],
    officialAttemptId: row.official_attempt_id
      ? String(row.official_attempt_id)
      : null,
    modelVersion: row.model_version ? String(row.model_version) : null,
    groundingVersion: row.grounding_version
      ? String(row.grounding_version)
      : null,
    createdAt: mustIso(row.created_at as Date | string),
  };
}

function asText(content: Uint8Array | string): string {
  if (typeof content === "string") return content;
  return Buffer.from(content).toString("base64");
}

export function createPostgresStore(connectionString: string): PlatformStore {
  const sql: Sql = postgres(connectionString, {
    max: 10,
    idle_timeout: 20,
    connect_timeout: 10,
  });

  return {
    async getCourse(id) {
      const rows = await sql`select * from courses where id = ${id} limit 1`;
      return rows[0] ? mapCourse(rows[0] as Record<string, unknown>) : null;
    },
    async getCourseBySlug(slug) {
      const rows = await sql`select * from courses where slug = ${slug} limit 1`;
      return rows[0] ? mapCourse(rows[0] as Record<string, unknown>) : null;
    },
    async listCourses() {
      const rows = await sql`select * from courses order by created_at asc`;
      return rows.map((r) => mapCourse(r as Record<string, unknown>));
    },
    async saveCourse(course) {
      await sql`
        insert into courses (
          id, slug, owner_id, title, status, access, active_release_id, created_at, updated_at
        ) values (
          ${course.id}, ${course.slug}, ${course.ownerId}, ${course.title},
          ${course.status}, ${course.access}, ${course.activeReleaseId},
          ${course.createdAt}, ${course.updatedAt}
        )
        on conflict (id) do update set
          slug = excluded.slug,
          owner_id = excluded.owner_id,
          title = excluded.title,
          status = excluded.status,
          access = excluded.access,
          active_release_id = excluded.active_release_id,
          updated_at = excluded.updated_at
      `;
    },
    async saveCourseVersion(version) {
      await sql`
        insert into course_versions (id, course_id, definition, created_at, published_at)
        values (
          ${version.id}, ${version.courseId}, ${sql.json(version.definition as never)},
          ${version.createdAt}, ${version.publishedAt}
        )
        on conflict (id) do update set
          course_id = excluded.course_id,
          definition = excluded.definition,
          published_at = excluded.published_at
      `;
    },
    async getCourseVersion(id) {
      const rows =
        await sql`select * from course_versions where id = ${id} limit 1`;
      return rows[0] ? mapVersion(rows[0] as Record<string, unknown>) : null;
    },

    async saveRelease(release) {
      await sql`
        insert into releases (
          id, course_id, course_version_id, build_hash, status, manifest_sha256,
          public_artifact_path, sealed_bundle_path, created_at, created_by
        ) values (
          ${release.id}, ${release.courseId}, ${release.courseVersionId},
          ${release.buildHash}, ${release.status}, ${release.manifestSha256},
          ${release.publicArtifactPath}, ${release.sealedBundlePath},
          ${release.createdAt}, ${release.createdBy}
        )
        on conflict (id) do update set
          status = excluded.status,
          manifest_sha256 = excluded.manifest_sha256,
          public_artifact_path = excluded.public_artifact_path,
          sealed_bundle_path = excluded.sealed_bundle_path
      `;
    },
    async getRelease(id) {
      const rows = await sql`select * from releases where id = ${id} limit 1`;
      return rows[0] ? mapRelease(rows[0] as Record<string, unknown>) : null;
    },
    async listReleases(courseId) {
      const rows =
        await sql`select * from releases where course_id = ${courseId} order by created_at asc`;
      return rows.map((r) => mapRelease(r as Record<string, unknown>));
    },
    async saveManifest(buildHash, manifest) {
      await sql`
        insert into release_manifests (build_hash, manifest, updated_at)
        values (${buildHash}, ${sql.json(manifest as never)}, now())
        on conflict (build_hash) do update set
          manifest = excluded.manifest,
          updated_at = now()
      `;
    },
    async getManifest(buildHash) {
      const rows =
        await sql`select manifest from release_manifests where build_hash = ${buildHash} limit 1`;
      return rows[0]
        ? (rows[0].manifest as ReleaseManifest)
        : null;
    },
    async saveArtifactFile(buildHash, path, content) {
      const text = asText(content);
      await sql`
        insert into artifact_files (build_hash, path, content, updated_at)
        values (${buildHash}, ${path}, ${text}, now())
        on conflict (build_hash, path) do update set
          content = excluded.content,
          updated_at = now()
      `;
    },
    async getArtifactFile(buildHash, path) {
      const rows =
        await sql`select content from artifact_files where build_hash = ${buildHash} and path = ${path} limit 1`;
      return rows[0] ? String(rows[0].content) : null;
    },
    async saveSealedBundle(courseVersionId, data) {
      await sql`
        insert into sealed_bundles (course_version_id, data, updated_at)
        values (${courseVersionId}, ${sql.json(data as never)}, now())
        on conflict (course_version_id) do update set
          data = excluded.data,
          updated_at = now()
      `;
    },
    async getSealedBundle(courseVersionId) {
      const rows =
        await sql`select data from sealed_bundles where course_version_id = ${courseVersionId} limit 1`;
      return rows[0] ? rows[0].data : null;
    },

    async saveEntitlement(e) {
      await sql`
        insert into entitlements (
          id, course_id, user_id, status, source, provider_reference,
          starts_at, expires_at, reason, created_at
        ) values (
          ${e.id}, ${e.courseId}, ${e.userId}, ${e.status}, ${e.source},
          ${e.providerReference}, ${e.startsAt}, ${e.expiresAt}, ${e.reason},
          ${e.createdAt}
        )
        on conflict (id) do update set
          status = excluded.status,
          source = excluded.source,
          provider_reference = excluded.provider_reference,
          starts_at = excluded.starts_at,
          expires_at = excluded.expires_at,
          reason = excluded.reason
      `;
    },
    async listEntitlements(courseId, userId) {
      const rows = await sql`
        select * from entitlements
        where course_id = ${courseId} and user_id = ${userId}
        order by created_at asc
      `;
      return rows.map((r) => mapEntitlement(r as Record<string, unknown>));
    },
    async saveEnrollment(e) {
      await sql`
        insert into enrollments (id, course_id, learner_id, course_version_id, created_at)
        values (${e.id}, ${e.courseId}, ${e.learnerId}, ${e.courseVersionId}, ${e.createdAt})
        on conflict (course_id, learner_id) do update set
          id = excluded.id,
          course_version_id = excluded.course_version_id
      `;
    },
    async getEnrollment(courseId, learnerId) {
      const rows = await sql`
        select * from enrollments
        where course_id = ${courseId} and learner_id = ${learnerId}
        limit 1
      `;
      return rows[0] ? mapEnrollment(rows[0] as Record<string, unknown>) : null;
    },

    async appendEvent(event) {
      try {
        await sql`
          insert into learning_events (
            event_id, schema_version, course_id, course_version_id, learner_id,
            session_id, node_id, type, occurred_at, payload
          ) values (
            ${event.eventId}, ${event.schemaVersion}, ${event.courseId},
            ${event.courseVersionId}, ${event.learnerId}, ${event.sessionId},
            ${event.nodeId ?? null}, ${event.type}, ${event.occurredAt},
            ${event.payload === undefined ? null : sql.json(event.payload as never)}
          )
        `;
        return "inserted";
      } catch (err) {
        const code = (err as { code?: string }).code;
        if (code === "23505") return "duplicate";
        throw err;
      }
    },
    async listEvents(courseId, learnerId) {
      const rows = await sql`
        select * from learning_events
        where course_id = ${courseId} and learner_id = ${learnerId}
        order by occurred_at asc
      `;
      return rows.map((r) => mapEvent(r as Record<string, unknown>));
    },
    async saveProjection(p) {
      await sql`
        insert into progress_projections (
          course_id, learner_id, course_version_id, completed_node_ids,
          xp, last_event_at, updated_at
        ) values (
          ${p.courseId}, ${p.learnerId}, ${p.courseVersionId},
          ${sql.json(p.completedNodeIds as never)}, ${p.xp}, ${p.lastEventAt},
          ${p.updatedAt}
        )
        on conflict (course_id, learner_id) do update set
          course_version_id = excluded.course_version_id,
          completed_node_ids = excluded.completed_node_ids,
          xp = excluded.xp,
          last_event_at = excluded.last_event_at,
          updated_at = excluded.updated_at
      `;
    },
    async getProjection(courseId, learnerId) {
      const rows = await sql`
        select * from progress_projections
        where course_id = ${courseId} and learner_id = ${learnerId}
        limit 1
      `;
      return rows[0]
        ? mapProjection(rows[0] as Record<string, unknown>)
        : null;
    },

    async saveAssessmentDefinition(d) {
      await sql`
        insert into assessment_definitions (assessment_id, definition, updated_at)
        values (${d.assessmentId}, ${sql.json(d as never)}, now())
        on conflict (assessment_id) do update set
          definition = excluded.definition,
          updated_at = now()
      `;
    },
    async getAssessmentDefinition(id) {
      const rows =
        await sql`select definition from assessment_definitions where assessment_id = ${id} limit 1`;
      return rows[0] ? (rows[0].definition as AssessmentDefinition) : null;
    },
    async saveSealedKey(key) {
      await sql`
        insert into sealed_grading_keys (assessment_version_id, payload, updated_at)
        values (${key.assessmentVersionId}, ${sql.json(key as never)}, now())
        on conflict (assessment_version_id) do update set
          payload = excluded.payload,
          updated_at = now()
      `;
    },
    async getSealedKey(assessmentVersionId) {
      const rows =
        await sql`select payload from sealed_grading_keys where assessment_version_id = ${assessmentVersionId} limit 1`;
      return rows[0] ? (rows[0].payload as SealedGradingKey) : null;
    },
    async saveAttempt(a) {
      await sql`
        insert into assessment_attempts (
          id, assessment_id, assessment_version_id, course_id, course_version_id,
          learner_id, status, item_order, responses, score, passed,
          started_at, submitted_at, graded_at, idempotency_key
        ) values (
          ${a.id}, ${a.assessmentId}, ${a.assessmentVersionId}, ${a.courseId},
          ${a.courseVersionId}, ${a.learnerId}, ${a.status},
          ${sql.json(a.itemOrder as never)}, ${sql.json(a.responses as never)},
          ${a.score}, ${a.passed}, ${a.startedAt}, ${a.submittedAt},
          ${a.gradedAt}, ${a.idempotencyKey}
        )
        on conflict (id) do update set
          status = excluded.status,
          responses = excluded.responses,
          score = excluded.score,
          passed = excluded.passed,
          submitted_at = excluded.submitted_at,
          graded_at = excluded.graded_at
      `;
    },
    async getAttempt(id) {
      const rows =
        await sql`select * from assessment_attempts where id = ${id} limit 1`;
      return rows[0] ? mapAttempt(rows[0] as Record<string, unknown>) : null;
    },
    async getAttemptByIdempotency(learnerId, key) {
      const rows = await sql`
        select * from assessment_attempts
        where learner_id = ${learnerId} and idempotency_key = ${key}
        limit 1
      `;
      return rows[0] ? mapAttempt(rows[0] as Record<string, unknown>) : null;
    },

    async saveTutorRun(run) {
      await sql`
        insert into tutor_runs (
          id, user_id, course_id, course_version_id, conversation_id, status,
          official_attempt_id, model_version, grounding_version, created_at
        ) values (
          ${run.id}, ${run.userId}, ${run.courseId}, ${run.courseVersionId},
          ${run.conversationId}, ${run.status}, ${run.officialAttemptId},
          ${run.modelVersion}, ${run.groundingVersion}, ${run.createdAt}
        )
        on conflict (id) do update set
          status = excluded.status,
          model_version = excluded.model_version,
          grounding_version = excluded.grounding_version
      `;
    },
    async getTutorRun(id) {
      const rows =
        await sql`select * from tutor_runs where id = ${id} limit 1`;
      return rows[0] ? mapTutor(rows[0] as Record<string, unknown>) : null;
    },
    async appendUsage(m) {
      await sql`
        insert into usage_meters (id, user_id, course_id, kind, quantity, occurred_at)
        values (${m.id}, ${m.userId}, ${m.courseId}, ${m.kind}, ${m.quantity}, ${m.occurredAt})
      `;
    },
    async sumUsage(userId, courseId, kind) {
      const rows = await sql`
        select coalesce(sum(quantity), 0) as total
        from usage_meters
        where user_id = ${userId} and course_id = ${courseId} and kind = ${kind}
      `;
      return Number(rows[0]?.total ?? 0);
    },

    async saveDraft(draftId, data) {
      await sql`
        insert into studio_drafts (id, course_id, owner_id, files, updated_at)
        values (
          ${draftId}, ${data.courseId}, ${data.ownerId},
          ${sql.json(data.files as never)}, now()
        )
        on conflict (id) do update set
          course_id = excluded.course_id,
          owner_id = excluded.owner_id,
          files = excluded.files,
          updated_at = now()
      `;
    },
    async getDraft(draftId) {
      const rows =
        await sql`select * from studio_drafts where id = ${draftId} limit 1`;
      if (!rows[0]) return null;
      const row = rows[0] as Record<string, unknown>;
      return {
        courseId: String(row.course_id),
        ownerId: String(row.owner_id),
        files: (row.files ?? {}) as Record<string, string>,
      };
    },

    async saveThread(t) {
      await sql`
        insert into community_threads (
          id, course_id, author_id, title, body, pinned, locked, hidden, created_at, updated_at
        ) values (
          ${t.id}, ${t.courseId}, ${t.authorId}, ${t.title}, ${t.body},
          ${t.pinned}, ${t.locked}, ${t.hidden}, ${t.createdAt}, ${t.updatedAt}
        )
        on conflict (id) do update set
          title = excluded.title,
          body = excluded.body,
          pinned = excluded.pinned,
          locked = excluded.locked,
          hidden = excluded.hidden,
          updated_at = excluded.updated_at
      `;
    },
    async listThreads(courseId) {
      const rows = await sql`
        select * from community_threads
        where course_id = ${courseId}
        order by created_at desc
      `;
      return rows.map((r) => mapThread(r as Record<string, unknown>));
    },
    async saveComment(c: CommunityComment) {
      await sql`
        insert into community_comments (id, thread_id, author_id, body, hidden, created_at)
        values (${c.id}, ${c.threadId}, ${c.authorId}, ${c.body}, ${c.hidden}, ${c.createdAt})
        on conflict (id) do update set
          body = excluded.body,
          hidden = excluded.hidden
      `;
    },
    async listComments(threadId) {
      const rows = await sql`
        select * from community_comments
        where thread_id = ${threadId}
        order by created_at asc
      `;
      return rows.map((r) => {
        const row = r as Record<string, unknown>;
        return {
          id: String(row.id),
          threadId: String(row.thread_id),
          authorId: String(row.author_id),
          body: String(row.body),
          hidden: Boolean(row.hidden),
          createdAt: mustIso(row.created_at as Date | string),
        } satisfies CommunityComment;
      });
    },
    async saveReport(r: CommunityReport) {
      await sql`
        insert into community_reports (id, payload, created_at)
        values (${r.id}, ${sql.json(r as never)}, ${r.createdAt})
        on conflict (id) do nothing
      `;
    },

    async saveOrder(o) {
      await sql`
        insert into orders (
          id, course_id, buyer_id, amount_cents, currency, status, provider,
          provider_payment_id, entitlement_id, created_at, updated_at
        ) values (
          ${o.id}, ${o.courseId}, ${o.buyerId}, ${o.amountCents}, ${o.currency},
          ${o.status}, ${o.provider}, ${o.providerPaymentId}, ${o.entitlementId},
          ${o.createdAt}, ${o.updatedAt}
        )
        on conflict (id) do update set
          status = excluded.status,
          provider_payment_id = excluded.provider_payment_id,
          entitlement_id = excluded.entitlement_id,
          updated_at = excluded.updated_at
      `;
    },
    async getOrder(id) {
      const rows = await sql`select * from orders where id = ${id} limit 1`;
      return rows[0] ? mapOrder(rows[0] as Record<string, unknown>) : null;
    },
    async getOrderByProviderPaymentId(id) {
      const rows =
        await sql`select * from orders where provider_payment_id = ${id} limit 1`;
      return rows[0] ? mapOrder(rows[0] as Record<string, unknown>) : null;
    },

    async saveAuthState(state, data) {
      await sql`
        insert into auth_bootstrap_states (state, data, created_at)
        values (${state}, ${sql.json(data as never)}, now())
        on conflict (state) do update set data = excluded.data
      `;
    },
    async getAuthState(state) {
      const rows =
        await sql`select data from auth_bootstrap_states where state = ${state} limit 1`;
      return rows[0] ? rows[0].data : null;
    },
    async saveAuthCode(code, data) {
      await sql`
        insert into auth_bootstrap_codes (code, data, created_at)
        values (${code}, ${sql.json(data as never)}, now())
        on conflict (code) do update set data = excluded.data
      `;
    },
    async consumeAuthCode(code) {
      const rows = await sql`
        delete from auth_bootstrap_codes
        where code = ${code}
        returning data
      `;
      return rows[0] ? rows[0].data : null;
    },

    async saveDefinition(courseVersionId, def) {
      const existing = await this.getCourseVersion(courseVersionId);
      if (existing) {
        await this.saveCourseVersion({
          ...existing,
          definition: def as unknown as CourseVersion["definition"],
        });
        return;
      }
      await sql`
        insert into course_versions (id, course_id, definition, created_at, published_at)
        values (
          ${courseVersionId},
          ${(def as CourseDefinition).courseId},
          ${sql.json(def as never)},
          now(),
          null
        )
        on conflict (id) do update set definition = excluded.definition
      `;
    },
    async getDefinition(courseVersionId) {
      const version = await this.getCourseVersion(courseVersionId);
      if (!version) return null;
      return version.definition as unknown as CourseDefinition;
    },
  };
}
