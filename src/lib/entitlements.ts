import "server-only";
import {db} from "./supabase/server";
import {entitlements} from "./core.mjs";
export async function capabilities(userId:string){const rows=await db(`subscription_entitlements?user_id=eq.${userId}&select=tier,status`);const row=rows[0];const tier: keyof typeof entitlements=row&&["active","trial"].includes(row.status)&&["pro","plus"].includes(row.tier)?row.tier:"free";return {tier,features:entitlements[tier]};}
