import { NextRequest, NextResponse } from "next/server";
import { supabase, session } from "@/lib/supabase/server";
export async function GET(request: NextRequest) { const hash = request.nextUrl.searchParams.get("token_hash"); const type = request.nextUrl.searchParams.get("type"); if (!hash || !["signup", "recovery", "email"].includes(type || ""))
    return NextResponse.redirect(new URL("/login?message=Invalid+verification+link", request.url)); try {
    const data = await supabase("/auth/v1/verify", { method: "POST", body: JSON.stringify({ token_hash: hash, type }) });
    await session(data);
    return NextResponse.redirect(new URL(type === "recovery" ? "/dashboard/settings?message=Set+your+new+password" : "/dashboard", request.url));
}
catch {
    return NextResponse.redirect(new URL("/login?message=Verification+link+expired+or+invalid", request.url));
} }
