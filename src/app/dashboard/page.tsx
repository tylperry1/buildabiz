import {SubmitButton} from "@/components/submit-button";
import Link from "next/link";
import { db } from "@/lib/supabase/server";
import { requireUser } from "@/lib/auth";
import { selectBusiness } from "@/app/actions";
import type { Business } from "@/components/business-form";
export default async function Dashboard() { const user = await requireUser(); const [businesses, profiles, saved] = await Promise.all([db("businesses?select=*&order=created_at.desc"), db(`profiles?id=eq.${user.id}`), db(`saved_comparisons?user_id=eq.${user.id}&select=id`)]); const active = businesses.find((b: Business) => b.id === profiles[0]?.active_business_id) || businesses[0]; const tasks = active ? await db(`checklist_tasks?business_id=eq.${active.id}&order=position`) : []; const done = tasks.filter((t: {
    completed: boolean;
}) => t.completed).length; return <><div className="page-heading"><div className="eyebrow">ONE STEP AT A TIME</div><h1>Welcome{profiles[0]?.full_name ? `, ${profiles[0].full_name}` : ""}.</h1><p>Your idea, your pace. Here’s where things stand.</p></div>{active ? <><form action={selectBusiness} className="panel cta-row"><label htmlFor="active">Active business</label><select id="active" name="business_id" defaultValue={active.id}>{businesses.map((b: Business) => <option value={b.id} key={b.id}>{b.name}</option>)}</select><SubmitButton className="button small">Switch business</SubmitButton></form><div className="stats"><div className="panel"><span>Startup progress</span><strong>{tasks.length ? Math.round(done / tasks.length * 100) : 0}%</strong><span>{done} of {tasks.length} steps complete</span></div><div className="panel"><span>Formation status</span><strong style={{ fontSize: 22 }}>{active.formation_status}</strong><span>Recorded by you</span></div><div className="panel"><span>Saved comparisons</span><strong>{saved.length}</strong><Link href="/dashboard/comparisons" className="text-link">Review saved options</Link></div></div><section className="panel"><h2>Recommended next steps</h2>{tasks.filter((t: {
    completed: boolean;
}) => !t.completed).slice(0, 3).map((t: {
    id: string;
    title: string;
}) => <p key={t.id}>{t.title}</p>)}<Link href="/dashboard/checklist" className="button">Continue your checklist</Link></section></> : <section className="empty"><h2>Start with your big idea.</h2><p>Create your first business to get a personal startup checklist.</p><Link href="/dashboard/businesses/new" className="button">Create your business profile</Link></section>}<div className="cta-row"><Link className="button secondary" href="/dashboard/businesses/new">Add a business</Link><Link className="button secondary" href="/compare">Compare services</Link></div></>; }
