export const dynamic = "force-dynamic";
import Link from "next/link";
import { Logo } from "@/components/header";
import { Theme } from "@/components/theme";
import { requireUser } from "@/lib/auth";
import { logout } from "@/app/actions";
export default async function Layout({ children }: {
    children: React.ReactNode;
}) { const user = await requireUser(); return <div className="workspace"><aside className="sidebar"><Logo /><nav aria-label="Business workspace">{[["Overview", ""], ["My Businesses", "businesses"], ["Startup Checklist", "checklist"], ["Formation Center", "formation"], ["Compare Services", "comparisons"], ["Business Credit", "credit"], ["Business Finances", "finances"], ["Documents", "documents"], ["Tasks & Milestones", "tasks"], ["Notifications", "notifications"], ["Settings", "settings"]].map(([n, p]) => <Link key={n} href={`/dashboard/${p}`}>{n}</Link>)}</nav></aside><div className="workspace-main"><div className="workspace-top"><small className="muted">YOUR BUSINESS WORKSPACE · {user.email}</small><div className="cta-row"><Theme /><form action={logout}><button className="button small secondary">Log out</button></form></div></div><main id="main">{children}</main></div></div>; }
