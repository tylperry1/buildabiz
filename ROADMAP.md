# Build A Biz roadmap

Status vocabulary: Not Started, In Progress, Blocked, Ready for Testing, Testing, Completed, Verified in Production.

| Milestone | Scope | Status |
|---|---|---|
| A | Application, design tokens, layouts, database migrations, server auth guards | Ready for Testing |
| B | Public site, comparison routes, pricing disclosures, SEO, budget tool | Ready for Testing |
| C | Supabase registration, verification, recovery, cookies, profile settings | Blocked |
| D | Multiple businesses, resumable three-step wizard, checklist, milestones | Blocked |
| E | Secure admin, catalog editors, flags, logs, integration registry, contact inbox | Blocked |
| F | Category comparison, feature filtering, saved selections, affiliate tracking | Blocked |
| G | Unit checks, database integration tests, browser verification, dependency audit | In Progress |

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
