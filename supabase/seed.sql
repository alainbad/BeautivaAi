-- Seed the shared product catalog so /products has real data immediately
-- after the schema is applied. Safe to re-run (upserts by name+brand).

insert into public.products
  (name, brand, category, skin_type_match, concerns_match, price_range, image_url, rating, is_active)
values
  ('Hydrating Facial Cleanser', 'CeraVe', 'Cleanser', array['Dry','Sensitive'], array['Redness','Dryness'], '$', 'https://images.openbeautyfacts.org/images/products/333/787/559/7180/front_nl.31.400.jpg', 4.7, true),
  ('Hyaluronic Acid 2% + B5', 'The Ordinary', 'Serum', array['All'], array['Dryness','Dullness'], '$', 'https://images.openbeautyfacts.org/images/products/076/991/519/0199/front_en.10.400.jpg', 4.6, true),
  ('Daily Moisturizing Lotion', 'CeraVe', 'Moisturizer', array['Dry','Combination'], array['Dryness','Fine lines'], '$', 'https://images.openbeautyfacts.org/images/products/360/600/053/7743/front_en.37.400.jpg', 4.8, true),
  ('Unseen Sunscreen SPF 40', 'Supergoop!', 'Sunscreen', array['All'], array['Dark spots','Fine lines'], '$$', 'https://images.openbeautyfacts.org/images/products/081/621/802/6530/front_en.3.400.jpg', 4.9, true),
  ('Witch Hazel Aloe Vera Toner', 'Thayers', 'Toner', array['Oily','Combination'], array['Large pores','Oiliness'], '$', 'https://images.openbeautyfacts.org/images/products/004/150/707/0059/front_en.3.400.jpg', 4.5, true),
  ('2% BHA Liquid Exfoliant', 'Paula''s Choice', 'Treatment', array['Normal','Combination','Oily'], array['Large pores','Uneven tone'], '$$', 'https://images.openbeautyfacts.org/images/products/065/543/900/5913/front_en.3.400.jpg', 4.8, true),
  ('Creme de la Mer', 'La Mer', 'Moisturizer', array['All'], array['Dryness','Fine lines'], '$$$$', 'https://images.openbeautyfacts.org/images/products/074/793/000/0013/front_fr.3.400.jpg', 4.6, true),
  ('Advanced Night Repair', 'Estee Lauder', 'Serum', array['All'], array['Fine lines','Dullness'], '$$$', 'https://images.openbeautyfacts.org/images/products/088/716/748/5488/front_nl.9.400.jpg', 4.8, true),
  ('Orchidee Imperiale Black La Creme', 'Guerlain', 'Anti-Age', array['All'], array['Fine lines'], '$$$$', 'https://images.openbeautyfacts.org/images/products/334/647/061/2068/front_fr.4.400.jpg', 4.7, true),
  ('Advanced Genifique Serum', 'Lancome', 'Serum', array['All'], array['Dullness','Uneven tone'], '$$$', 'https://images.openbeautyfacts.org/images/products/361/427/278/3478/front_en.6.400.jpg', 4.7, true),
  ('Double Serum', 'Clarins', 'Serum', array['All'], array['Fine lines','Dullness'], '$$$', 'https://images.openbeautyfacts.org/images/products/338/081/014/9661/front_fr.4.400.jpg', 4.6, true),
  ('Atmosphere Airy Light UV Emulsion', 'SK-II', 'Sunscreen', array['All'], array['Dark spots'], '$$$', 'https://images.openbeautyfacts.org/images/products/692/882/002/9572/front_xx.7.400.jpg', 4.5, true)
on conflict do nothing;
