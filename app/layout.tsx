import type { Metadata } from "next";
import { tokenRootCss } from "@/lib/tokens";
import "./globals.css";

export const metadata: Metadata = {
  title: "WetBlessing",
  description: "Campus romance VN — suggestive, not adult. College 18+.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body className="min-h-dvh bg-void antialiased">
        <style dangerouslySetInnerHTML={{ __html: tokenRootCss() }} />
        {children}
      </body>
    </html>
  );
}
