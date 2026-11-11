"use server";
import {featureEnabled} from "@/lib/feature-flags";
import {adminSchemas,isResource} from "@/lib/admin-resources";
import {encryptCredential,decryptCredential} from "@/lib/credentials.mjs";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db, supabase, session, configured } from "@/lib/supabase/server";
import { requireUser, requireAdmin } from "@/lib/auth";
import { checklistFor } from "@/lib/core.mjs";
const text = (f: FormData, k: string) => String(f.get(k) || "").trim();
const uuid = z.string().uuid();
export async function authenticate(form: FormData) {
    const mode = text(form, "mode");
    const email = z.email().safeParse(text(form, "email"));
    const password = String(form.get("password")||"");
    const route = mode === "signup" ? "/signup" : mode === "reset" ? "/forgot-password" : "/login";
    if(mode==="signup"&&!await featureEnabled("signups_enabled",true))redirect("/signup?message=Registration+is+temporarily+paused");
    if (!configured())
        redirect(`${route}?message=Authentication+requires+Supabase+configuration`);
    if (!email.success || ((mode === "signup" && password.length < 12) || (mode === "login" && !password.length) || password.length > 128))
        redirect(`${route}?message=Use+a+valid+email+and+a+password+of+at+least+12+characters`);
    let message = "";
    let destination = "/dashboard";
    try {
        const limit = await supabase("/rest/v1/rpc/check_auth_rate", { method: "POST", body: JSON.stringify({ identity: email.data.toLowerCase() }) });
        if (!limit) {
            message = "Please wait before trying again";
        }
        else if (mode === "reset") {
            await supabase("/auth/v1/recover", { method: "POST", body: JSON.stringify({ email: email.data }) });
            message = "If an account exists, a reset email will arrive shortly";
        }
        else {
            const data = await supabase(mode === "signup" ? "/auth/v1/signup" : "/auth/v1/token?grant_type=password", { method: "POST", body: JSON.stringify({ email: email.data, password }) });
            if (data.access_token)
                await session(data);
            else {
                message = "Check your email to verify your account";
                destination = "/login";
            }
        }
    }
    catch {
        message = "Unable to complete this request. Check your details or try again later.";
    }
    if (message)
        redirect(`${mode === "signup" && destination === "/login" ? destination : route}?message=${encodeURIComponent(message)}`);
    redirect(destination);
}
export async function logout() { const token = (await cookies()).get("bab-access")?.value; try {
    if (token)
        await supabase("/auth/v1/logout", { method: "POST" }, token);
}
catch { } const jar = await cookies(); jar.delete("bab-access"); jar.delete("bab-refresh"); redirect("/login"); }
export async function updatePassword(form: FormData) { await requireUser(); const password = z.string().min(12).max(128).parse(String(form.get("password")||"")); const token = (await cookies()).get("bab-access")?.value; let failed = false; try {
    await supabase("/auth/v1/user", { method: "PUT", body: JSON.stringify({ password }) }, token);
}
catch {
    failed = true;
} redirect(`/dashboard/settings?message=${failed ? "Password+update+failed" : "Password+updated"}`); }
const businessSchema = z.object({ name: z.string().min(1).max(150), state: z.string().min(2).max(60), business_type: z.string().min(1).max(100), structure: z.enum(["Undecided", "Sole proprietor", "LLC", "Corporation", "Partnership", "Nonprofit"]), industry: z.string().max(120), formation_status: z.enum(["Idea", "In progress", "Registered"]), budget: z.string().max(80), website: z.string().max(250), goals: z.string().max(2000) });
export async function saveBusiness(form: FormData) {
  await requireUser();
  const parsed = businessSchema.safeParse(Object.fromEntries(form));
  if (!parsed.success) redirect("/dashboard/businesses/new?message=Please+complete+the+required+business+fields");
  const step = Math.min(3, Math.max(1, Number(text(form,"wizard_step")) || 1));
  const action = text(form,"wizard_action");
  const finished = action === "finish";
  const id = text(form,"id");
  let businessId: string;
  try {
    if(id) uuid.parse(id);
    businessId = await db("rpc/save_business_workspace",{method:"POST",body:JSON.stringify({business_id:id||null,details:parsed.data,wizard_step:action==="next"?Math.min(3,step+1):step,finished,task_titles:finished?checklistFor(parsed.data):[]})});
  } catch { redirect("/dashboard/businesses?message=Unable+to+save+business.+No+partial+changes+were+saved"); }
  revalidatePath("/dashboard");
  if(!finished) redirect(action==="next"?`/dashboard/businesses/${businessId}?step=${Math.min(3,step+1)}`:"/dashboard/businesses?message=Progress+saved");
  redirect("/dashboard/checklist?message=Business+and+checklist+saved");
}
export async function selectBusiness(form: FormData) { const user = await requireUser(); const id = uuid.parse(text(form, "business_id")); await db(`profiles?id=eq.${user.id}`, { method: "PATCH", body: JSON.stringify({ active_business_id: id }) }); revalidatePath("/dashboard"); }
export async function toggleTask(form: FormData) { await requireUser(); const id = uuid.parse(text(form, "id")); await db(`checklist_tasks?id=eq.${id}`, { method: "PATCH", body: JSON.stringify({ completed: text(form, "completed") === "true" }) }); revalidatePath("/dashboard"); }
export async function saveProfile(form: FormData) { const user = await requireUser(); const full_name = z.string().min(1).max(120).parse(text(form, "full_name")); await db(`profiles?id=eq.${user.id}`, { method: "PATCH", body: JSON.stringify({ full_name }) }); revalidatePath("/dashboard/settings"); redirect("/dashboard/settings?message=Profile+saved"); }
export async function addMilestone(form: FormData) { await requireUser(); const business_id = uuid.parse(text(form, "business_id")); const title = z.string().min(1).max(200).parse(text(form, "title")); await db("milestones", { method: "POST", body: JSON.stringify({ business_id, title, due_date: z.union([z.iso.date(),z.literal("")]).parse(text(form,"due_date")) || null }) }); revalidatePath("/dashboard/tasks"); }
export async function saveComparison(form: FormData) { const user = await requireUser(); const ids = z.array(uuid).min(1).max(4).safeParse([...new Set(form.getAll("plan_ids"))]); if (!ids.success)
    redirect("/compare?message=Select+between+one+and+four+plans"); await db("saved_comparisons", { method: "POST", body: JSON.stringify({ user_id: user.id, name: "Saved comparison", plan_ids: ids.data }) }); redirect("/dashboard/comparisons"); }
