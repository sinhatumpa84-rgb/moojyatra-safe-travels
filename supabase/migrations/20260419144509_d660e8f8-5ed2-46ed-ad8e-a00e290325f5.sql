
-- Live presence table for travelers on the map
CREATE TABLE public.user_presence (
  user_id UUID NOT NULL PRIMARY KEY,
  display_name TEXT,
  avatar_url TEXT,
  lat DOUBLE PRECISION NOT NULL,
  lng DOUBLE PRECISION NOT NULL,
  city TEXT,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.user_presence ENABLE ROW LEVEL SECURITY;

CREATE POLICY "presence_select_all" ON public.user_presence FOR SELECT USING (true);
CREATE POLICY "presence_upsert_own" ON public.user_presence FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "presence_update_own" ON public.user_presence FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "presence_delete_own" ON public.user_presence FOR DELETE USING (auth.uid() = user_id);

CREATE INDEX idx_presence_updated ON public.user_presence(updated_at DESC);

ALTER PUBLICATION supabase_realtime ADD TABLE public.user_presence;
