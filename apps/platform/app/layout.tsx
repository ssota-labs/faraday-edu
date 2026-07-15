import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Faraday Academy",
  description: "Open interactive course platform",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@400;500;600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-svh antialiased">{children}</body>
    </html>
  );
}
