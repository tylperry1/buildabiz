-- Transactional workspace saving; called with the user's JWT and subject to RLS.
alter table public.checklist_tasks add constraint checklist_task_business_title unique(business_id,title);
create or replace function public.save_business_workspace(business_id uuid,details jsonb,wizard_step integer,finished boolean,task_titles text[])
returns uuid language plpgsql security invoker set search_path='' as $$
declare saved_id uuid;title_now text;task_position integer:=0;
begin
 if auth.uid() is null then raise exception 'Authentication required' using errcode='42501';end if;
 if wizard_step not between 1 and 3 or cardinality(task_titles)>30 then raise exception 'Invalid wizard state';end if;
 if business_id is null then
  insert into public.businesses(owner_id,name,state,business_type,structure,industry,formation_status,budget,website,goals)
  values(auth.uid(),details->>'name',details->>'state',details->>'business_type',details->>'structure',details->>'industry',details->>'formation_status',details->>'budget',details->>'website',details->>'goals') returning id into saved_id;
 else
  update public.businesses b set name=details->>'name',state=details->>'state',business_type=details->>'business_type',structure=details->>'structure',industry=details->>'industry',formation_status=details->>'formation_status',budget=details->>'budget',website=details->>'website',goals=details->>'goals'
   where b.id=business_id and b.owner_id=auth.uid() returning b.id into saved_id;
  if saved_id is null then raise exception 'Business not found' using errcode='42501';end if;
 end if;
 insert into public.startup_wizard_sessions(business_id,responses,current_step,completed) values(saved_id,details,wizard_step,finished)
 on conflict on constraint startup_wizard_sessions_business_id_key do update set responses=excluded.responses,current_step=excluded.current_step,completed=excluded.completed;
 insert into public.startup_checklists(business_id) values(saved_id) on conflict on constraint startup_checklists_business_id_key do nothing;
 if finished then
  foreach title_now in array task_titles loop
   if length(title_now) not between 1 and 200 then raise exception 'Invalid task title';end if;
   insert into public.checklist_tasks(business_id,title,position) values(saved_id,title_now,task_position) on conflict on constraint checklist_task_business_title do nothing;
   task_position:=task_position+1;
  end loop;
 end if;
 update public.profiles set active_business_id=saved_id where id=auth.uid();
 return saved_id;
end $$;
revoke all on function public.save_business_workspace(uuid,jsonb,integer,boolean,text[]) from public;
grant execute on function public.save_business_workspace(uuid,jsonb,integer,boolean,text[]) to authenticated;

-- Every pricing revision records its source and snapshot automatically.
create function public.record_price_verification() returns trigger language plpgsql security definer set search_path='' as $$ begin
 insert into public.price_verification_history(price_id,verified_by,source_url,snapshot) values(new.id,auth.uid(),new.source_url,to_jsonb(new));return new;end $$;
create trigger price_verified after insert or update on public.plan_prices for each row execute function public.record_price_verification();

-- Store only redirect metadata publicly; destination credentials stay private.
create function public.public_affiliate_links() returns table(provider_id uuid,slug text)
language sql stable security definer set search_path='' as $$
 select distinct on(l.provider_id) l.provider_id,l.slug from public.affiliate_links l join public.providers p on p.id=l.provider_id where l.enabled and p.enabled order by l.provider_id,l.created_at desc,l.id;
$$;
revoke all on function public.public_affiliate_links() from public;
grant execute on function public.public_affiliate_links() to anon,authenticated;

-- Stored comparison arrays must reference real plans, not arbitrary UUIDs.
create function public.validate_saved_comparison() returns trigger language plpgsql security definer set search_path='' as $$ begin
 if cardinality(new.plan_ids)<>(select count(distinct p.id) from public.provider_plans p join public.provider_products product on product.id=p.product_id join public.providers provider on provider.id=product.provider_id where p.id=any(new.plan_ids) and provider.enabled) then raise exception 'Choose unique, available plans';end if;
 return new;
end $$;
create trigger validate_comparison before insert or update on public.saved_comparisons for each row execute function public.validate_saved_comparison();

-- Users can mark a notification read, but cannot alter its content or recipient.
revoke update on public.notifications from authenticated;
grant update(read_at) on public.notifications to authenticated;
create policy notifications_admin_insert on public.notifications for insert to authenticated with check(public.is_admin());
create policy notifications_admin_read on public.notifications for select to authenticated using(public.is_admin());
create trigger referral_events_audit after insert on public.referral_events for each row execute function public.audit_change();
create trigger contact_request_audit after insert on public.contact_requests for each row execute function public.audit_change();
