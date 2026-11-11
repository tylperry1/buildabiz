-- Safe catalog taxonomy only; no fabricated providers, prices, users, or commissions.
insert into public.marketplace_categories(name,slug,description) values ('Domains','domains','Domain registration and renewals'),('Hosting','hosting','Web hosting services'),('Business email','email','Business email and productivity'),('Formation','formation','Business formation services') on conflict(slug) do nothing;
insert into public.integration_registry(name,integration_type,requirements) values ('Stripe','billing','["STRIPE_SECRET_KEY","STRIPE_WEBHOOK_SECRET"]');

insert into public.integration_registry(name,integration_type,adapter,requirements) values
('Resend','email','resend','["API_KEY"]'),('Supabase','database','supabase','["NEXT_PUBLIC_SUPABASE_URL","NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY"]');
update public.integration_registry set adapter='stripe' where name='Stripe';
