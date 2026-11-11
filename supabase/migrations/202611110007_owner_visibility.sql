-- Direct ownership must be visible during INSERT ... RETURNING; a helper SELECT
-- cannot see a newly inserted row in the command snapshot.
drop policy businesses_read on public.businesses;
create policy businesses_read on public.businesses for select to authenticated
using(owner_id=auth.uid() or public.can_read_business(id) or public.is_admin());
