import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@faraday-academy/ui/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { DEMO_CREATOR_ID, listStudioCourses } from "@/lib/studio/courses";

export default async function HomeShellLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const courses = await listStudioCourses(DEMO_CREATOR_ID);

  return (
    <SidebarProvider>
      <AppSidebar
        userLabel={DEMO_CREATOR_ID}
        courses={courses.map((c) => ({
          id: c.id,
          title: c.title,
          slug: c.slug,
          lectures: c.lectures,
        }))}
      />
      <SidebarInset>
        <header className="flex h-14 shrink-0 items-center gap-2 border-b px-4">
          <SidebarTrigger />
          <span className="text-sm text-muted-foreground">Creator home</span>
        </header>
        <div className="min-h-0 flex-1 overflow-auto">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  );
}
