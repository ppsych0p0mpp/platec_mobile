import type { Metadata, Viewport } from "next";
import "./globals.css";
import { AuthProvider } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Student Attendance",
  description: "Student Attendance Management System",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Attendance",
  },
  formatDetection: {
    telephone: false,
  },
  other: {
    "mobile-web-app-capable": "yes",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
  themeColor: "#0a0a0f",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        {/* iOS icon */}
        <link rel="apple-touch-icon" href="/icons/icon.svg" />
        <link rel="icon" type="image/svg+xml" href="/icons/icon.svg" />
      </head>
      <body className="font-sans antialiased overflow-x-hidden">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
