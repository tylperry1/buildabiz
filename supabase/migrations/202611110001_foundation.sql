-- Build A Biz foundation. Apply with Supabase migrations, never from application startup.
create extension if not exists pgcrypto;
create type public.app_role as enum ('user','admin','super_admin');
create table public.profiles(id uuid primary key references auth.users(id) on delete cascade, full_name text not null default '', active_business_id uuid, created_at timestamptz not null default now(), updated_at timestamptz not null default now());
create table public.user_roles(id uuid primary key default gen_random_uuid(),user_id uuid not null references auth.users(id) on delete cascade,role public.app_role not null default 'user',created_at timestamptz not null default now(),unique(user_id,role));
create function public.is_admin() returns boolean language sql stable security definer set search_path='' as $$ select exists(select 1 from public.user_roles where user_id=auth.uid() and role in ('admin','super_admin')) $$;
create table public.businesses(id uuid primary key default gen_random_uuid(),owner_id uuid not null default auth.uid() references auth.users(id),name text not null check(length(name) between 1 and 150),state text not null default '',business_type text not null default '',structure text not null default 'Undecided',industry text not null default '',formation_status text not null default 'Idea' check(formation_status in ('Idea','In progress','Registered')),budget text not null default '',website text not null default '',goals text not null default '',created_at timestamptz not null default now(),updated_at timestamptz not null default now());
alter table public.profiles add foreign key(active_business_id) references public.businesses(id) on delete set null;
create table public.business_members(id uuid primary key default gen_random_uuid(),business_id uuid not null references public.businesses(id) on delete cascade,user_id uuid not null references auth.users(id) on delete cascade,role text not null check(role in ('owner','editor','viewer')),created_at timestamptz not null default now(),unique(business_id,user_id));
create function public.owns_business(bid uuid) returns boolean language sql stable security definer set search_path='' as $$ select exists(select 1 from public.businesses where id=bid and owner_id=auth.uid()) $$;
create function public.can_read_business(bid uuid) returns boolean language sql stable security definer set search_path='' as $$ select public.owns_business(bid) or exists(select 1 from public.business_members where business_id=bid and user_id=auth.uid()) $$;
create function public.can_write_business(bid uuid) returns boolean language sql stable security definer set search_path='' as $$ select public.owns_business(bid) or exists(select 1 from public.business_members where business_id=bid and user_id=auth.uid() and role='editor') $$;
create table public.startup_wizard_sessions(id uuid primary key default gen_random_uuid(), business_id uuid not null references public.businesses(id) on delete cascade, responses jsonb not null default '{}', current_step integer not null default 1 check(current_step between 1 and 9), completed boolean not null default false, unique(business_id), created_at timestamptz not null default now(), updated_at timestamptz not null default now());
create table public.startup_checklists(id uuid primary key default gen_random_uuid(), business_id uuid not null references public.businesses(id) on delete cascade, title text not null default 'Your launch plan', unique(business_id), created_at timestamptz not null default now(), updated_at timestamptz not null default now());
create table public.checklist_tasks(id uuid primary key default gen_random_uuid(), business_id uuid not null references public.businesses(id) on delete cascade, title text not null, completed boolean not null default false, position integer not null default 0, created_at timestamptz not null default now(), updated_at timestamptz not null default now());
create table public.milestones(id uuid primary key default gen_random_uuid(), business_id uuid not null references public.businesses(id) on delete cascade, title text not null, due_date date, completed boolean not null default false, created_at timestamptz not null default now(), updated_at timestamptz not null default now());
create table public.marketplace_categories(id uuid primary key default gen_random_uuid(),name text not null, slug text not null unique check(slug ~ '^[a-z0-9-]+$'), description text not null default '',created_at timestamptz not null default now(),updated_at timestamptz not null default now());
create table public.providers(id uuid primary key default gen_random_uuid(),name text not null, slug text not null unique check(slug ~ '^[a-z0-9-]+$'), website text not null check(website ~ '^https://'), approved_host text not null check(approved_host !~ '[/@: ]'), description text not null default '', enabled boolean not null default false,created_at timestamptz not null default now(),updated_at timestamptz not null default now());
create table public.provider_products(id uuid primary key default gen_random_uuid(),provider_id uuid not null references public.providers(id) on delete cascade, category_id uuid not null references public.marketplace_categories(id), name text not null,created_at timestamptz not null default now(),updated_at timestamptz not null default now());
create table public.provider_plans(id uuid primary key default gen_random_uuid(),product_id uuid not null references public.provider_products(id) on delete cascade, name text not null, description text not null default '',created_at timestamptz not null default now(),updated_at timestamptz not null default now());
create table public.plan_prices(id uuid primary key default gen_random_uuid(),plan_id uuid not null references public.provider_plans(id) on delete cascade, amount_cents integer not null check(amount_cents>=0), renewal_cents integer check(renewal_cents>=0), billing_months integer not null check(billing_months between 1 and 36), setup_cents integer not null default 0 check(setup_cents>=0), required_cents integer not null default 0 check(required_cents>=0), currency text not null default 'USD' check(currency ~ '^[A-Z]{3}$'), verified_at timestamptz not null, source_url text not null check(source_url ~ '^https://'),created_at timestamptz not null default now(),updated_at timestamptz not null default now());
create table public.plan_features(id uuid primary key default gen_random_uuid(),plan_id uuid not null references public.provider_plans(id) on delete cascade, name text not null, value text not null default '',created_at timestamptz not null default now(),updated_at timestamptz not null default now());
create table public.offers(id uuid primary key default gen_random_uuid(),plan_id uuid not null references public.provider_plans(id) on delete cascade,title text not null,terms text not null,ends_at timestamptz,created_at timestamptz not null default now(),updated_at timestamptz not null default now());
create table public.price_verification_history(id uuid primary key default gen_random_uuid(),price_id uuid not null references public.plan_prices(id) on delete cascade,verified_by uuid references auth.users(id),source_url text not null, snapshot jsonb not null,created_at timestamptz not null default now(),updated_at timestamptz not null default now());
create table public.affiliate_programs(id uuid primary key default gen_random_uuid(),provider_id uuid not null references public.providers(id) on delete cascade,name text not null,status text not null default 'Not Configured' check(status in ('Not Configured','Active','Disabled')),created_at timestamptz not null default now(),updated_at timestamptz not null default now());
create table public.affiliate_links(id uuid primary key default gen_random_uuid(),provider_id uuid not null references public.providers(id) on delete cascade, slug text not null unique check(slug ~ '^[a-z0-9-]+$'),destination text not null check(destination ~ '^https://'),campaign text not null default '',enabled boolean not null default false,created_at timestamptz not null default now(),updated_at timestamptz not null default now());
create table public.content_pages(id uuid primary key default gen_random_uuid(),slug text not null unique check(slug ~ '^[a-z0-9-]+$'),title text not null,body text not null default '',published boolean not null default false,created_at timestamptz not null default now(),updated_at timestamptz not null default now());
create table public.feature_flags(id uuid primary key default gen_random_uuid(),key text not null unique,description text not null default '',enabled boolean not null default false,created_at timestamptz not null default now(),updated_at timestamptz not null default now());
create table public.integration_registry(id uuid primary key default gen_random_uuid(),name text not null,integration_type text not null,connection_status text not null default 'Not Configured' check(connection_status in ('Not Configured','Connected','Error','Disabled')),requirements jsonb not null default '[]',last_success_at timestamptz,last_error text,enabled boolean not null default false,credential_secret_name text -- Reference to Supabase Vault only; never raw credentials
,created_at timestamptz not null default now(),updated_at timestamptz not null default now());
create table public.affiliate_clicks(id uuid primary key default gen_random_uuid(),link_id uuid not null references public.affiliate_links(id),campaign text not null default '',created_at timestamptz not null default now());
create table public.referral_events(id uuid primary key default gen_random_uuid(),link_id uuid not null references public.affiliate_links(id),event_type text not null check(event_type in ('reported_conversion','verified_commission')),amount_cents integer check(amount_cents>=0),external_reference text unique,created_at timestamptz not null default now());
create table public.saved_comparisons(id uuid primary key default gen_random_uuid(),user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,name text not null,plan_ids uuid[] not null check(cardinality(plan_ids) between 1 and 4),created_at timestamptz not null default now());
create table public.notifications(id uuid primary key default gen_random_uuid(),user_id uuid not null references auth.users(id) on delete cascade,title text not null,read_at timestamptz,created_at timestamptz not null default now());
create table public.audit_logs(id uuid primary key default gen_random_uuid(),actor_id uuid references auth.users(id),action text not null,table_name text not null,record_id uuid,created_at timestamptz not null default now());
create function public.touch_updated_at() returns trigger language plpgsql set search_path='' as $$ begin new.updated_at=now();return new;end $$;
create function public.audit_change() returns trigger language plpgsql security definer set search_path='' as $$ begin insert into public.audit_logs(actor_id,action,table_name,record_id) values(auth.uid(),TG_OP,TG_TABLE_NAME,coalesce(new.id,old.id)); return coalesce(new,old);end $$;
create function public.bootstrap_user() returns trigger language plpgsql security definer set search_path='' as $$ begin insert into public.profiles(id) values(new.id);insert into public.user_roles(user_id,role) values(new.id,'user');return new;end $$;
create trigger auth_user_created after insert on auth.users for each row execute function public.bootstrap_user();
create function public.business_created() returns trigger language plpgsql security definer set search_path='' as $$ begin insert into public.business_members(business_id,user_id,role) values(new.id,new.owner_id,'owner');return new;end $$;
create trigger business_membership after insert on public.businesses for each row execute function public.business_created();
alter table public.profiles enable row level security;
create policy profile_select on public.profiles for select to authenticated using(id=auth.uid() or public.is_admin());
create policy profile_update on public.profiles for update to authenticated using(id=auth.uid()) with check(id=auth.uid() and (active_business_id is null or public.can_read_business(active_business_id)));
alter table public.user_roles enable row level security;
create policy roles_read on public.user_roles for select to authenticated using(user_id=auth.uid() or public.is_admin());
-- No role mutation grants to authenticated users, including administrators. Bootstrap roles via trusted SQL only.
alter table public.businesses enable row level security;
create policy businesses_read on public.businesses for select to authenticated using(public.can_read_business(id) or public.is_admin());
create policy businesses_insert on public.businesses for insert to authenticated with check(owner_id=auth.uid());
create policy businesses_update on public.businesses for update to authenticated using(owner_id=auth.uid()) with check(owner_id=auth.uid());
create policy businesses_delete on public.businesses for delete to authenticated using(owner_id=auth.uid());
alter table public.business_members enable row level security;
create policy membership_read on public.business_members for select to authenticated using(public.can_read_business(business_id) or public.is_admin());
-- Team membership writes require a future trusted invitation flow.
alter table public.startup_wizard_sessions enable row level security;
create policy startup_wizard_sessions_read on public.startup_wizard_sessions for select to authenticated using(public.can_read_business(business_id));
create policy startup_wizard_sessions_write on public.startup_wizard_sessions for all to authenticated using(public.can_write_business(business_id)) with check(public.can_write_business(business_id));
create index on public.startup_wizard_sessions(business_id);
alter table public.startup_checklists enable row level security;
create policy startup_checklists_read on public.startup_checklists for select to authenticated using(public.can_read_business(business_id));
create policy startup_checklists_write on public.startup_checklists for all to authenticated using(public.can_write_business(business_id)) with check(public.can_write_business(business_id));
create index on public.startup_checklists(business_id);
alter table public.checklist_tasks enable row level security;
create policy checklist_tasks_read on public.checklist_tasks for select to authenticated using(public.can_read_business(business_id));
create policy checklist_tasks_write on public.checklist_tasks for all to authenticated using(public.can_write_business(business_id)) with check(public.can_write_business(business_id));
create index on public.checklist_tasks(business_id);
alter table public.milestones enable row level security;
create policy milestones_read on public.milestones for select to authenticated using(public.can_read_business(business_id));
create policy milestones_write on public.milestones for all to authenticated using(public.can_write_business(business_id)) with check(public.can_write_business(business_id));
create index on public.milestones(business_id);
alter table public.marketplace_categories enable row level security;
create policy marketplace_categories_admin on public.marketplace_categories for all to authenticated using(public.is_admin()) with check(public.is_admin());
create policy marketplace_categories_public on public.marketplace_categories for select to anon,authenticated using(true);
create trigger marketplace_categories_audit after insert or update or delete on public.marketplace_categories for each row execute function public.audit_change();
alter table public.providers enable row level security;
create policy providers_admin on public.providers for all to authenticated using(public.is_admin()) with check(public.is_admin());
create policy providers_public on public.providers for select to anon,authenticated using(enabled);
create trigger providers_audit after insert or update or delete on public.providers for each row execute function public.audit_change();
alter table public.provider_products enable row level security;
create policy provider_products_admin on public.provider_products for all to authenticated using(public.is_admin()) with check(public.is_admin());
create policy provider_products_public on public.provider_products for select to anon,authenticated using(exists(select 1 from public.providers p where p.id=provider_id and p.enabled));
create trigger provider_products_audit after insert or update or delete on public.provider_products for each row execute function public.audit_change();
alter table public.provider_plans enable row level security;
create policy provider_plans_admin on public.provider_plans for all to authenticated using(public.is_admin()) with check(public.is_admin());
create policy provider_plans_public on public.provider_plans for select to anon,authenticated using(exists(select 1 from public.provider_products p where p.id=product_id));
create trigger provider_plans_audit after insert or update or delete on public.provider_plans for each row execute function public.audit_change();
alter table public.plan_prices enable row level security;
create policy plan_prices_admin on public.plan_prices for all to authenticated using(public.is_admin()) with check(public.is_admin());
create policy plan_prices_public on public.plan_prices for select to anon,authenticated using(exists(select 1 from public.provider_plans p where p.id=plan_id));
create trigger plan_prices_audit after insert or update or delete on public.plan_prices for each row execute function public.audit_change();
alter table public.plan_features enable row level security;
create policy plan_features_admin on public.plan_features for all to authenticated using(public.is_admin()) with check(public.is_admin());
create policy plan_features_public on public.plan_features for select to anon,authenticated using(exists(select 1 from public.provider_plans p where p.id=plan_id));
create trigger plan_features_audit after insert or update or delete on public.plan_features for each row execute function public.audit_change();
alter table public.offers enable row level security;
create policy offers_admin on public.offers for all to authenticated using(public.is_admin()) with check(public.is_admin());
create policy offers_public on public.offers for select to anon,authenticated using(exists(select 1 from public.provider_plans p where p.id=plan_id));
create trigger offers_audit after insert or update or delete on public.offers for each row execute function public.audit_change();
alter table public.price_verification_history enable row level security;
create policy price_verification_history_admin on public.price_verification_history for all to authenticated using(public.is_admin()) with check(public.is_admin());
create trigger price_verification_history_audit after insert or update or delete on public.price_verification_history for each row execute function public.audit_change();
alter table public.affiliate_programs enable row level security;
create policy affiliate_programs_admin on public.affiliate_programs for all to authenticated using(public.is_admin()) with check(public.is_admin());
create trigger affiliate_programs_audit after insert or update or delete on public.affiliate_programs for each row execute function public.audit_change();
alter table public.affiliate_links enable row level security;
create policy affiliate_links_admin on public.affiliate_links for all to authenticated using(public.is_admin()) with check(public.is_admin());
create trigger affiliate_links_audit after insert or update or delete on public.affiliate_links for each row execute function public.audit_change();
alter table public.content_pages enable row level security;
create policy content_pages_admin on public.content_pages for all to authenticated using(public.is_admin()) with check(public.is_admin());
create policy content_public on public.content_pages for select to anon,authenticated using(published);
create trigger content_pages_audit after insert or update or delete on public.content_pages for each row execute function public.audit_change();
alter table public.feature_flags enable row level security;
create policy feature_flags_admin on public.feature_flags for all to authenticated using(public.is_admin()) with check(public.is_admin());
create trigger feature_flags_audit after insert or update or delete on public.feature_flags for each row execute function public.audit_change();
alter table public.integration_registry enable row level security;
create policy integration_registry_admin on public.integration_registry for all to authenticated using(public.is_admin()) with check(public.is_admin());
create trigger integration_registry_audit after insert or update or delete on public.integration_registry for each row execute function public.audit_change();
alter table public.affiliate_clicks enable row level security;
create policy affiliate_clicks_read on public.affiliate_clicks for select to authenticated using(public.is_admin());
alter table public.referral_events enable row level security;
create policy referral_events_read on public.referral_events for select to authenticated using(public.is_admin());
alter table public.audit_logs enable row level security;
create policy audit_logs_read on public.audit_logs for select to authenticated using(public.is_admin());
create policy referral_admin_write on public.referral_events for insert to authenticated with check(public.is_admin());
alter table public.saved_comparisons enable row level security;
create policy saved_own on public.saved_comparisons for all to authenticated using(user_id=auth.uid()) with check(user_id=auth.uid());
alter table public.notifications enable row level security;
create policy notification_read on public.notifications for select to authenticated using(user_id=auth.uid());
create policy notification_update on public.notifications for update to authenticated using(user_id=auth.uid()) with check(user_id=auth.uid());
create index on public.businesses(owner_id);
create index on public.business_members(user_id);
create index on public.affiliate_clicks(link_id,created_at);
create index on public.audit_logs(created_at);
create index on public.notifications(user_id);
create index on public.saved_comparisons(user_id);
-- Public clicks are recorded through a narrow function, not unrestricted INSERT.
create function public.resolve_affiliate(link_slug text) returns jsonb language plpgsql security definer set search_path='' as $$
declare target public.affiliate_links;host text;
begin
 select * into target from public.affiliate_links where slug=link_slug and enabled;
 if target.id is null then return null;end if;
 select approved_host into host from public.providers where id=target.provider_id and enabled;
 if host is null or target.destination !~ ('^https://' || replace(host,'.','\.') || '([/?#]|$)') then return null;end if;
 insert into public.affiliate_clicks(link_id,campaign) values(target.id,target.campaign);
 return jsonb_build_object('destination',target.destination,'approved_host',host);
