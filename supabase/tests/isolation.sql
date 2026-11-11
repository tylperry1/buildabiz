-- Development database only. Run after migrations with psql -v ON_ERROR_STOP=1.
-- All fixtures roll back. This script has not been executed in the current environment.
begin;
insert into auth.users(id,email) values
 ('11111111-1111-4111-8111-111111111111','rls-a@example.invalid'),
 ('22222222-2222-4222-8222-222222222222','rls-b@example.invalid');
insert into public.businesses(id,owner_id,name) values
 ('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa','11111111-1111-4111-8111-111111111111','Isolation A'),
 ('bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb','22222222-2222-4222-8222-222222222222','Isolation B');
insert into public.checklist_tasks(business_id,title) values
 ('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa','A private task'),
 ('bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb','B private task');
set local role authenticated;
select set_config('request.jwt.claim.sub','11111111-1111-4111-8111-111111111111',true);
do $$ begin
 if (select count(*) from public.businesses)<>1 then raise exception 'Business isolation failed';end if;
 if (select count(*) from public.checklist_tasks)<>1 then raise exception 'Task isolation failed';end if;
 if public.is_admin() then raise exception 'Unexpected admin privilege';end if;
 update public.businesses set name='Unauthorized' where id='bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb';
 if found then raise exception 'Cross-account update allowed';end if;
 begin
  insert into public.user_roles(user_id,role) values ('11111111-1111-4111-8111-111111111111','admin');
  raise exception 'Role escalation allowed';
 exception when insufficient_privilege then null;
 end;
 begin
  insert into public.checklist_tasks(business_id,title) values ('bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb','Unauthorized');
  raise exception 'Cross-account task insertion allowed';
 exception when insufficient_privilege then null;
 end;
end $$;
select set_config('request.jwt.claim.sub','22222222-2222-4222-8222-222222222222',true);
do $$ begin
 if (select name from public.businesses limit 1)<>'Isolation B' then raise exception 'User B isolation failed';end if;
end $$;
reset role;
rollback;
