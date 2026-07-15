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
import type { PlatformStore } from "./ports";

export function createMemoryStore(): PlatformStore {
  const courses = new Map<string, CourseRecord>();
  const coursesBySlug = new Map<string, string>();
  const versions = new Map<string, CourseVersion>();
  const releases = new Map<string, ReleaseRecord>();
  const manifests = new Map<string, ReleaseManifest>();
  const artifacts = new Map<string, string | Uint8Array>();
  const sealed = new Map<string, unknown>();
  const entitlements = new Map<string, Entitlement>();
  const enrollments = new Map<string, Enrollment>();
  const events = new Map<string, LearningEvent>();
  const projections = new Map<string, ProgressProjection>();
  const assessments = new Map<string, AssessmentDefinition>();
  const sealedKeys = new Map<string, SealedGradingKey>();
  const attempts = new Map<string, AssessmentAttempt>();
  const attemptsByIdem = new Map<string, string>();
  const tutorRuns = new Map<string, TutorRun>();
  const usage: UsageMeter[] = [];
  const drafts = new Map<
    string,
    { courseId: string; ownerId: string; files: Record<string, string> }
  >();
  const threads = new Map<string, CommunityThread>();
  const comments = new Map<string, CommunityComment>();
  const reports = new Map<string, CommunityReport>();
  const orders = new Map<string, Order>();
  const ordersByPi = new Map<string, string>();
  const authStates = new Map<string, unknown>();
  const authCodes = new Map<string, unknown>();
  const definitions = new Map<string, CourseDefinition>();

  const artKey = (hash: string, path: string) => `${hash}::${path}`;
  const projKey = (c: string, u: string) => `${c}::${u}`;
  const enrKey = (c: string, u: string) => `${c}::${u}`;

  return {
    async getCourse(id) {
      return courses.get(id) ?? null;
    },
    async getCourseBySlug(slug) {
      const id = coursesBySlug.get(slug);
      return id ? (courses.get(id) ?? null) : null;
    },
    async listCourses() {
      return [...courses.values()];
    },
    async saveCourse(course) {
      courses.set(course.id, course);
      coursesBySlug.set(course.slug, course.id);
    },
    async saveCourseVersion(version) {
      versions.set(version.id, version);
    },
    async getCourseVersion(id) {
      return versions.get(id) ?? null;
    },
    async saveRelease(release) {
      releases.set(release.id, release);
    },
    async getRelease(id) {
      return releases.get(id) ?? null;
    },
    async listReleases(courseId) {
      return [...releases.values()].filter((r) => r.courseId === courseId);
    },
    async saveManifest(buildHash, manifest) {
      manifests.set(buildHash, manifest);
    },
    async getManifest(buildHash) {
      return manifests.get(buildHash) ?? null;
    },
    async saveArtifactFile(buildHash, path, content) {
      artifacts.set(artKey(buildHash, path), content);
    },
    async getArtifactFile(buildHash, path) {
      return artifacts.get(artKey(buildHash, path)) ?? null;
    },
    async saveSealedBundle(courseVersionId, data) {
      sealed.set(courseVersionId, data);
    },
    async getSealedBundle(courseVersionId) {
      return sealed.get(courseVersionId) ?? null;
    },
    async saveEntitlement(e) {
      entitlements.set(e.id, e);
    },
    async listEntitlements(courseId, userId) {
      return [...entitlements.values()].filter(
        (e) => e.courseId === courseId && e.userId === userId,
      );
    },
    async saveEnrollment(e) {
      enrollments.set(enrKey(e.courseId, e.learnerId), e);
    },
    async getEnrollment(courseId, learnerId) {
      return enrollments.get(enrKey(courseId, learnerId)) ?? null;
    },
    async appendEvent(event) {
      if (events.has(event.eventId)) return "duplicate";
      events.set(event.eventId, event);
      return "inserted";
    },
    async listEvents(courseId, learnerId) {
      return [...events.values()]
        .filter((e) => e.courseId === courseId && e.learnerId === learnerId)
        .sort((a, b) => a.occurredAt.localeCompare(b.occurredAt));
    },
    async saveProjection(p) {
      projections.set(projKey(p.courseId, p.learnerId), p);
    },
    async getProjection(courseId, learnerId) {
      return projections.get(projKey(courseId, learnerId)) ?? null;
    },
    async saveAssessmentDefinition(d) {
      assessments.set(d.assessmentId, d);
    },
    async getAssessmentDefinition(id) {
      return assessments.get(id) ?? null;
    },
    async saveSealedKey(key) {
      sealedKeys.set(key.assessmentVersionId, key);
    },
    async getSealedKey(assessmentVersionId) {
      return sealedKeys.get(assessmentVersionId) ?? null;
    },
    async saveAttempt(a) {
      attempts.set(a.id, a);
      attemptsByIdem.set(`${a.learnerId}::${a.idempotencyKey}`, a.id);
    },
    async getAttempt(id) {
      return attempts.get(id) ?? null;
    },
    async getAttemptByIdempotency(learnerId, key) {
      const id = attemptsByIdem.get(`${learnerId}::${key}`);
      return id ? (attempts.get(id) ?? null) : null;
    },
    async saveTutorRun(run) {
      tutorRuns.set(run.id, run);
    },
    async getTutorRun(id) {
      return tutorRuns.get(id) ?? null;
    },
    async appendUsage(m) {
      usage.push(m);
    },
    async sumUsage(userId, courseId, kind) {
      return usage
        .filter(
          (u) =>
            u.userId === userId && u.courseId === courseId && u.kind === kind,
        )
        .reduce((s, u) => s + u.quantity, 0);
    },
    async saveDraft(draftId, data) {
      drafts.set(draftId, data);
    },
    async getDraft(draftId) {
      return drafts.get(draftId) ?? null;
    },
    async getDraftByCourseId(courseId) {
      for (const [draftId, data] of drafts) {
        if (data.courseId === courseId) {
          return { draftId, ...data };
        }
      }
      return null;
    },
    async saveThread(t) {
      threads.set(t.id, t);
    },
    async listThreads(courseId) {
      return [...threads.values()].filter((t) => t.courseId === courseId);
    },
    async saveComment(c) {
      comments.set(c.id, c);
    },
    async listComments(threadId) {
      return [...comments.values()].filter((c) => c.threadId === threadId);
    },
    async saveReport(r) {
      reports.set(r.id, r);
    },
    async saveOrder(o) {
      orders.set(o.id, o);
      if (o.providerPaymentId) ordersByPi.set(o.providerPaymentId, o.id);
    },
    async getOrder(id) {
      return orders.get(id) ?? null;
    },
    async getOrderByProviderPaymentId(id) {
      const oid = ordersByPi.get(id);
      return oid ? (orders.get(oid) ?? null) : null;
    },
    async saveAuthState(state, data) {
      authStates.set(state, data);
    },
    async getAuthState(state) {
      return authStates.get(state) ?? null;
    },
    async saveAuthCode(code, data) {
      authCodes.set(code, data);
    },
    async consumeAuthCode(code) {
      const data = authCodes.get(code);
      if (!data) return null;
      const typed = data as { used?: boolean };
      if (typed.used) return data;
      const consumed = { ...typed, used: true };
      authCodes.set(code, consumed);
      return { ...typed, used: false };
    },
    async saveDefinition(courseVersionId, def) {
      definitions.set(courseVersionId, def);
    },
    async getDefinition(courseVersionId) {
      return definitions.get(courseVersionId) ?? null;
    },
  };
}
