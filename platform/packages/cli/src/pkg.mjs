// Pure helpers for turning a user-supplied name into a package name + display title.

/** "@Foo Bar/Sort Steps" -> "foo-bar/sort-steps"; empty -> "faraday-lesson". */
export function sanitizePackageName(input) {
  const cleaned = String(input ?? "")
    .trim()
    .toLowerCase()
    .replace(/^@/, "")
    .replace(/[^a-z0-9._/-]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return cleaned || "faraday-lesson";
}

/** "sort_steps.lesson" / "sortSteps" -> "Sort Steps Lesson" / "Sort Steps". */
export function normalizeTitle(input) {
  return String(input ?? "")
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .split(/[^A-Za-z0-9]+/)
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ") || "Faraday Lesson";
}
