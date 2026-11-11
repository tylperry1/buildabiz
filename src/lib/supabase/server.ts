import {decodeResponse} from "@/lib/http.mjs";
import "server-only";
import { cookies } from "next/headers";
export function configured() { return Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY); }
export function config() { const url = process.env.NEXT_PUBLIC_SUPABASE_URL; const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY; if (!url || !key)
    throw new Error("Supabase is not configured"); return { url, key }; }
export async function supabase(path: string, init: RequestInit = {}, token?: string) { const { url, key } = config(); const response = await fetch(`${url}${path}`, { ...init, cache: "no-store", signal: AbortSignal.timeout(12000), headers: { apikey: key, Authorization: `Bearer ${token || key}`, "Content-Type": "application/json", ...init.headers } }); return decodeResponse(response); }
export async function currentUser() { if (!configured())
    return null; const jar = await cookies(); const token = jar.get("bab-access")?.value; if (!token)
    return null; try {
    return await supabase("/auth/v1/user", {}, token) as {
        id: string;
        email: string;
    };
}
catch {
    return null;
} }
export async function db(path: string, init: RequestInit = {}) { const jar = await cookies(); const token = jar.get("bab-access")?.value; if (!token)
    throw new Error("Authentication required"); return supabase(`/rest/v1/${path}`, init, token); }
export async function session(data: {
    access_token: string;
    refresh_token: string;
    expires_in: number;
}) { const jar = await cookies(); const opts = { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax" as const, path: "/" }; jar.set("bab-access", data.access_token, { ...opts, maxAge: data.expires_in }); jar.set("bab-refresh", data.refresh_token, { ...opts, maxAge: 60 * 60 * 24 * 30 }); }
