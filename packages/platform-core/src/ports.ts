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

export interface PlatformStore {
  // courses
  getCourse(id: string): Promise<CourseRecord | null>;
  getCourseBySlug(slug: string): Promise<CourseRecord | null>;
  listCourses(): Promise<CourseRecord[]>;
  saveCourse(course: CourseRecord): Promise<void>;
  saveCourseVersion(version: CourseVersion): Promise<void>;
  getCourseVersion(id: string): Promise<CourseVersion | null>;

  // releases
  saveRelease(release: ReleaseRecord): Promise<void>;
  getRelease(id: string): Promise<ReleaseRecord | null>;
  listReleases(courseId: string): Promise<ReleaseRecord[]>;
  saveManifest(buildHash: string, manifest: ReleaseManifest): Promise<void>;
  getManifest(buildHash: string): Promise<ReleaseManifest | null>;
  saveArtifactFile(
    buildHash: string,
    path: string,
    content: Uint8Array | string,
  ): Promise<void>;
  getArtifactFile(
    buildHash: string,
    path: string,
  ): Promise<Uint8Array | string | null>;
  saveSealedBundle(courseVersionId: string, data: unknown): Promise<void>;
  getSealedBundle(courseVersionId: string): Promise<unknown | null>;

  // entitlements / enrollments
  saveEntitlement(e: Entitlement): Promise<void>;
  listEntitlements(courseId: string, userId: string): Promise<Entitlement[]>;
  saveEnrollment(e: Enrollment): Promise<void>;
  getEnrollment(courseId: string, learnerId: string): Promise<Enrollment | null>;

  // LMS
  appendEvent(event: LearningEvent): Promise<"inserted" | "duplicate">;
  listEvents(courseId: string, learnerId: string): Promise<LearningEvent[]>;
  saveProjection(p: ProgressProjection): Promise<void>;
  getProjection(
    courseId: string,
    learnerId: string,
  ): Promise<ProgressProjection | null>;

  // assessment
  saveAssessmentDefinition(d: AssessmentDefinition): Promise<void>;
  getAssessmentDefinition(id: string): Promise<AssessmentDefinition | null>;
  saveSealedKey(key: SealedGradingKey): Promise<void>;
  getSealedKey(assessmentVersionId: string): Promise<SealedGradingKey | null>;
  saveAttempt(a: AssessmentAttempt): Promise<void>;
  getAttempt(id: string): Promise<AssessmentAttempt | null>;
  getAttemptByIdempotency(
    learnerId: string,
    key: string,
  ): Promise<AssessmentAttempt | null>;

  // tutor
  saveTutorRun(run: TutorRun): Promise<void>;
  getTutorRun(id: string): Promise<TutorRun | null>;
  appendUsage(m: UsageMeter): Promise<void>;
  sumUsage(
    userId: string,
    courseId: string,
    kind: UsageMeter["kind"],
  ): Promise<number>;

  // studio drafts
  saveDraft(
    draftId: string,
    data: { courseId: string; ownerId: string; files: Record<string, string> },
  ): Promise<void>;
  getDraft(draftId: string): Promise<{
    courseId: string;
    ownerId: string;
    files: Record<string, string>;
  } | null>;
  /** Latest draft for a course (Studio open-by-courseId). */
  getDraftByCourseId(courseId: string): Promise<{
    draftId: string;
    courseId: string;
    ownerId: string;
    files: Record<string, string>;
  } | null>;

  // community
  saveThread(t: CommunityThread): Promise<void>;
  listThreads(courseId: string): Promise<CommunityThread[]>;
  saveComment(c: CommunityComment): Promise<void>;
  listComments(threadId: string): Promise<CommunityComment[]>;
  saveReport(r: CommunityReport): Promise<void>;

  // commerce
  saveOrder(o: Order): Promise<void>;
  getOrder(id: string): Promise<Order | null>;
  getOrderByProviderPaymentId(id: string): Promise<Order | null>;

  // auth bootstrap
  saveAuthState(state: string, data: unknown): Promise<void>;
  getAuthState(state: string): Promise<unknown | null>;
  consumeAuthCode(code: string): Promise<unknown | null>;
  saveAuthCode(code: string, data: unknown): Promise<void>;

  // definitions for sample
  saveDefinition(courseVersionId: string, def: CourseDefinition): Promise<void>;
  getDefinition(courseVersionId: string): Promise<CourseDefinition | null>;
}

export function createId(prefix: string): string {
  return `${prefix}_${crypto.randomUUID().replace(/-/g, "").slice(0, 16)}`;
}

export function nowIso(): string {
  return new Date().toISOString();
}
