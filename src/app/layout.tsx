import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { TooltipProvider } from "@/components/ui/tooltip";
import { BrandProvider } from "@/lib/brand-context";
import { Sidebar } from "@/components/layout/sidebar";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "BubblePulse — 出海茶饮内容策略平台",
  description: "为出海茶饮品牌提供海外社交媒体热点情报、KOL匹配与内容策略建议",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="zh-CN"
      className={`${geistSans.variable} ${geistMono.variable} dark h-full antialiased`}
    >
      <body className="flex min-h-full bg-slate-950">
        <BrandProvider>
          <TooltipProvider>
            <Sidebar />
            <main className="ml-64 flex-1 p-6">{children}</main>
          </TooltipProvider>
        </BrandProvider>
      </body>
    </html>
  );
}