const schemas=adminSchemas;
export async function adminWrite(form: FormData) { await requireAdmin(); const table = text(form, "table") as keyof typeof schemas; if (!isResource(table))
    throw new Error("Unsupported resource"); const id = text(form, "id"); if (id) uuid.parse(id);
if(id&&["referral_events","notifications"].includes(table))throw new Error("This record is append-only"); const remove = text(form, "operation") === "delete"; let failed = false; try {
    if (remove) {
        if (!id || table === "referral_events" || table === "notifications") throw new Error("This record is append-only");
        await db(`${table}?id=eq.${id}`, { method: "DELETE" });
    }
    else {
        const values: Record<string, unknown> = Object.fromEntries(form);
        for (const key of ["enabled", "published"])
            values[key] = form.get(key) === "on";
        if (table === "plan_prices") values.verified_at = new Date().toISOString();
        const parsed = schemas[table].parse(values);
        const payload = table === "integration_registry" ? {...parsed, connection_status:values.enabled?"Not Configured":"Disabled",last_success_at:null,last_error:null} : parsed;
        await db(`${table}${id ? `?id=eq.${id}` : ""}`, { method: id ? "PATCH" : "POST", body: JSON.stringify(payload) });
    }
}
catch {
    failed = true;
} revalidatePath("/admin", "layout"); redirect(`/admin/${table==="platform_settings"?"settings":table}?message=${failed ? "Unable+to+save.+Check+values+and+references" : "Changes+saved"}`); }
export async function contact(form: FormData) { const data = z.object({ name: z.string().min(1).max(120), email: z.email().max(254), message: z.string().min(10).max(5000) }).safeParse(Object.fromEntries(form)); let ok = false; if (data.success && configured()) {
    try {
        ok = await supabase("/rest/v1/rpc/submit_contact", { method: "POST", body: JSON.stringify({ sender_name: data.data.name, sender_email: data.data.email, body: data.data.message }) });
    }
    catch { }
} redirect(`/contact?message=${ok ? "Message+received.+Thank+you" : "Unable+to+submit.+Check+the+fields+or+try+again+later"}`); }

