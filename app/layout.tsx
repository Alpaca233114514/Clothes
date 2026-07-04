import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "工服分拣系统 Demo",
  description: "移动端优先的衣物扫码分拣 Demo"
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}
