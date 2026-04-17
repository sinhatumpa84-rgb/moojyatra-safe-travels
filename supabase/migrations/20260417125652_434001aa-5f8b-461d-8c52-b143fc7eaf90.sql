-- MoojYatra core schema

-- Profiles
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE NOT NULL,
  display_name TEXT,
  avatar_url TEXT,
  language TEXT DEFAULT 'en',
  points INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "profiles_select_all" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "profiles_insert_own" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "profiles_update_own" ON public.profiles FOR UPDATE USING (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$ BEGIN NEW.updated_at = now(); RETURN NEW; END; $$
LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER trg_profiles_updated BEFORE UPDATE ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, display_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email, '@', 1)));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Cities
CREATE TABLE public.cities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL,
  state TEXT,
  lat DOUBLE PRECISION NOT NULL,
  lng DOUBLE PRECISION NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.cities ENABLE ROW LEVEL SECURITY;
CREATE POLICY "cities_select_all" ON public.cities FOR SELECT USING (true);

-- Prices (Price Truth DB)
CREATE TABLE public.prices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  city_id UUID NOT NULL REFERENCES public.cities(id) ON DELETE CASCADE,
  category TEXT NOT NULL, -- food, transport, monument, souvenir, hotel
  item TEXT NOT NULL,
  local_price NUMERIC(10,2) NOT NULL,
  tourist_price NUMERIC(10,2) NOT NULL,
  official_price NUMERIC(10,2),
  trust_score INTEGER DEFAULT 80,
  report_count INTEGER DEFAULT 0,
  currency TEXT DEFAULT 'INR',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.prices ENABLE ROW LEVEL SECURITY;
CREATE POLICY "prices_select_all" ON public.prices FOR SELECT USING (true);
CREATE TRIGGER trg_prices_updated BEFORE UPDATE ON public.prices
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- User price reports (crowdsourced)
CREATE TABLE public.price_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID,
  city_id UUID REFERENCES public.cities(id) ON DELETE SET NULL,
  item TEXT NOT NULL,
  reported_price NUMERIC(10,2) NOT NULL,
  expected_price NUMERIC(10,2),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.price_reports ENABLE ROW LEVEL SECURITY;
CREATE POLICY "price_reports_select_all" ON public.price_reports FOR SELECT USING (true);
CREATE POLICY "price_reports_insert_anyone" ON public.price_reports FOR INSERT WITH CHECK (true);

-- Guides
CREATE TABLE public.guides (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  city_id UUID REFERENCES public.cities(id) ON DELETE SET NULL,
  languages TEXT[] NOT NULL DEFAULT '{}',
  specialties TEXT[] NOT NULL DEFAULT '{}',
  rating NUMERIC(3,2) DEFAULT 4.5,
  hourly_rate NUMERIC(10,2) DEFAULT 500,
  available BOOLEAN DEFAULT true,
  bio TEXT,
  avatar_url TEXT,
  verified BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.guides ENABLE ROW LEVEL SECURITY;
CREATE POLICY "guides_select_all" ON public.guides FOR SELECT USING (true);

-- Bookings
CREATE TABLE public.bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  guide_id UUID NOT NULL REFERENCES public.guides(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  duration_hours INTEGER NOT NULL DEFAULT 2,
  language TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "bookings_select_own" ON public.bookings FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "bookings_insert_own" ON public.bookings FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Scam zones
CREATE TABLE public.scam_zones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  city_id UUID REFERENCES public.cities(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  lat DOUBLE PRECISION NOT NULL,
  lng DOUBLE PRECISION NOT NULL,
  risk_level TEXT NOT NULL DEFAULT 'medium', -- low, medium, high
  description TEXT,
  radius_m INTEGER DEFAULT 300,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.scam_zones ENABLE ROW LEVEL SECURITY;
CREATE POLICY "scam_zones_select_all" ON public.scam_zones FOR SELECT USING (true);

-- Scam reports (with AI analysis)
CREATE TABLE public.scam_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID,
  city_id UUID REFERENCES public.cities(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  media_url TEXT,
  scam_score INTEGER, -- 0-100 from AI
  ai_summary TEXT,
  legal_sections JSONB, -- [{act, section, description}]
  recommended_actions JSONB,
  status TEXT NOT NULL DEFAULT 'submitted', -- submitted, analyzed, escalated
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.scam_reports ENABLE ROW LEVEL SECURITY;
CREATE POLICY "scam_reports_select_all" ON public.scam_reports FOR SELECT USING (true);
CREATE POLICY "scam_reports_insert_anyone" ON public.scam_reports FOR INSERT WITH CHECK (true);
CREATE POLICY "scam_reports_update_own" ON public.scam_reports FOR UPDATE USING (auth.uid() = user_id);

-- Badges
CREATE TABLE public.badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  icon TEXT,
  points INTEGER DEFAULT 50
);
ALTER TABLE public.badges ENABLE ROW LEVEL SECURITY;
CREATE POLICY "badges_select_all" ON public.badges FOR SELECT USING (true);

CREATE TABLE public.user_badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  badge_id UUID NOT NULL REFERENCES public.badges(id) ON DELETE CASCADE,
  earned_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, badge_id)
);
ALTER TABLE public.user_badges ENABLE ROW LEVEL SECURITY;
CREATE POLICY "user_badges_select_all" ON public.user_badges FOR SELECT USING (true);
CREATE POLICY "user_badges_insert_own" ON public.user_badges FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Storage buckets
INSERT INTO storage.buckets (id, name, public) VALUES ('scam-evidence', 'scam-evidence', true)
ON CONFLICT (id) DO NOTHING;
INSERT INTO storage.buckets (id, name, public) VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "scam_evidence_public_read" ON storage.objects FOR SELECT USING (bucket_id = 'scam-evidence');
CREATE POLICY "scam_evidence_anyone_upload" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'scam-evidence');
CREATE POLICY "avatars_public_read" ON storage.objects FOR SELECT USING (bucket_id = 'avatars');
CREATE POLICY "avatars_user_upload" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'avatars' AND auth.role() = 'authenticated');