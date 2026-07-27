import type { Metadata } from "next";
import "./globals.css";

const deploymentHost = process.env.VERCEL_PROJECT_PRODUCTION_URL ?? process.env.VERCEL_URL;

export const metadata: Metadata = {
  metadataBase: new URL(deploymentHost ? `https://${deploymentHost}` : "http://localhost:3000"),
  title: "财升宝智能化升级｜Word原型复刻 Demo",
  description: "依据中原证券财升宝智能化升级方案原型图还原的发现、看盘、选股与经典版联动交互 Demo",
  openGraph: {
    title: "财升宝 智能化升级 Demo",
    description: "首页、行情、交易、理财、我的经典版一级入口交互原型",
    images: ["/og-classic.png"],
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="zh-CN"><body>{children}</body></html>;
}
