-- BeautyAI core schema
-- Tables, indexes, and the auth.users -> profiles bootstrap trigger.

create extension if not exists pgcrypto;

-- ---------------------------------------------------------------------------
-- profiles
-- ---------------------------------------------------------------------------
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text,
  email text,
  age_range text,
  gender text,
  skin_type text,
  skin_concerns text[] not null default '{}',
  allergies text[] not null default '{}',
  preferred_budget text,
  country text,
  is_admin boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- skin_analyses
-- ---------------------------------------------------------------------------
create table if not exists public.skin_analyses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  image_url text,
  skin_score integer check (skin_score between 0 and 100),
  acne_level text,
  redness_level text,
  dark_spots_level text,
  wrinkles_level text,
  pores_level text,
  oiliness_level text,
  dryness_level text,
  ai_summary text,
  recommendations jsonb,
  disclaimer text,
  created_at timestamptz not null default now()
);

create index if not exists skin_analyses_user_id_idx on public.skin_analyses (user_id, created_at desc);

-- ---------------------------------------------------------------------------
-- skincare_routines
-- ---------------------------------------------------------------------------
create table if not exists public.skincare_routines (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  analysis_id uuid references public.skin_analyses (id) on delete set null,
  routine_type text not null check (routine_type in ('morning', 'evening')),
  routine_steps jsonb not null default '[]',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, routine_type)
);

create index if not exists skincare_routines_user_id_idx on public.skincare_routines (user_id);

-- ---------------------------------------------------------------------------
-- products (admin-managed catalog)
-- ---------------------------------------------------------------------------
create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  brand text,
  category text,
  skin_type_match text[] not null default '{}',
  concerns_match text[] not null default '{}',
  ingredients text[] not null default '{}',
  price_range text,
  image_url text,
  affiliate_url text,
  rating numeric,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists products_category_idx on public.products (category);
create index if not exists products_is_active_idx on public.products (is_active);

-- ---------------------------------------------------------------------------
-- recommended_products
-- ---------------------------------------------------------------------------
create table if not exists public.recommended_products (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  analysis_id uuid references public.skin_analyses (id) on delete cascade,
  product_id uuid not null references public.products (id) on delete cascade,
  reason text,
  match_score integer check (match_score between 0 and 100),
  created_at timestamptz not null default now()
);

create index if not exists recommended_products_user_id_idx on public.recommended_products (user_id, created_at desc);

-- ---------------------------------------------------------------------------
-- saved_products
-- ---------------------------------------------------------------------------
create table if not exists public.saved_products (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  product_id uuid not null references public.products (id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (user_id, product_id)
);

create index if not exists saved_products_user_id_idx on public.saved_products (user_id);

-- ---------------------------------------------------------------------------
-- progress_photos
-- ---------------------------------------------------------------------------
create table if not exists public.progress_photos (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  image_url text not null,
  notes text,
  skin_score integer check (skin_score between 0 and 100),
  created_at timestamptz not null default now()
);

create index if not exists progress_photos_user_id_idx on public.progress_photos (user_id, created_at desc);

-- ---------------------------------------------------------------------------
-- reminders
-- ---------------------------------------------------------------------------
create table if not exists public.reminders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  title text not null,
  description text,
  reminder_time time not null,
  days_of_week text[] not null default '{}',
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists reminders_user_id_idx on public.reminders (user_id);

-- ---------------------------------------------------------------------------
-- subscriptions
-- ---------------------------------------------------------------------------
create table if not exists public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  plan text not null default 'free' check (plan in ('free', 'premium')),
  status text not null default 'active',
  stripe_customer_id text,
  stripe_subscription_id text,
  current_period_end timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id)
);

create index if not exists subscriptions_stripe_customer_id_idx on public.subscriptions (stripe_customer_id);
create index if not exists subscriptions_stripe_subscription_id_idx on public.subscriptions (stripe_subscription_id);

-- ---------------------------------------------------------------------------
-- updated_at maintenance trigger
-- ---------------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger set_updated_at before update on public.profiles
  for each row execute function public.set_updated_at();
create trigger set_updated_at before update on public.skincare_routines
  for each row execute function public.set_updated_at();
create trigger set_updated_at before update on public.products
  for each row execute function public.set_updated_at();
create trigger set_updated_at before update on public.reminders
  for each row execute function public.set_updated_at();
create trigger set_updated_at before update on public.subscriptions
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- Bootstrap a profile + free subscription row whenever a new auth user signs up
-- (covers email/password sign-up and OAuth providers like Google).
-- ---------------------------------------------------------------------------
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'full_name', new.raw_user_meta_data ->> 'name')
  )
  on conflict (id) do nothing;

  insert into public.subscriptions (user_id, plan, status)
  values (new.id, 'free', 'active')
  on conflict (user_id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
