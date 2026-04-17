-- Tighten storage SELECT to specific objects only (still public read of files via public URL)
DROP POLICY IF EXISTS "scam_evidence_public_read" ON storage.objects;
DROP POLICY IF EXISTS "avatars_public_read" ON storage.objects;

-- Public buckets: files are accessible via public URL (signed by bucket=public).
-- We keep no broad SELECT policy to avoid listing; uploads still allowed.
-- Note: public buckets serve files via /storage/v1/object/public/<bucket>/<path> which doesn't require SELECT policy.

-- Seed cities
INSERT INTO public.cities (name, state, lat, lng) VALUES
  ('Agra','Uttar Pradesh',27.1767,78.0081),
  ('Delhi','Delhi',28.6139,77.2090),
  ('Jaipur','Rajasthan',26.9124,75.7873),
  ('Mumbai','Maharashtra',19.0760,72.8777),
  ('Kolkata','West Bengal',22.5726,88.3639),
  ('Goa','Goa',15.2993,74.1240),
  ('Varanasi','Uttar Pradesh',25.3176,82.9739),
  ('Rishikesh','Uttarakhand',30.0869,78.2676)
ON CONFLICT (name) DO NOTHING;

-- Seed prices (a curated mix per city)
WITH c AS (SELECT name, id FROM public.cities)
INSERT INTO public.prices (city_id, category, item, local_price, tourist_price, official_price, trust_score, report_count) VALUES
  ((SELECT id FROM c WHERE name='Agra'),'monument','Taj Mahal entry (foreigner)',1100,1300,1100,95,42),
  ((SELECT id FROM c WHERE name='Agra'),'transport','Auto-rickshaw 5km',80,300,NULL,82,67),
  ((SELECT id FROM c WHERE name='Agra'),'food','Mughlai thali',250,800,NULL,78,33),
  ((SELECT id FROM c WHERE name='Delhi'),'transport','Airport taxi to Connaught Place',450,1500,500,88,121),
  ((SELECT id FROM c WHERE name='Delhi'),'monument','Red Fort entry (foreigner)',600,600,600,99,18),
  ((SELECT id FROM c WHERE name='Delhi'),'souvenir','Pashmina shawl',1500,8000,NULL,70,54),
  ((SELECT id FROM c WHERE name='Jaipur'),'transport','Tuk-tuk Old City',100,500,NULL,80,89),
  ((SELECT id FROM c WHERE name='Jaipur'),'monument','Amer Fort entry',500,500,500,98,12),
  ((SELECT id FROM c WHERE name='Jaipur'),'souvenir','Hand-block printed scarf',300,1500,NULL,72,40),
  ((SELECT id FROM c WHERE name='Mumbai'),'transport','Kaali-Peeli 5km',150,500,NULL,85,76),
  ((SELECT id FROM c WHERE name='Mumbai'),'food','Vada pav',20,80,NULL,90,29),
  ((SELECT id FROM c WHERE name='Kolkata'),'transport','Yellow taxi 4km',120,400,NULL,83,38),
  ((SELECT id FROM c WHERE name='Kolkata'),'food','Roshogolla (per pc)',15,50,NULL,92,21),
  ((SELECT id FROM c WHERE name='Goa'),'transport','Scooter rental/day',300,800,NULL,80,55),
  ((SELECT id FROM c WHERE name='Goa'),'food','Beach shack thali',300,900,NULL,76,44),
  ((SELECT id FROM c WHERE name='Varanasi'),'transport','Boat ride sunrise',200,1500,NULL,68,92),
  ((SELECT id FROM c WHERE name='Varanasi'),'monument','Sarnath museum',25,300,25,90,16),
  ((SELECT id FROM c WHERE name='Rishikesh'),'transport','Shared jeep to Laxman Jhula',30,200,NULL,84,27),
  ((SELECT id FROM c WHERE name='Rishikesh'),'food','Yoga cafe meal',200,600,NULL,79,31);

