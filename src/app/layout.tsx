import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "玄机问策｜命理与卜筮",
  description: "以传统文化规则整理的八字、紫微、六爻与梅花易数体验工具。",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="zh-CN"><body>{children}</body></html>;
}
