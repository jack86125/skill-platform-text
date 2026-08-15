import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "企业岗位经验 Skill 生成平台",
  description: "自然语言 → 可执行 Skill → 分析结果",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}
