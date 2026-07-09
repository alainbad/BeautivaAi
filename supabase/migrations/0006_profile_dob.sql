-- Adds date of birth to profiles (editable from the Profile screen).

alter table public.profiles
  add column if not exists date_of_birth date;
