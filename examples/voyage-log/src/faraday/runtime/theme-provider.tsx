/* Self-contained light/dark theme provider (no next-themes dependency).
   Toggles the `.dark` class on <html> and persists the choice. */
import * as React from "react";

type Theme = "dark" | "light" | "system";
type Resolved = "dark" | "light";

type ThemeState = { theme: Theme; resolved: Resolved; setTheme: (t: Theme) => void };

const QUERY = "(prefers-color-scheme: dark)";
const Ctx = React.createContext<ThemeState | undefined>(undefined);

function systemTheme(): Resolved {
  return window.matchMedia(QUERY).matches ? "dark" : "light";
}

export function ThemeProvider({
  children,
  defaultTheme = "system",
  storageKey = "faraday-theme",
}: {
  children: React.ReactNode;
  defaultTheme?: Theme;
  storageKey?: string;
}) {
  const [theme, setThemeState] = React.useState<Theme>(() => {
    const stored = typeof localStorage !== "undefined" ? localStorage.getItem(storageKey) : null;
    return stored === "dark" || stored === "light" || stored === "system" ? stored : defaultTheme;
  });
  const [resolved, setResolved] = React.useState<Resolved>("light");

  const apply = React.useCallback((next: Theme) => {
    const r = next === "system" ? systemTheme() : next;
    const root = document.documentElement;
    root.classList.remove("light", "dark");
    root.classList.add(r);
    setResolved(r);
  }, []);

  React.useEffect(() => {
    apply(theme);
    if (theme !== "system") return;
    const mq = window.matchMedia(QUERY);
    const onChange = () => apply("system");
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, [theme, apply]);

  const setTheme = React.useCallback(
    (next: Theme) => {
      try {
        localStorage.setItem(storageKey, next);
      } catch {
        /* storage may be unavailable */
      }
      setThemeState(next);
    },
    [storageKey],
  );

  const value = React.useMemo(() => ({ theme, resolved, setTheme }), [theme, resolved, setTheme]);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useTheme(): ThemeState {
  const ctx = React.useContext(Ctx);
  if (!ctx) throw new Error("useTheme must be used within <ThemeProvider>");
  return ctx;
}
