# Build A Biz
Start Smart. Build Confidently.

## Local setup
Requires Node.js 22.x (LTS).

```sh
npm ci
cp .env.example .env.local
npm run dev
```

Set `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` and `NEXT_PUBLIC_SITE_URL` for your development project. Never commit .env files.

## Database setup
Use the Supabase CLI: link the intended development project, inspect migrations, then `supabase db push`. Run seed.sql only against a development project if catalog taxonomy is desired. The seed creates no provider pricing or fake customers. Production migration execution is a deliberate operation, never part of builds.

Set Auth site URL to your application URL, enable email confirmations and allow the `/auth/confirm` callback. For signup and recovery email templates, use a link of the following form (set `type=signup` or `type=recovery` as appropriate):

```
{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=signup
```

Configure a real email delivery service before launch. Set password policy to at least 12 characters and enable appropriate Supabase Auth rate limits.

After registering an operator account, grant its admin role from the trusted SQL editor, using its actual UUID:

```sql
insert into public.user_roles(user_id,role) values ('OPERATOR_USER_UUID','super_admin');
```

Do not create admin roles from browser code or user metadata. Keep any Vault secrets server-side.

## Checks
```sh
npm test
npm run typecheck
npm run lint
npm run build
npm audit
```

Static SQL contracts are not live RLS tests. See IMPLEMENTATION_STATUS.md for executed checks and blockers. GitHub repository: https://github.com/tylperry1/buildabiz. The implementation is on codex/complete-platform; Vercel project buildabiz is available for preview setup. Paid billing remains disabled.

## Vercel
Use the Next.js preset, Node 22+, `npm ci`, and `npm run build`. Configure environment variables separately for Preview and Production. Use separate Supabase projects for test and production data. Verify the preview’s signup → verification → login → wizard → checklist → logout flow and two-user isolation before promoting.

## API Center
Set a randomly generated 32-byte hex INTEGRATION_ENCRYPTION_KEY on the server before saving provider credentials. Keep it stable and back it up securely; changing it without re-encryption makes saved keys unreadable. The key never belongs in NEXT_PUBLIC_ variables. AFFILIATE_TRACKING_SALT is a separate random server value for daily visitor hashes. Connection probes only read known provider endpoints. Billing remains inactive even after a successful Stripe connection test.

## Continuous verification
The GitHub workflow builds and lints the application, runs unit/render tests, applies every migration to a disposable PostgreSQL service with minimal Supabase auth/storage contracts, executes real RLS and transaction tests, and runs Playwright on desktop/mobile. This is separate from verifying a real Supabase project and production email delivery.
