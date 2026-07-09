-- Apple In-App Purchase support, replacing Stripe as the active billing
-- path for the iOS app (Stripe columns/webhook stay in place but unused).

alter table public.subscriptions
  add column if not exists apple_original_transaction_id text,
  add column if not exists apple_product_id text,
  add column if not exists apple_environment text;

create unique index if not exists subscriptions_apple_original_transaction_id_idx
  on public.subscriptions (apple_original_transaction_id)
  where apple_original_transaction_id is not null;
