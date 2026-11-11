-- Disposable test fixtures only; always rolled back.
begin;
insert into auth.users(id,email) values ('11111111-1111-4111-8111-111111111111','workflow@example.invalid');
set local role authenticated;
select set_config('request.jwt.claim.sub','11111111-1111-4111-8111-111111111111',true);
do $$ declare bid uuid;details jsonb;begin
 details:='{"name":"Workflow test","state":"Ohio","business_type":"Services","structure":"LLC","industry":"Software","formation_status":"Idea","budget":"Under $500","website":"","goals":"Test persistence"}';
 bid:=public.save_business_workspace(null,details,2,false,array[]::text[]);
 if (select current_step from public.startup_wizard_sessions where business_id=bid)<>2 then raise exception 'Wizard save failed';end if;
 perform public.save_business_workspace(bid,details,3,true,array['First task','Second task']);
 update public.checklist_tasks set completed=true where business_id=bid and title='First task';
 perform public.save_business_workspace(bid,details,3,true,array['First task','Second task']);
 if (select count(*) from public.checklist_tasks where business_id=bid)<>2 then raise exception 'Duplicate checklist tasks';end if;
 if not (select completed from public.checklist_tasks where business_id=bid and title='First task') then raise exception 'Task completion lost';end if;
 begin
  perform public.save_business_workspace(null,details,3,true,array[repeat('x',201)]);
  raise exception 'Invalid task should fail';
 exception when others then
  if sqlerrm='Invalid task should fail' then raise;end if;
 end;
 if (select count(*) from public.businesses)<>1 then raise exception 'Partial save escaped transaction';end if;
 begin
  perform public.admin_summary();raise exception 'Non-admin read allowed';
 exception when insufficient_privilege then null;end;
end $$;
reset role;
insert into public.user_roles(user_id,role) values ('11111111-1111-4111-8111-111111111111','admin');
insert into public.marketplace_categories(id,name,slug) values('cccccccc-cccc-4ccc-8ccc-cccccccccccc','Test','test');
insert into public.providers(id,name,slug,website,approved_host,enabled) values('dddddddd-dddd-4ddd-8ddd-dddddddddddd','Test Provider','test-provider','https://provider.example','provider.example',true);
insert into public.provider_products(id,name,provider_id,category_id) values('eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee','Test Product','dddddddd-dddd-4ddd-8ddd-dddddddddddd','cccccccc-cccc-4ccc-8ccc-cccccccccccc');
insert into public.provider_plans(id,name,product_id) values('ffffffff-ffff-4fff-8fff-ffffffffffff','Test Plan','eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee');
insert into public.plan_prices(plan_id,amount_cents,billing_months,verified_at,source_url) values('ffffffff-ffff-4fff-8fff-ffffffffffff',100,12,now(),'https://provider.example/pricing');
insert into public.affiliate_links(id,provider_id,slug,destination,enabled) values('abababab-abab-4bab-8bab-abababababab','dddddddd-dddd-4ddd-8ddd-dddddddddddd','approved','https://provider.example/start',true),('acacacac-acac-4cac-8cac-acacacacacac','dddddddd-dddd-4ddd-8ddd-dddddddddddd','rejected','https://provider.example.evil.invalid/start',true);
set local role anon;
do $$ begin
 if public.resolve_affiliate('approved',repeat('a',64))->>'destination'<>'https://provider.example/start' then raise exception 'Approved referral failed';end if;
 if public.resolve_affiliate('rejected',repeat('a',64)) is not null then raise exception 'Unsafe referral accepted';end if;
end $$;
reset role;
do $$ begin
 if (select count(*) from public.affiliate_clicks)<>1 then raise exception 'Click accounting failed';end if;
 if (select count(*) from public.referral_events)<>0 then raise exception 'Click fabricated a conversion';end if;
 if (select count(*) from public.price_verification_history)<>1 then raise exception 'Price verification snapshot missing';end if;
end $$;
rollback;
