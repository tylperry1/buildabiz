import {SubmitButton} from "@/components/submit-button";
import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/supabase/server";
import { requireUser } from "@/lib/auth";
import { BusinessForm, type Business } from "@/components/business-form";
import { toggleTask, saveProfile, updatePassword, addMilestone } from "@/app/actions";
export default async function Page({ params, searchParams }: {
    params: Promise<{
        section: string[];
    }>;
    searchParams: Promise<{
        message?: string; step?: string;
    }>;
}) {
    const { section } = await params;
    const { message, step: requestedStep } = await searchParams;
    const user = await requireUser();
    const businesses: Business[] = await db("businesses?select=*&order=created_at");
    const profile = (await db(`profiles?id=eq.${user.id}`))[0];
    const active = businesses.find(b => b.id === profile?.active_business_id) || businesses[0];
    const tab = section[0];
    let content;
    if (tab === "businesses") {
        if (section[1] === "new")
            content = <BusinessForm />;
        else if (section[1]) {
            const business = businesses.find(b => b.id === section[1]);
            if (!business)
                notFound();
            const wizard = (await db(`startup_wizard_sessions?business_id=eq.${business.id}`))[0];
            content = <BusinessForm business={business} step={Math.min(3, Math.max(1, Number(requestedStep) || wizard?.current_step || 1))}/>;
        }
        else
            content = <><Link className="button" href="/dashboard/businesses/new">Create a business</Link><div className="stack" style={{ marginTop: 24 }}>{businesses.map(b => <Link href={`/dashboard/businesses/${b.id}`} className="panel" key={b.id}><h3>{b.name}</h3><span className="badge">{b.formation_status}</span><p>{b.state} · {b.structure}</p><span className="text-link">Edit business →</span></Link>)}</div></>;
    }
    else if (tab === "checklist") {
        const tasks = active ? await db(`checklist_tasks?business_id=eq.${active.id}&order=position`) : [];
        content = <div className="panel"><p className="muted">{active?.name || "Create a business to get your checklist."}</p>{tasks.map((t: {
            id: string;
            title: string;
            completed: boolean;
        }) => <form action={toggleTask} className="task-row" key={t.id}><input type="hidden" name="id" value={t.id}/><input type="hidden" name="completed" value={String(!t.completed)}/><span>{t.completed ? "✓ " : ""}{t.title}</span><SubmitButton className="button small secondary">{t.completed ? "Mark incomplete" : "Complete"}</SubmitButton></form>)}</div>;
    }
    else if (tab === "settings")
        content = <><form action={saveProfile} className="panel form"><label>Full name<input name="full_name" defaultValue={profile?.full_name} required maxLength={120}/></label><p className="muted">Email: {user.email}</p><SubmitButton className="button">Save profile</SubmitButton></form><form action={updatePassword} className="panel form"><label>New password<input type="password" name="password" minLength={12} maxLength={128} required autoComplete="new-password"/></label><SubmitButton className="button">Update password</SubmitButton></form></>;
    else if (tab === "tasks") {
        const milestones = active ? await db(`milestones?business_id=eq.${active.id}&order=due_date`) : [];
        content = <>{active && <form className="panel form" action={addMilestone}><input type="hidden" name="business_id" value={active.id}/><label>Milestone<input name="title" required maxLength={200}/></label><label>Target date<input type="date" name="due_date"/></label><SubmitButton className="button">Save milestone</SubmitButton></form>}{milestones.map((m: {
            id: string;
            title: string;
            due_date: string;
        }) => <div className="panel" key={m.id}>{m.title}<p className="muted">{m.due_date || "No target date"}</p></div>)}</>;
    }
    else if (tab === "notifications" || tab === "comparisons") {
        const rows = await db(tab === "notifications" ? `notifications?user_id=eq.${user.id}&order=created_at.desc` : `saved_comparisons?user_id=eq.${user.id}&order=created_at.desc`);
        content = rows.length ? rows.map((r: {
            id: string;
            title?: string;
            name?: string;
            plan_ids?: string[];
        }) => <div className="panel" key={r.id}><h3>{r.title || r.name}</h3>{r.plan_ids && <p className="muted">{r.plan_ids.length} saved plans</p>}</div>) : <div className="empty">{tab === "notifications" ? "You’re all caught up." : <><p>No comparisons saved yet.</p><Link className="button" href="/compare">Find services</Link></>}</div>;
    }
    else if (tab === "formation" || tab === "credit")
        content = <div className="panel"><p>Explore practical guidance for your next step.</p><Link className="button" href={tab === "formation" ? "/formation" : "/business-credit"}>Open learning center</Link></div>;
    else if (["finances", "documents"].includes(tab))
        content = <div className="empty"><span className="badge">Planned</span><h2>Room to grow.</h2><p>This module is on the roadmap. It is not available yet.</p></div>;
    else
        notFound();
    return <><div className="page-heading"><h1>{({ businesses: "My businesses", checklist: "Startup checklist", settings: "Account settings", tasks: "Tasks & milestones", notifications: "Notifications", comparisons: "Saved comparisons", formation: "Formation center", credit: "Business credit", finances: "Business finances", documents: "Documents" } as Record<string, string>)[tab]}</h1></div>{message && <div className="notice" role="status">{message}</div>}{content}</>;
}
