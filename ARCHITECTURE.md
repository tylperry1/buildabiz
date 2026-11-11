# Build A Biz architecture

## Runtime
Next.js App Router, TypeScript, React Server Components, Tailwind 4, Lucide. Public site and protected business/admin layouts share design tokens. `components.json` establishes shadcn configuration; reusable Radix Slot-based buttons and card source components use these conventions.

## Supabase boundary
`src/lib/supabase/server.ts` is server-only. It calls Supabase Auth and PostgREST using fetch, the publishable key and the user's access token. No service-role key is used. This REST adapter avoids adding unavailable SDK dependencies; it can be replaced by `@supabase/ssr` later.

HttpOnly SameSite=Lax cookies hold access and refresh tokens; Secure is enabled in production. Next proxy refreshes missing access cookies. `requireUser` validates the access token with Auth `/user`; `requireAdmin` reads trusted database roles on the server. Next Server Actions enforce same-origin requests. Protected routes are private/no-store. RLS remains authoritative even for direct Supabase requests.

Admin roles are provisioned only by trusted SQL, never from signup metadata. Business owners and editor/viewer memberships use security-definer helpers with an empty search_path to avoid recursive RLS. Membership writes remain unavailable until an invitation flow is built.

## Data modules
Migrations cover profiles, roles, businesses, memberships, wizard sessions, checklists, tasks, milestones, catalog taxonomy, providers, products, plans, prices, features, offers, verification history, affiliate programs, links, clicks, reported conversions, verified commissions, saved comparisons, content, flags, integration registry, notifications, contact requests and database audit logs.

Storage uses a private business-documents bucket with business-ID path prefixes and membership policies. No document upload interface is claimed.

## Integrations and credentials
Integration records contain status and credential reference names only. API Center credentials are stored as AES-256-GCM ciphertext with randomized nonces and integration-ID associated data. A server-only INTEGRATION_ENCRYPTION_KEY is required for decryption. The browser never receives decrypted credentials. Supported probes use fixed provider URLs for Stripe, Resend, and Supabase; unsupported adapters cannot be marked connected by the UI. Registry records default to Not Configured. Stripe is not activated.

## Marketplace
Database-driven category engine; only enabled providers and related catalog records are public. Prices show terms and verification dates. First-year cash cost uses the introductory term once, subsequent renewal terms, setup fees and required charges. Unknown renewals yield an unknown total. For terms longer than a year, the entire upfront term is included. Affiliate redirects resolve a stored slug and validate an exact HTTPS provider host in a narrow SQL function; clicks do not imply commissions.

## Operational limits
Auth throttling uses a database window keyed by hashed email, supplemented by Supabase's built-in limits. Production should add edge/IP abuse controls; affiliate redirects now enforce persistent per-link and daily-hashed per-visitor budgets. Raw traffic counts are not verified leads. Admin-only paginated user search joins auth email addresses through a guarded security-definer RPC. Business/wizard/checklist saving runs inside one caller-authorized SQL transaction. Admin-authenticated CRUD can delete catalog records; referential integrity prevents invalid orphan records.

## Sources consulted
- https://supabase.com/docs/guides/auth/server-side/creating-a-client
- https://supabase.com/docs/guides/auth/server-side/advanced-guide
