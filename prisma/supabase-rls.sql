-- À exécuter dans Supabase SQL Editor avec le rôle propriétaire.
-- Le build Prisma db push ne supprime pas ces politiques.
alter table "AppLike" enable row level security;
alter table "Report" enable row level security;
alter table "AdminLog" enable row level security;
create policy "public can create likes" on "AppLike" for insert to anon, authenticated with check (true);
create policy "public can read like counts" on "AppLike" for select to anon, authenticated using (true);
create policy "public can create reports" on "Report" for insert to anon, authenticated with check (true);
create policy "service role manages moderation" on "Report" for all to service_role using (true) with check (true);
create policy "service role manages admin logs" on "AdminLog" for all to service_role using (true) with check (true);
