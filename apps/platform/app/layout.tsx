import type { Metadata } from "next";
import { Toaster } from "@faraday-academy/ui/components/ui/sonner";
import "./globals.css";

export const metadata: Metadata = {
  title: "Faraday Catalog",
  description: "Explore Faraday blocks, packs, and interactive lesson examples.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko" className="style-platform font-sans" suppressHydrationWarning>
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,600&family=IBM+Plex+Sans:wght@400;500;600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-svh bg-background text-foreground antialiased">
        {children}
        <Toaster />
      </body>
    </html>
  );
}
