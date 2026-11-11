create table public.request_rate_limits(key_hash text primary key,window_start timestamptz not null default now(),attempts integer not null default 1);
alter table public.request_rate_limits enable row level security;
revoke all on public.request_rate_limits from anon,authenticated;
create function public.take_rate_budget(identity text,max_attempts integer,seconds integer) returns boolean language plpgsql security definer set search_path='' as $$
declare count_now integer;
begin
 delete from public.request_rate_limits where window_start<now()-interval '1 day';
 insert into public.request_rate_limits(key_hash) values(encode(sha256(convert_to(identity,'UTF8')),'hex')) on conflict(key_hash) do update set
 attempts=case when public.request_rate_limits.window_start<now()-make_interval(secs=>seconds) then 1 else public.request_rate_limits.attempts+1 end,
 window_start=case when public.request_rate_limits.window_start<now()-make_interval(secs=>seconds) then now() else public.request_rate_limits.window_start end returning attempts into count_now;
 return count_now<=max_attempts;
end $$;
revoke all on function public.take_rate_budget(text,integer,integer) from public,anon,authenticated;
-- The legacy one-argument function is removed so direct API calls cannot bypass the limiter.
drop function public.resolve_affiliate(text);
create function public.resolve_affiliate(link_slug text,visitor_hash text) returns jsonb language plpgsql security definer set search_path='' as $$
declare target public.affiliate_links;host text;
begin
 if visitor_hash is null or visitor_hash !~ '^[a-f0-9]{64}$' or link_slug !~ '^[a-z0-9-]{1,100}$' then return null;end if;
 select * into target from public.affiliate_links where slug=link_slug and enabled;
 if target.id is null then return null;end if;
 select approved_host into host from public.providers where id=target.provider_id and enabled;
 if host is null or host !~ '^[a-z0-9]+([.-][a-z0-9]+)*\.[a-z]{2,}$' or target.destination !~ ('^https://'||replace(host,'.','\.')||'([/?#]|$)') then return null;end if;
 if not public.take_rate_budget('link:'||target.id::text,1000,60) or not public.take_rate_budget('visitor:'||target.id::text||':'||visitor_hash,20,60) then return jsonb_build_object('rate_limited',true);end if;
 insert into public.affiliate_clicks(link_id,campaign) values(target.id,target.campaign);
 return jsonb_build_object('destination',target.destination,'approved_host',host);
end $$;
revoke all on function public.resolve_affiliate(text,text) from public;
grant execute on function public.resolve_affiliate(text,text) to anon,authenticated;
create index request_rate_cleanup on public.request_rate_limits(window_start);
