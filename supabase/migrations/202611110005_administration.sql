alter table public.integration_registry add column adapter text not null default 'manual' check(adapter in ('manual','stripe','resend','supabase'));
create table public.integration_credentials(id uuid primary key default gen_random_uuid(),integration_id uuid not null unique references public.integration_registry(id) on delete cascade,ciphertext text not null,iv text not null check(length(iv)=24),tag text not null check(length(tag)=32),created_at timestamptz not null default now(),updated_at timestamptz not null default now());
alter table public.integration_credentials enable row level security;
create policy credentials_admin on public.integration_credentials for all to authenticated using(public.is_admin()) with check(public.is_admin());
grant select,insert,update,delete on public.integration_credentials to authenticated;
revoke all on public.integration_credentials from anon;
create trigger integration_credential_audit after insert or update or delete on public.integration_credentials for each row execute function public.audit_change();
create trigger integration_credential_updated before update on public.integration_credentials for each row execute function public.touch_updated_at();
create table public.platform_settings(id uuid primary key default gen_random_uuid(),key text not null unique check(key in ('support_email','support_hours','contact_notice')),value text not null default '',created_at timestamptz not null default now(),updated_at timestamptz not null default now());
alter table public.platform_settings enable row level security;
create policy settings_public on public.platform_settings for select to anon,authenticated using(true);
create policy settings_admin on public.platform_settings for all to authenticated using(public.is_admin()) with check(public.is_admin());
grant select on public.platform_settings to anon;
grant select,insert,update,delete on public.platform_settings to authenticated;
create trigger settings_audit after insert or update or delete on public.platform_settings for each row execute function public.audit_change();
create trigger settings_updated before update on public.platform_settings for each row execute function public.touch_updated_at();
create function public.admin_users(search_text text default '',page_offset integer default 0) returns table(id uuid,full_name text,email text,created_at timestamptz)
language plpgsql stable security definer set search_path='' as $$ begin
 if not public.is_admin() then raise exception 'Admin required' using errcode='42501';end if;
 return query select p.id,p.full_name,u.email::text,p.created_at from public.profiles p join auth.users u on u.id=p.id
 where p.full_name ilike '%'||left(search_text,120)||'%' or u.email ilike '%'||left(search_text,120)||'%'
 order by p.created_at desc limit 21 offset greatest(0,least(page_offset,200000));
end $$;
revoke all on function public.admin_users(text,integer) from public;
grant execute on function public.admin_users(text,integer) to authenticated;

create table public.subscription_entitlements(id uuid primary key default gen_random_uuid(),user_id uuid not null unique references auth.users(id) on delete cascade,tier text not null default 'free' check(tier in ('free','pro','plus')),status text not null default 'free' check(status in ('free','trial','active','inactive')),stripe_subscription_id text unique,created_at timestamptz not null default now(),updated_at timestamptz not null default now(),check(tier='free' or stripe_subscription_id is not null));
alter table public.subscription_entitlements enable row level security;
create policy entitlement_read on public.subscription_entitlements for select to authenticated using(user_id=auth.uid() or public.is_admin());
grant select on public.subscription_entitlements to authenticated;
revoke insert,update,delete on public.subscription_entitlements from anon,authenticated;
create trigger entitlement_audit after insert or update or delete on public.subscription_entitlements for each row execute function public.audit_change();
create trigger entitlement_updated before update on public.subscription_entitlements for each row execute function public.touch_updated_at();
create function public.admin_summary() returns jsonb language plpgsql stable security definer set search_path='' as $$ begin
 if not public.is_admin() then raise exception 'Admin required' using errcode='42501';end if;
 return jsonb_build_object('users',(select count(*) from public.profiles),'businesses',(select count(*) from public.businesses),'providers',(select count(*) from public.providers),'clicks',(select count(*) from public.affiliate_clicks),'reported_conversions',(select count(*) from public.referral_events where event_type='reported_conversion'),'verified_commission_cents',(select coalesce(sum(amount_cents),0) from public.referral_events where event_type='verified_commission'));
end $$;
revoke all on function public.admin_summary() from public;
grant execute on function public.admin_summary() to authenticated;
create function public.feature_value(flag_key text,default_value boolean default false) returns boolean language sql stable security definer set search_path='' as $$ select coalesce((select enabled from public.feature_flags where key=flag_key),default_value) $$;
revoke all on function public.feature_value(text,boolean) from public;
grant execute on function public.feature_value(text,boolean) to anon,authenticated;
