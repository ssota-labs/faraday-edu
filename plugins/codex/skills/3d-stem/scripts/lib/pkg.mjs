/** "@Foo Bar/Orbit" -> "foo-bar/orbit"; empty -> "stem-lesson". */
export function sanitizePackageName(input) {
  const cleaned = String(input ?? "")
    .trim()
    .toLowerCase()
    .replace(/^@/, "")
    .replace(/[^a-z0-9._/-]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return cleaned || "stem-lesson";
}

/** "orbital_period" / "bstRotate" -> "Orbital Period" / "Bst Rotate". */
export function normalizeTitle(input) {
  return (
    String(input ?? "")
      .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
      .split(/[^A-Za-z0-9]+/)
      .filter(Boolean)
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" ") || "STEM Lesson"
  );
}
