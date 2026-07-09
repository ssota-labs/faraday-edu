/* LessonHost — the outer frame every lesson mounts inside. Provides:
   - the `.style-faraday` wrapper that activates the component style layer
   - a centered reading column
   - a light/dark toggle
   - an error boundary so an author throw renders a message, not a blank page. */
import { Component, type ErrorInfo, type ReactNode } from "react";
import { MoonIcon, SunIcon } from "@phosphor-icons/react";
import { Button } from "@/faraday/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/faraday/ui/alert";
import { ThemeProvider, useTheme } from "@/faraday/runtime/theme-provider";

class LessonErrorBoundary extends Component<{ children: ReactNode }, { error: Error | null }> {
  state = { error: null as Error | null };
  static getDerivedStateFromError(error: Error) {
    return { error };
  }
  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("[faraday] lesson threw:", error, info.componentStack);
  }
  render() {
    if (this.state.error) {
      return (
        <Alert variant="destructive">
          <AlertTitle>This lesson crashed.</AlertTitle>
          <AlertDescription>
            <p>{this.state.error.message}</p>
            <p>Fix it in src/lesson/, then save — the dev server hot-reloads.</p>
          </AlertDescription>
        </Alert>
      );
    }
    return this.props.children;
  }
}

function ThemeToggle() {
  const { resolved, setTheme } = useTheme();
  return (
    <Button
      variant="ghost"
      size="icon-sm"
      aria-label="Toggle dark mode"
      onClick={() => setTheme(resolved === "dark" ? "light" : "dark")}
    >
      {resolved === "dark" ? <MoonIcon /> : <SunIcon />}
    </Button>
  );
}

export function LessonHost({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider>
      <div className="style-faraday min-h-screen bg-background text-foreground">
        <div className="mx-auto flex max-w-4xl items-center justify-end px-5 pt-4">
          <ThemeToggle />
        </div>
        <main className="mx-auto max-w-4xl px-5 pb-24 pt-2">
          <LessonErrorBoundary>{children}</LessonErrorBoundary>
        </main>
      </div>
    </ThemeProvider>
  );
}
