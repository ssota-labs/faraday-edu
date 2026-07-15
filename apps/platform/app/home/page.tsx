import Link from "next/link";
import { HomeComposer } from "@/components/home/home-composer";
import { DEMO_CREATOR_ID, listStudioCourses } from "@/lib/studio/courses";
import { Button } from "@faraday-academy/ui/components/ui/button";

export default async function HomePage() {
  const courses = await listStudioCourses(DEMO_CREATOR_ID);

  return (
    <div className="mx-auto w-full max-w-5xl space-y-10 px-4 py-10 md:px-6">
      <section className="space-y-4">
        <div className="space-y-1.5 text-center">
          <h1 className="font-[family-name:var(--font-heading-family,Fraunces,Georgia,serif)] text-3xl tracking-tight text-foreground">
            무엇을 가르칠까요?
          </h1>
          <p className="text-sm text-muted-foreground">
            프롬프트로 코스를 만들고, 렉처 단위로 Studio에서 수업을 구성합니다.
          </p>
        </div>
        <div className="mx-auto w-full max-w-2xl">
          <HomeComposer />
        </div>
      </section>

      <section className="space-y-4">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-sm font-medium text-foreground">내 코스</h2>
          <Button
            variant="outline"
            size="sm"
            render={<Link href="/courses/new" />}
            nativeButton={false}
          >
            직접 만들기
          </Button>
        </div>
        {courses.length === 0 ? (
          <p className="rounded-lg border border-dashed px-4 py-8 text-center text-sm text-muted-foreground">
            아직 코스가 없습니다. 위에서 주제를 설명하며 시작하세요.
          </p>
        ) : (
          <ul className="grid gap-3 sm:grid-cols-2">
            {courses.map((course) => (
              <li key={course.id}>
                <Link
                  href={`/studio/${course.id}`}
                  className="block rounded-lg border bg-card px-4 py-3 transition-colors hover:bg-muted/40"
                >
                  <p className="font-medium text-foreground">{course.title}</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {course.lectures.length} lectures · {course.status}
                  </p>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
