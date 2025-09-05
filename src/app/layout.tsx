import type { Metadata, Viewport } from "next";
import "./globals.css";
import Header from "@/components/header";
import { Analytics } from "@vercel/analytics/react"
import { GoogleAnalytics } from '@next/third-parties/google'
import Footer from "@/components/footer";

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
        <div className="container flex flex-col min-h-screen mx-auto relative">
          {/* Subtle background pattern */}
          <div className="fixed inset-0 bg-gradient-to-br from-blue-50/20 via-transparent to-purple-50/20 dark:from-blue-950/10 dark:via-transparent dark:to-purple-950/10 pointer-events-none" />
          <div className="relative z-10">
            <Header />
            <main className="flex-grow px-4">
              {children}
              <Analytics />
              <GoogleAnalytics gaId={"G-" + process.env.GA_TRACKING_ID} />
            </main>
            <Footer />
          </div>
        </div>
      </body>
    </html>
  );
}
