import { InstallApp } from "@/components/install-app";
import type { Viewport } from "next";
export const viewport: Viewport = { themeColor: "#064E3B" };
import type { Metadata } from "next";
import "./globals.css";
export const metadata: Metadata = { manifest: "/manifest.webmanifest", appleWebApp: { capable: true, title: "Build A Biz", statusBarStyle: "default" }, icons: { icon: "/icons/192", apple: "/icons/180" }, metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://gobuildabiz.com"), title: { default: "Build A Biz — Start Smart. Build Confidently.", template: "%s | Build A Biz" }, description: "Turn your business idea into a clear next step. Plan your launch, compare services, and build with confidence." };
export default function Layout({ children }: {
    children: React.ReactNode;
}) { return <html lang="en" suppressHydrationWarning><body><script dangerouslySetInnerHTML={{ __html: `try{document.documentElement.dataset.theme=localStorage.getItem('bab-theme')||(matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light')}catch{}` }}/><a className="skip" href="#main">Skip to content</a>{children}<InstallApp /></body></html>; }
