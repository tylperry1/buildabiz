import {SubmitButton} from "@/components/submit-button";
import Link from "next/link";
import { Header, Footer } from "@/components/header";
import { authenticate } from "@/app/actions";
import { configured } from "@/lib/supabase/server";
export const metadata = { title: "Welcome back." };
export default async function Page({ searchParams }: {
    searchParams: Promise<{
        message?: string;
    }>;
}) { const { message } = await searchParams; return <><Header /><main id="main" className="container auth-container"><h1>Welcome back.</h1><p className="muted">Start Smart. Build Confidently.</p>{message && <p className="notice" role="status">{message}</p>}{!configured() && <div className="notice">Account access is awaiting Supabase configuration. Your information will not be submitted until connected.</div>}<form action={authenticate} className="form"><input type="hidden" name="mode" value="login"/><label>Email address<input type="email" name="email" required autoComplete="email" maxLength={254}/></label><label>Password<input type="password" name="password" required minLength={12} maxLength={128} autoComplete="current-password"/><small className="muted">At least 12 characters.</small></label><SubmitButton className="button" disabled={!configured()}>Log in</SubmitButton></form><p className="fine-print"><Link href="/forgot-password">Forgot password?</Link> · <Link href="/signup">Create an account</Link></p></main><Footer /></>; }