export async function workspaceWrite(form:FormData){
  const user=await requireUser();
  const kind=z.enum(["milestone","notification","comparison","business"]).parse(text(form,"kind"));
  const id=uuid.parse(text(form,"id"));
  const operation=text(form,"operation");
  const table={milestone:"milestones",notification:"notifications",comparison:"saved_comparisons",business:"businesses"}[kind];
  try{
    if(operation==="delete"&&kind!=="notification"){
      await db(`${table}?id=eq.${id}${kind==="business"?`&owner_id=eq.${user.id}`:""}`,{method:"DELETE"});
    }else if(kind==="milestone"){
      const payload=operation==="toggle"?{completed:text(form,"completed")==="true"}:{title:z.string().min(1).max(200).parse(text(form,"title")),due_date:z.union([z.iso.date(),z.literal("")]).parse(text(form,"due_date"))||null};
      await db(`${table}?id=eq.${id}`,{method:"PATCH",body:JSON.stringify(payload)});
    }else if(kind==="notification"){
      await db(`${table}?id=eq.${id}&user_id=eq.${user.id}`,{method:"PATCH",body:JSON.stringify({read_at:new Date().toISOString()})});
    }else if(kind==="comparison"){
      await db(`${table}?id=eq.${id}&user_id=eq.${user.id}`,{method:"PATCH",body:JSON.stringify({name:z.string().min(1).max(150).parse(text(form,"name"))})});
    }else throw new Error("Unsupported operation");
  }catch{redirect(`/dashboard/${kind==="milestone"?"tasks":kind==="notification"?"notifications":kind==="business"?"businesses":"comparisons"}?message=Unable+to+save+changes`);}
  revalidatePath("/dashboard","layout");
  if(operation==="delete"&&kind==="comparison")redirect("/dashboard/comparisons?message=Comparison+removed");
  if(operation==="delete"&&kind==="business")redirect("/dashboard/businesses?message=Business+removed");
}

export async function integrationAction(form:FormData){
 await requireAdmin();const id=uuid.parse(text(form,"id"));const operation=text(form,"operation");let message="Integration updated";
 try{
  const integration=(await db(`integration_registry?id=eq.${id}`))[0];if(!integration)throw new Error("Missing integration");
  if(operation==="credential"){
   const secret=z.string().min(8).max(4000).parse(String(form.get("credential")||""));
   const sealed=encryptCredential(secret,process.env.INTEGRATION_ENCRYPTION_KEY,id);
   await db("integration_credentials?on_conflict=integration_id",{method:"POST",headers:{Prefer:"resolution=merge-duplicates"},body:JSON.stringify({integration_id:id,...sealed})});
   await db(`integration_registry?id=eq.${id}`,{method:"PATCH",body:JSON.stringify({connection_status:"Not Configured",last_error:null})});message="Credential saved securely. Test the connection before enabling it.";
  }else if(operation==="probe"){
   if(!integration.enabled)throw new Error("Enable the integration first");
   let response:Response;
   if(integration.adapter==="supabase"){
    const url=process.env.NEXT_PUBLIC_SUPABASE_URL,key=process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;if(!url||!key)throw new Error("Supabase environment variables are missing");response=await fetch(`${url}/auth/v1/settings`,{headers:{apikey:key},cache:"no-store",signal:AbortSignal.timeout(12000)});
   }else{
    if(!["stripe","resend"].includes(integration.adapter))throw new Error("This provider has no connection adapter yet");
    const record=(await db(`integration_credentials?integration_id=eq.${id}`))[0];if(!record)throw new Error("No credential is saved");
    const secret=decryptCredential(record,process.env.INTEGRATION_ENCRYPTION_KEY,id);
    response=await fetch(integration.adapter==="stripe"?"https://api.stripe.com/v1/account":"https://api.resend.com/domains",{headers:{Authorization:`Bearer ${secret}`},cache:"no-store",signal:AbortSignal.timeout(12000)});
   }
   if(!response.ok)throw new Error(`Provider returned HTTP ${response.status}`);
   await db(`integration_registry?id=eq.${id}`,{method:"PATCH",body:JSON.stringify({connection_status:"Connected",last_success_at:new Date().toISOString(),last_error:null})});message="Connection verified successfully";
  }else throw new Error("Unsupported integration action");
 }catch(error){message=operation==="credential"?"Unable to save credential. Check server encryption configuration.":"Connection not verified. Check the saved key and provider configuration.";if(operation==="probe"){await db(`integration_registry?id=eq.${id}`,{method:"PATCH",body:JSON.stringify({connection_status:"Error",last_error:error instanceof Error&&/^Provider returned HTTP/.test(error.message)?error.message:"Connection could not be verified"})}).catch(()=>{});}}
 revalidatePath("/admin","layout");redirect(`/admin/integration_registry?message=${encodeURIComponent(message)}`);
}
