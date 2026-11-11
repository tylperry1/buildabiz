import {test} from "node:test";import assert from "node:assert/strict";import {readFileSync,readdirSync} from "node:fs";
const folder=new URL("../supabase/migrations/",import.meta.url);
const sql=readdirSync(folder).filter(f=>f.endsWith(".sql")).sort().map(f=>readFileSync(new URL(f,folder),"utf8")).join("\n");
test("every application table enables RLS (static migration contract)",()=>{const tables=[...sql.matchAll(/create table public\.(\w+)/g)].map(m=>m[1]);assert(tables.length>=25);for(const t of tables)assert(sql.includes(`alter table public.${t} enable row level security`),t);});
test("role mutation and membership mutation are not granted to users",()=>{assert.match(sql,/revoke insert,update,delete on public.user_roles,public.business_members/);assert.match(sql,/role in \('admin','super_admin'\)/);});
test("business authorization uses ownership and membership helpers",()=>{assert.match(sql,/owner_id=auth.uid\(\)/);assert.match(sql,/role='editor'/);assert.match(sql,/with check\(public.can_write_business\(business_id\)\)/);});
test("audit events are database-generated and clicks cannot claim commissions",()=>{assert.match(sql,/security definer set search_path=''/);assert.match(sql,/create trigger providers_audit/);assert.match(sql,/reported_conversion','verified_commission/);assert.match(sql,/insert into public.affiliate_clicks/);});

test("credentials are ciphertext-only and subscription writes are restricted",()=>{assert.match(sql,/ciphertext text not null/);assert.match(sql,/revoke insert,update,delete on public.subscription_entitlements/);assert.match(sql,/grant update\(read_at\) on public.notifications/);});
test("atomic workspace RPC is caller-authorized and uses stable task uniqueness",()=>{assert.match(sql,/save_business_workspace/);assert.match(sql,/security invoker/);assert.match(sql,/b.owner_id=auth.uid\(\)/);assert.match(sql,/on conflict on constraint checklist_task_business_title do nothing/);});
