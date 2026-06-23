import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://web-exposure-check.vercel.app"),
  title: "Web Exposure Check | Website Security Scanner",
  description:
    "Check your website exposure, SSL certificate, SPF, DMARC and security headers in seconds.",
  keywords: [
    "website security check",
    "web exposure scanner",
    "SSL checker",
    "SPF checker",
    "DMARC checker",
    "security headers checker",
    "website risk assessment",
  ],
  authors: [{ name: "Web Exposure Check" }],
  creator: "Web Exposure Check",
  openGraph: {
    title: "Web Exposure Check",
    description:
      "Analyze basic SSL, email security and public website risks before they become real problems.",
    url: "https://web-exposure-check.vercel.app",
    siteName: "Web Exposure Check",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Web Exposure Check",
    description:
      "Check your website exposure, SSL, SPF, DMARC and security headers in seconds.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}