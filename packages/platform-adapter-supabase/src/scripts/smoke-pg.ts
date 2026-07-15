import { createPostgresStore } from "../postgres-store";

async function main() {
  const url =
    process.env.DATABASE_URL ||
    "postgresql://postgres:postgres@127.0.0.1:54322/postgres";
  const store = createPostgresStore(url);
  const id = `course_pg_${Date.now().toString(36)}`;
  const slug = `pg-${Date.now().toString(36)}`;
  await store.saveCourse({
    id,
    slug,
    ownerId: "t",
    title: "PG",
    status: "DRAFT",
    access: "PUBLIC_FREE",
    activeReleaseId: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });
  const got = await store.getCourse(id);
  console.log("course", got?.id === id, got?.slug);
  await store.saveDraft("draft_pg_smoke", {
    courseId: id,
    ownerId: "t",
    files: { "index.html": "<h1>hi</h1>" },
  });
  const d = await store.getDraft("draft_pg_smoke");
  console.log("draft", d?.files["index.html"]);
}

main().then(
  () => process.exit(0),
  (err) => {
    console.error(err);
    process.exit(1);
  },
);
