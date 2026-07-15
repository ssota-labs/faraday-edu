import type { Metadata } from "next";
import { Toaster } from "@faraday-academy/ui/components/ui/sonner";
import "./globals.css";

export const metadata: Metadata = {
  title: "Faraday",
  description: "Interactive courses, built with an agent, learned on a trusted shell.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="style-platform font-sans" suppressHydrationWarning>
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,600&family=IBM+Plex+Sans:wght@400;500;600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen bg-background text-foreground antialiased">
        {children}
        <Toaster />
      </body>
    </html>
  );
}
