create table public.contact_requests(id uuid primary key default gen_random_uuid(),name text not null,email text not null,message text not null,created_at timestamptz not null default now());
alter table public.contact_requests enable row level security;
create policy contact_admin_read on public.contact_requests for select to authenticated using(public.is_admin());
grant select on public.contact_requests to authenticated;
create function public.submit_contact(sender_name text,sender_email text,body text) returns boolean language plpgsql security definer set search_path='' as $$ begin
if length(sender_name) not between 1 and 120 or length(sender_email) not between 3 and 254 or length(body) not between 10 and 5000 then return false;end if;
if not public.check_auth_rate(sender_email) then return false;end if;
insert into public.contact_requests(name,email,message) values(sender_name,sender_email,body);return true;end $$;
revoke execute on function public.submit_contact(text,text,text) from public;
grant execute on function public.submit_contact(text,text,text) to anon,authenticated;
