import type { Metadata, Viewport } from "next";
import "./globals.css";
import Header from "@/components/header";
import { Analytics } from "@vercel/analytics/react"

export const metadata: Metadata = {
  title: "发现话题 - 热点话题榜",
  description: "实时追踪热点，一站式查看与搜索历史话题。",
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <div className="container flex flex-col min-h-screen mx-auto">
          <Header />
          <main className="flex-grow px-4">
            {children}
            <Analytics />
          </main>
        </div>
      </body>
    </html>
  );
}
