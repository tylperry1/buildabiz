import type { Metadata } from "next";
import "./globals.css";
export const metadata: Metadata = { metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://gobuildabiz.com"), title: { default: "Build A Biz — Start Smart. Build Confidently.", template: "%s | Build A Biz" }, description: "Turn your business idea into a clear next step. Plan your launch, compare services, and build with confidence." };
export default function Layout({ children }: {
    children: React.ReactNode;
}) { return <html lang="en" suppressHydrationWarning><body><script dangerouslySetInnerHTML={{ __html: `try{document.documentElement.dataset.theme=localStorage.getItem('bab-theme')||(matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light')}catch{}` }}/><a className="skip" href="#main">Skip to content</a>{children}</body></html>; }
