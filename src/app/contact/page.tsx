import {SubmitButton} from "@/components/submit-button";
import { Header, Footer } from "@/components/header";
import { contact } from "@/app/actions";
import { configured } from "@/lib/supabase/server";
export const metadata = { title: "Contact Build A Biz" };
export default async function Contact({ searchParams }: {
    searchParams: Promise<{
        message?: string;
    }>;
}) { const { message } = await searchParams; return <><Header /><main id="main" className="container section"><div className="page-heading"><div className="eyebrow">LET’S KEEP THINGS CLEAR</div><h1>Get in touch.</h1><p>Send a question or feedback. Avoid including passwords, tax IDs, or sensitive financial information.</p></div>{message && <p className="notice" role="status">{message}</p>}{!configured() && <p className="notice">The contact inbox is awaiting database configuration. Submissions are currently unavailable.</p>}<form action={contact} className="form panel" style={{ maxWidth: 650 }}><label>Your name<input name="name" required maxLength={120} autoComplete="name"/></label><label>Email<input name="email" type="email" required maxLength={254} autoComplete="email"/></label><label>How can we help?<textarea name="message" required minLength={10} maxLength={5000}/></label><SubmitButton className="button" disabled={!configured()}>Send message</SubmitButton></form></main><Footer /></>; }