end $$;
revoke execute on function public.resolve_affiliate(text) from public;
grant execute on function public.resolve_affiliate(text) to anon,authenticated;
-- Narrow table privileges; RLS is the second boundary.
grant usage on schema public to anon,authenticated;
grant select on public.marketplace_categories,public.providers,public.provider_products,public.provider_plans,public.plan_prices,public.plan_features,public.offers,public.content_pages to anon;
grant select,insert,update,delete on all tables in schema public to authenticated;
revoke insert,update,delete on public.user_roles,public.business_members,public.audit_logs,public.affiliate_clicks from authenticated;
revoke insert,delete on public.profiles from authenticated;
create trigger profiles_updated before update on public.profiles for each row execute function public.touch_updated_at();
create trigger businesses_updated before update on public.businesses for each row execute function public.touch_updated_at();
create trigger startup_wizard_sessions_updated before update on public.startup_wizard_sessions for each row execute function public.touch_updated_at();
create trigger startup_checklists_updated before update on public.startup_checklists for each row execute function public.touch_updated_at();
create trigger checklist_tasks_updated before update on public.checklist_tasks for each row execute function public.touch_updated_at();
create trigger milestones_updated before update on public.milestones for each row execute function public.touch_updated_at();
create trigger marketplace_categories_updated before update on public.marketplace_categories for each row execute function public.touch_updated_at();
create trigger providers_updated before update on public.providers for each row execute function public.touch_updated_at();
create trigger provider_products_updated before update on public.provider_products for each row execute function public.touch_updated_at();
create trigger provider_plans_updated before update on public.provider_plans for each row execute function public.touch_updated_at();
create trigger plan_prices_updated before update on public.plan_prices for each row execute function public.touch_updated_at();
create trigger plan_features_updated before update on public.plan_features for each row execute function public.touch_updated_at();
create trigger offers_updated before update on public.offers for each row execute function public.touch_updated_at();
create trigger price_verification_history_updated before update on public.price_verification_history for each row execute function public.touch_updated_at();
create trigger affiliate_programs_updated before update on public.affiliate_programs for each row execute function public.touch_updated_at();
create trigger affiliate_links_updated before update on public.affiliate_links for each row execute function public.touch_updated_at();
create trigger content_pages_updated before update on public.content_pages for each row execute function public.touch_updated_at();
create trigger feature_flags_updated before update on public.feature_flags for each row execute function public.touch_updated_at();
create trigger integration_registry_updated before update on public.integration_registry for each row execute function public.touch_updated_at();

