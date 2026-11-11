# Build A Biz roadmap

Status vocabulary: Not Started, In Progress, Blocked, Ready for Testing, Testing, Completed, Verified in Production.

| Milestone | Scope | Status |
|---|---|---|
| A | Application, design tokens, layouts, database migrations, server auth guards | Completed |
| B | Public site, comparison routes, pricing disclosures, SEO, budget tool | Ready for Testing |
| C | Supabase registration, verification, recovery, cookies, profile settings | Blocked |
| D | Multiple businesses, resumable three-step wizard, checklist, milestones | Blocked |
| E | Secure admin, catalog editors, flags, logs, integration registry, contact inbox | Blocked |
| F | Category comparison, feature filtering, saved selections, affiliate tracking | Blocked |
| G | Automated checks passed; real Supabase and production acceptance remain | In Progress |

C–F have implementation code but require a configured Supabase environment and live acceptance tests. No production verification has occurred.

## Future modules
Startup & formation; domains & hosting; email & productivity; business credit; banking & funding; business management; accounting & invoicing; compliance; marketing; AI assistant; business planning; insurance; HR & payroll; learning academy; partner marketplace; administration.

## Next implementation priorities
1. Apply migrations to a development Supabase project and execute two-user RLS tests.
2. Verify auth email templates, session refresh, wizard resume, checklist persistence and admin permissions.
3. Verify reusable UI components, pending states and notices in desktop/mobile CI.
4. Verify admin pagination, saved comparison reopening, price/offer history, affiliate placement and manually recorded provider reports.
5. Verify transactional saving, encrypted credential administration, supported connection probes and rate limits.
6. Browser-test light/dark desktop and mobile layouts; complete dependency audit.
7. Link GitHub/Vercel and verify a preview before production release.

## Verified delivery
Code commit e29bc2599157d5d31b146aaaf8fe70fb12499e2e passes CI: 23 unit/render/contract tests, PostgreSQL migrations/security/workflow tests, 9 desktop/mobile browser checks, production build/type/lint, and a zero-vulnerability production dependency audit. Draft PR #1 and a READY Vercel preview are available.

## Production instruction
The user has authorized production deployment once completion gates pass. Release is blocked until Supabase access/live flows and explicit approval for server encryption/tracking secret provisioning are available. Custom-domain ownership/DNS also needs verification.
