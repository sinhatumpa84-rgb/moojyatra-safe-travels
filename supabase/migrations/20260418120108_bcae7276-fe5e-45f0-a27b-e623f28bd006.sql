-- Visited places table
CREATE TABLE public.visited_places (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  place_name TEXT NOT NULL,
  place_lat DOUBLE PRECISION,
  place_lng DOUBLE PRECISION,
  photo_url TEXT NOT NULL,
  bill_url TEXT,
  notes TEXT,
  points_awarded INTEGER NOT NULL DEFAULT 50,
  badge_code TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.visited_places ENABLE ROW LEVEL SECURITY;

CREATE POLICY "visited_places_select_all" ON public.visited_places
  FOR SELECT USING (true);

CREATE POLICY "visited_places_insert_own" ON public.visited_places
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "visited_places_update_own" ON public.visited_places
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "visited_places_delete_own" ON public.visited_places
  FOR DELETE USING (auth.uid() = user_id);

CREATE INDEX idx_visited_places_user ON public.visited_places(user_id);
CREATE INDEX idx_visited_places_created ON public.visited_places(created_at DESC);

-- Storage policies for scam-evidence bucket (reused for visit photos under visits/ prefix)
CREATE POLICY "visits_public_read" ON storage.objects
  FOR SELECT USING (bucket_id = 'scam-evidence');

CREATE POLICY "visits_auth_insert" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'scam-evidence' AND auth.role() = 'authenticated');
