import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "MindDump - Clear Your Mind",
  description: "AI-powered thought organization tool",
  manifest: "/manifest.json",
  themeColor: "#667eea",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "MindDump",
  },
  viewport: {
    width: "device-width",
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="apple-touch-icon" href="/icon-192.png" />
      </head>
      <body className="antialiased">{children}</body>
    </html>
  );
}

