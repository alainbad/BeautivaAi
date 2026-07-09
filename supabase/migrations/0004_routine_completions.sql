-- Per-day checkbox state for routine steps (Part 1 requirement: "Add
-- checkboxes so users can mark routine steps as completed"). Kept separate
-- from skincare_routines.routine_steps so the AI-generated steps stay
-- immutable and completion is tracked per calendar day.

create table if not exists public.routine_completions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  routine_type text not null check (routine_type in ('morning', 'evening')),
  step integer not null,
  completed_date date not null default current_date,
  created_at timestamptz not null default now(),
  unique (user_id, routine_type, step, completed_date)
);

create index if not exists routine_completions_user_date_idx
  on public.routine_completions (user_id, completed_date);

alter table public.routine_completions enable row level security;

create policy "routine_completions_select_own" on public.routine_completions
  for select using (user_id = auth.uid());

create policy "routine_completions_insert_own" on public.routine_completions
  for insert with check (user_id = auth.uid());

create policy "routine_completions_delete_own" on public.routine_completions
  for delete using (user_id = auth.uid());
