CREATE TABLE public.gallery_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  photo_url text NOT NULL DEFAULT ''::text,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.gallery_items TO authenticated;
GRANT SELECT ON public.gallery_items TO anon;
GRANT ALL ON public.gallery_items TO service_role;

ALTER TABLE public.gallery_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "public read" ON public.gallery_items
FOR SELECT TO anon, authenticated USING (true);

CREATE POLICY "admin insert" ON public.gallery_items
FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));

CREATE POLICY "admin update" ON public.gallery_items
FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'::public.app_role)) WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));

CREATE POLICY "admin delete" ON public.gallery_items
FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'::public.app_role));

COMMENT ON TABLE public.team_members IS 'DEPRECATED: replaced by gallery_items for the public photo gallery.';