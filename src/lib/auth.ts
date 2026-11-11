import "server-only";
import { cache } from "react";
import { redirect } from "next/navigation";
import { currentUser, db } from "./supabase/server";
export const requireUser = cache(async function requireUser() { const user = await currentUser(); if (!user)
    redirect("/login"); return user; });
export async function requireAdmin() { const user = await requireUser(); const roles = await db(`user_roles?user_id=eq.${user.id}&select=role`) as {
    role: string;
}[]; if (!roles.some(r => ["admin", "super_admin"].includes(r.role)))
    redirect("/dashboard?message=Admin+access+required"); return user; }
