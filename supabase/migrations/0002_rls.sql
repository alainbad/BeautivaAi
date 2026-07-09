-- Row Level Security for BeautyAI.
-- Every user-owned table is locked to auth.uid(); admins (profiles.is_admin) get
-- elevated access to the shared catalog and cross-user read access for support/ops.

create or replace function public.is_admin()
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select coalesce((select is_admin from public.profiles where id = auth.uid()), false);
$$;

-- ---------------------------------------------------------------------------
-- profiles
-- ---------------------------------------------------------------------------
alter table public.profiles enable row level security;

create policy "profiles_select_own_or_admin" on public.profiles
  for select using (id = auth.uid() or public.is_admin());

create policy "profiles_update_own" on public.profiles
  for update using (id = auth.uid()) with check (id = auth.uid());

create policy "profiles_insert_own" on public.profiles
  for insert with check (id = auth.uid());

-- ---------------------------------------------------------------------------
-- skin_analyses
-- ---------------------------------------------------------------------------
alter table public.skin_analyses enable row level security;

create policy "skin_analyses_select_own_or_admin" on public.skin_analyses
  for select using (user_id = auth.uid() or public.is_admin());

create policy "skin_analyses_insert_own" on public.skin_analyses
  for insert with check (user_id = auth.uid());

create policy "skin_analyses_delete_own" on public.skin_analyses
  for delete using (user_id = auth.uid());

-- ---------------------------------------------------------------------------
-- skincare_routines
-- ---------------------------------------------------------------------------
alter table public.skincare_routines enable row level security;

create policy "routines_select_own" on public.skincare_routines
  for select using (user_id = auth.uid());

create policy "routines_insert_own" on public.skincare_routines
  for insert with check (user_id = auth.uid());

create policy "routines_update_own" on public.skincare_routines
  for update using (user_id = auth.uid()) with check (user_id = auth.uid());

-- ---------------------------------------------------------------------------
-- products (shared catalog)
-- ---------------------------------------------------------------------------
alter table public.products enable row level security;

create policy "products_select_active_or_admin" on public.products
  for select using (is_active or public.is_admin());

create policy "products_admin_write" on public.products
  for all using (public.is_admin()) with check (public.is_admin());

-- ---------------------------------------------------------------------------
-- recommended_products
-- ---------------------------------------------------------------------------
alter table public.recommended_products enable row level security;

create policy "recommended_products_select_own" on public.recommended_products
  for select using (user_id = auth.uid() or public.is_admin());

create policy "recommended_products_insert_own" on public.recommended_products
  for insert with check (user_id = auth.uid());

-- ---------------------------------------------------------------------------
-- saved_products
-- ---------------------------------------------------------------------------
alter table public.saved_products enable row level security;

create policy "saved_products_select_own" on public.saved_products
  for select using (user_id = auth.uid());

create policy "saved_products_insert_own" on public.saved_products
  for insert with check (user_id = auth.uid());

create policy "saved_products_delete_own" on public.saved_products
  for delete using (user_id = auth.uid());

-- ---------------------------------------------------------------------------
-- progress_photos
-- ---------------------------------------------------------------------------
alter table public.progress_photos enable row level security;

create policy "progress_photos_select_own" on public.progress_photos
  for select using (user_id = auth.uid());

create policy "progress_photos_insert_own" on public.progress_photos
  for insert with check (user_id = auth.uid());

create policy "progress_photos_delete_own" on public.progress_photos
  for delete using (user_id = auth.uid());

-- ---------------------------------------------------------------------------
-- reminders
-- ---------------------------------------------------------------------------
alter table public.reminders enable row level security;

create policy "reminders_select_own" on public.reminders
  for select using (user_id = auth.uid());

create policy "reminders_insert_own" on public.reminders
  for insert with check (user_id = auth.uid());

create policy "reminders_update_own" on public.reminders
  for update using (user_id = auth.uid()) with check (user_id = auth.uid());

create policy "reminders_delete_own" on public.reminders
  for delete using (user_id = auth.uid());

-- ---------------------------------------------------------------------------
-- subscriptions
-- ---------------------------------------------------------------------------
alter table public.subscriptions enable row level security;

create policy "subscriptions_select_own_or_admin" on public.subscriptions
  for select using (user_id = auth.uid() or public.is_admin());

-- Inserts/updates to subscriptions happen only via the service-role key
-- (Stripe webhook handler), so there is no client-facing write policy.
