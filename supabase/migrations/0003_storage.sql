-- Storage buckets for BeautyAI.
-- Skin analysis + progress photos are private, keyed by "{user_id}/...".
-- Product images are public (admin-managed catalog assets).

insert into storage.buckets (id, name, public)
values
  ('skin-analysis-images', 'skin-analysis-images', false),
  ('progress-photos', 'progress-photos', false),
  ('product-images', 'product-images', true)
on conflict (id) do nothing;

-- ---------------------------------------------------------------------------
-- skin-analysis-images (private, owner-only)
-- ---------------------------------------------------------------------------
create policy "skin_analysis_images_select_own" on storage.objects
  for select using (
    bucket_id = 'skin-analysis-images'
    and (auth.uid())::text = (storage.foldername(name))[1]
  );

create policy "skin_analysis_images_insert_own" on storage.objects
  for insert with check (
    bucket_id = 'skin-analysis-images'
    and (auth.uid())::text = (storage.foldername(name))[1]
  );

create policy "skin_analysis_images_delete_own" on storage.objects
  for delete using (
    bucket_id = 'skin-analysis-images'
    and (auth.uid())::text = (storage.foldername(name))[1]
  );

-- ---------------------------------------------------------------------------
-- progress-photos (private, owner-only)
-- ---------------------------------------------------------------------------
create policy "progress_photos_bucket_select_own" on storage.objects
  for select using (
    bucket_id = 'progress-photos'
    and (auth.uid())::text = (storage.foldername(name))[1]
  );

create policy "progress_photos_bucket_insert_own" on storage.objects
  for insert with check (
    bucket_id = 'progress-photos'
    and (auth.uid())::text = (storage.foldername(name))[1]
  );

create policy "progress_photos_bucket_delete_own" on storage.objects
  for delete using (
    bucket_id = 'progress-photos'
    and (auth.uid())::text = (storage.foldername(name))[1]
  );

-- ---------------------------------------------------------------------------
-- product-images (public read, admin write)
-- ---------------------------------------------------------------------------
create policy "product_images_public_read" on storage.objects
  for select using (bucket_id = 'product-images');

create policy "product_images_admin_write" on storage.objects
  for all using (bucket_id = 'product-images' and public.is_admin())
  with check (bucket_id = 'product-images' and public.is_admin());
