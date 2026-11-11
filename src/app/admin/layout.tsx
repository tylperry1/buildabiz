export const dynamic = "force-dynamic";
import Link from "next/link";
import { Logo } from "@/components/header";
import { requireAdmin } from "@/lib/auth";
export default async function Layout({ children }: {
    children: React.ReactNode;
}) { await requireAdmin(); return <div className="workspace"><aside className="sidebar"><Logo /><p className="badge">ADMINISTRATION</p><nav aria-label="Administration">{[["Overview", ""], ["Users", "users"], ["Businesses", "businesses"], ["Service Providers", "providers"], ["Marketplace Categories", "marketplace_categories"], ["Products", "provider_products"], ["Plans", "provider_plans"], ["Pricing", "plan_prices"], ["Plan Features", "plan_features"], ["Offers", "offers"], ["Price History", "price_verification_history"], ["Affiliate Links", "affiliate_links"], ["Affiliate Programs", "affiliate_programs"], ["Referral Reports", "referral_events"], ["Content Management", "content_pages"], ["API Center", "integration_registry"], ["Subscriptions", "subscriptions"], ["Analytics", "analytics"], ["Contact inbox", "contact_requests"], ["Notifications", "notifications"], ["Feature Flags", "feature_flags"], ["System Logs", "audit_logs"], ["Settings", "settings"]].map(([n, p]) => <Link href={`/admin/${p}`} key={n}>{n}</Link>)}</nav></aside><main id="main" className="workspace-main">{children}</main></div>; }
