import Link from "next/link";
import { Button } from "@faraday-academy/ui/components/ui/button";

export default function HomePage() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-[radial-gradient(1200px_600px_at_10%_-10%,color-mix(in_oklch,var(--primary)_18%,transparent)_0%,transparent_55%),linear-gradient(165deg,var(--background)_0%,color-mix(in_oklch,var(--muted)_80%,var(--background))_100%)] px-6 py-16">
      <div className="mx-auto max-w-xl">
        <p className="font-[family-name:var(--font-heading-family,Fraunces,Georgia,serif)] text-[clamp(2.5rem,6vw,4rem)] tracking-[-0.03em] text-foreground">
          Faraday
        </p>
        <h1 className="mt-4 text-xl font-medium text-foreground">
          Interactive courses, built with an agent, learned on a trusted shell.
        </h1>
        <p className="mt-3 max-w-md text-muted-foreground leading-relaxed">
          Stage 2 platform — Studio, Artifact Router, LMS, assessments, tutor,
          payments, and community APIs.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Button render={<Link href="/login" />} nativeButton={false}>
            Sign in
          </Button>
          <Button
            variant="outline"
            render={<Link href="/studio" />}
            nativeButton={false}
          >
            Open Studio
          </Button>
          <Button
            variant="ghost"
            render={<Link href="/legal/terms" />}
            nativeButton={false}
          >
            Terms (draft)
          </Button>
        </div>
      </div>
    </main>
  );
}
