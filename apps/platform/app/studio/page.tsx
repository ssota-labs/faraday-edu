import { redirect } from "next/navigation";

/** Legacy /studio — redirect into creator home (projects are course-scoped). */
export default function StudioIndexPage() {
  redirect("/home");
}
