import type { Metadata } from "next";
import { Noto_Sans_SC, Syne } from "next/font/google";
import { tokenCssVars } from "@/lib/tokens";
import "./globals.css";

const display = Syne({
  subsets: ["latin"],
  variable: "--font-display",
  weight: ["500", "700", "800"],
});

const ui = Noto_Sans_SC({
  subsets: ["latin"],
  variable: "--font-ui",
  weight: ["400", "500", "700"],
});

export const metadata: Metadata = {
  title: "WetBlessing",
  description: "Campus romance VN. Suggestive, not adult. College 18+.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body className={`${display.variable} ${ui.variable} antialiased`} style={tokenCssVars()}>
        {children}
      </body>
    </html>
  );
}