create table public.auth_rate_limits(identity_hash text primary key,window_start timestamptz not null default now(),attempts integer not null default 1);
alter table public.auth_rate_limits enable row level security;
revoke all on public.auth_rate_limits from anon,authenticated;
create function public.check_auth_rate(identity text) returns boolean language plpgsql security definer set search_path='' as $$
declare count_now integer;
begin
 if length(identity)>254 or length(identity)<3 then return false;end if;
 insert into public.auth_rate_limits(identity_hash) values(encode(sha256(convert_to(lower(identity),'UTF8')),'hex'))
 on conflict(identity_hash) do update set
 attempts=case when public.auth_rate_limits.window_start < now()-interval '15 minutes' then 1 else public.auth_rate_limits.attempts+1 end,
 window_start=case when public.auth_rate_limits.window_start < now()-interval '15 minutes' then now() else public.auth_rate_limits.window_start end
 returning attempts into count_now;
 return count_now<=10;
end $$;
revoke execute on function public.check_auth_rate(text) from public;
grant execute on function public.check_auth_rate(text) to anon,authenticated;

create trigger businesses_audit after insert or update or delete on public.businesses for each row execute function public.audit_change();

create trigger profiles_audit after insert or update or delete on public.profiles for each row execute function public.audit_change();

create trigger user_roles_audit after insert or update or delete on public.user_roles for each row execute function public.audit_change();

create trigger checklist_tasks_audit after insert or update or delete on public.checklist_tasks for each row execute function public.audit_change();

create trigger milestones_audit after insert or update or delete on public.milestones for each row execute function public.audit_change();