-- Seed scam zones
WITH c AS (SELECT name, id FROM public.cities)
INSERT INTO public.scam_zones (city_id, name, lat, lng, risk_level, description) VALUES
  ((SELECT id FROM c WHERE name='Agra'),'Taj East Gate touts',27.1747,78.0421,'high','Fake guides offering "VIP entry" — official tickets only at counter or online'),
  ((SELECT id FROM c WHERE name='Delhi'),'New Delhi Railway Station',28.6428,77.2191,'high','Fake "tourist information" booths redirecting to overpriced agencies'),
  ((SELECT id FROM c WHERE name='Delhi'),'Paharganj market',28.6448,77.2167,'medium','Inflated prices for foreigners — bargain hard'),
  ((SELECT id FROM c WHERE name='Jaipur'),'Hawa Mahal touts',26.9239,75.8267,'medium','Gemstone scam: "export to your country tax-free"'),
  ((SELECT id FROM c WHERE name='Mumbai'),'Gateway of India',18.9220,72.8347,'medium','Photographers charging ₹500/photo'),
  ((SELECT id FROM c WHERE name='Goa'),'Baga Beach taxi mafia',15.5560,73.7510,'high','No app rides allowed; fixed inflated rates'),
  ((SELECT id FROM c WHERE name='Varanasi'),'Dashashwamedh Ghat boatmen',25.3074,83.0103,'high','Aarti boat scam — agreed price not honoured'),
  ((SELECT id FROM c WHERE name='Kolkata'),'Howrah Station prepaid taxi',22.5839,88.3426,'medium','Drivers refuse meter — use prepaid booth only');

-- Seed guides
WITH c AS (SELECT name, id FROM public.cities)
INSERT INTO public.guides (name, city_id, languages, specialties, rating, hourly_rate, available, bio, verified) VALUES
  ('Rohan Sharma',(SELECT id FROM c WHERE name='Agra'),ARRAY['English','Hindi','French'],ARRAY['Mughal history','Photography'],4.9,800,true,'Govt-licensed Taj Mahal expert, 12 years experience.',true),
  ('Priya Kapoor',(SELECT id FROM c WHERE name='Delhi'),ARRAY['English','Hindi','Spanish'],ARRAY['Old Delhi food','Heritage walks'],4.8,700,true,'Food historian, leads Chandni Chowk walks.',true),
  ('Vikram Singh',(SELECT id FROM c WHERE name='Jaipur'),ARRAY['English','Hindi','German'],ARRAY['Forts','Royal heritage'],4.7,750,true,'Born in the Pink City, knows every haveli.',true),
  ('Anita Desai',(SELECT id FROM c WHERE name='Mumbai'),ARRAY['English','Hindi','Marathi'],ARRAY['Bollywood tours','Street food'],4.9,900,true,'Ex-film industry, Bollywood insider.',true),
  ('Sourav Banerjee',(SELECT id FROM c WHERE name='Kolkata'),ARRAY['English','Hindi','Bengali'],ARRAY['Colonial Calcutta','Cafes'],4.6,600,true,'Heritage walker and tea connoisseur.',true),
  ('Maria Fernandes',(SELECT id FROM c WHERE name='Goa'),ARRAY['English','Portuguese','Konkani'],ARRAY['Beaches','Portuguese churches'],4.8,700,true,'Local Goan, knows hidden coves.',true),
  ('Pandit Ravi',(SELECT id FROM c WHERE name='Varanasi'),ARRAY['English','Hindi','Sanskrit'],ARRAY['Ghats','Spirituality'],4.9,650,true,'Sanskrit scholar and ghat guide.',true),
  ('Yogi Aman',(SELECT id FROM c WHERE name='Rishikesh'),ARRAY['English','Hindi'],ARRAY['Yoga','Adventure','Trek'],4.7,800,true,'Yoga teacher and trek leader.',true);

-- Seed badges
INSERT INTO public.badges (code, name, description, icon, points) VALUES
  ('first_report','First Reporter','Submit your first scam report','flag',50),
  ('truth_seeker','Truth Seeker','Report 5 prices','search',100),
  ('safety_hero','Safety Hero','Use SOS once safely','shield',150),
  ('explorer','Explorer','Visit 3 cities in app','compass',75),
  ('language_master','Polyglot','Use chatbot in 3 languages','languages',100),
  ('guide_friend','Guide Friend','Book a guide','handshake',150),
  ('top_reporter','Top Reporter','10 verified reports','trophy',300),
  ('night_owl','Night Owl','Report a nighttime scam','moon',75),
  ('community_star','Community Star','Earn 1000 points','star',500),
  ('legal_eagle','Legal Eagle','View 5 legal analyses','gavel',100)
ON CONFLICT (code) DO NOTHING;