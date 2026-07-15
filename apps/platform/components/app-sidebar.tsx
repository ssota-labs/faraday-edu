"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BookOpenIcon,
  HouseIcon,
  PlusIcon,
  SparkleIcon,
} from "@phosphor-icons/react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupAction,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarRail,
} from "@faraday-academy/ui/components/ui/sidebar";

export interface SidebarLecture {
  id: string;
  title: string;
  order: number;
}

export interface SidebarCourse {
  id: string;
  title: string;
  slug: string;
  lectures: SidebarLecture[];
}

interface AppSidebarProps {
  courses: SidebarCourse[];
  userLabel?: string;
}

/**
 * Creator shell sidebar — mirror-dimension AppSidebar adapted to Faraday
 * course → lecture hierarchy.
 */
export function AppSidebar({
  courses,
  userLabel = "creator_demo",
}: AppSidebarProps) {
  const pathname = usePathname();

  return (
    <Sidebar collapsible="icon" variant="inset">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              size="lg"
              render={<Link href="/home" />}
              tooltip="Faraday"
            >
              <div className="flex aspect-square size-8 items-center justify-center rounded-md bg-primary text-primary-foreground">
                <SparkleIcon className="size-4" />
              </div>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-[family-name:var(--font-heading-family,Fraunces,Georgia,serif)] font-semibold">
                  Faraday
                </span>
                <span className="truncate text-xs text-muted-foreground">
                  Studio
                </span>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>메뉴</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  isActive={pathname === "/home"}
                  tooltip="홈"
                  render={<Link href="/home" />}
                >
                  <HouseIcon />
                  <span>홈</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>코스</SidebarGroupLabel>
          <SidebarGroupAction
            title="새 코스"
            render={<Link href="/courses/new" />}
          >
            <PlusIcon />
            <span className="sr-only">새 코스</span>
          </SidebarGroupAction>
          <SidebarGroupContent>
            <SidebarMenu>
              {courses.length === 0 ? (
                <SidebarMenuItem>
                  <span className="px-2 py-1.5 text-xs text-muted-foreground">
                    코스 없음
                  </span>
                </SidebarMenuItem>
              ) : (
                courses.map((course) => {
                  const href = `/studio/${course.id}`;
                  const active =
                    pathname === href || pathname.startsWith(`${href}/`);
                  return (
                    <SidebarMenuItem key={course.id}>
                      <SidebarMenuButton
                        isActive={active}
                        tooltip={course.title}
                        render={<Link href={href} />}
                      >
                        <BookOpenIcon />
                        <span>{course.title}</span>
                      </SidebarMenuButton>
                      {course.lectures.length > 0 ? (
                        <SidebarMenuSub>
                          {course.lectures
                            .slice()
                            .sort((a, b) => a.order - b.order)
                            .map((lecture) => (
                              <SidebarMenuSubItem key={lecture.id}>
                                <SidebarMenuSubButton
                                  render={
                                    <Link
                                      href={`/studio/${course.id}?lecture=${lecture.id}`}
                                    />
                                  }
                                >
                                  <span>{lecture.title}</span>
                                </SidebarMenuSubButton>
                              </SidebarMenuSubItem>
                            ))}
                        </SidebarMenuSub>
                      ) : null}
                    </SidebarMenuItem>
                  );
                })
              )}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton tooltip={userLabel}>
              <span className="truncate text-xs text-muted-foreground">
                {userLabel}
              </span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
