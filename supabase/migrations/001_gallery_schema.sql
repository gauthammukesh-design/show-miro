-- Migration: 001_gallery_schema
-- Purpose: Initialize Inspiration Gallery MVP schema + RLS policies

-- 1. Clean Slate (Drop previous v1 schema if exists)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user CASCADE;
DROP TABLE IF EXISTS public.memberships CASCADE;
DROP TABLE IF EXISTS public.prompt_versions CASCADE;
DROP TABLE IF EXISTS public.prompt_templates CASCADE;
DROP TABLE IF EXISTS public.workspaces CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;

-- 2. Create is_admin() Helper Function First
-- We use a dummy table check for now, we'll replace it right after profiles is created.
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql SECURITY DEFINER SET search_path = public
AS $$ SELECT false; $$;

-- 3. Profiles
CREATE TABLE public.profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  email text not null,
  role text not null default 'user' check (role in ('user', 'admin')),
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

-- Backfill profiles for existing auth.users
INSERT INTO public.profiles (id, email, role)
SELECT id, email, 'user' FROM auth.users ON CONFLICT (id) DO NOTHING;

-- Now update is_admin() to actually check the profiles table
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
$$;

-- 4. Re-create Auth Trigger
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, role)
  VALUES (new.id, new.email, 'user');
  RETURN new;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- 5. Taxonomy Tables
CREATE TABLE public.categories (
  id uuid default uuid_generate_v4() primary key,
  name text unique not null,
  slug text unique not null,
  description text,
  sort_order int default 0,
  created_at timestamptz default now() not null
);

CREATE TABLE public.tags (
  id uuid default uuid_generate_v4() primary key,
  name text unique not null,
  slug text unique not null,
  created_at timestamptz default now() not null
);

-- 6. Inspiration Items
CREATE TABLE public.inspiration_items (
  id uuid default uuid_generate_v4() primary key,
  title text not null,
  description text,
  format text not null check (format in ('prompt','image','template')),
  prompt_text text,
  negative_prompt text,
  ai_model text,
  ai_settings jsonb,
  image_url text,
  thumbnail_url text,
  source_url text,
  
  -- External creator metadata
  external_creator_name text not null,
  external_creator_handle text not null,
  external_creator_avatar_url text not null,
  external_post_date timestamptz not null,
  
  -- State
  visibility text default 'private' check (visibility in ('public','private')),
  state text default 'draft' check (state in ('draft','pending_review','published','rejected','archived')),
  is_featured boolean default false,
  
  -- Ownership and Moderation
  uploader_profile_id uuid references public.profiles(id) not null,
  moderated_by uuid references public.profiles(id),
  moderated_at timestamptz,
  moderation_notes text,
  
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null,

  CONSTRAINT prompt_required_for_prompt_format
    CHECK (format != 'prompt' OR prompt_text IS NOT NULL)
);

CREATE INDEX idx_items_state_visibility ON public.inspiration_items (state, visibility);
CREATE INDEX idx_items_uploader ON public.inspiration_items (uploader_profile_id);

-- 7. Join Tables
CREATE TABLE public.item_categories (
  item_id uuid references public.inspiration_items(id) on delete cascade not null,
  category_id uuid references public.categories(id) on delete cascade not null,
  primary key (item_id, category_id)
);

CREATE TABLE public.item_tags (
  item_id uuid references public.inspiration_items(id) on delete cascade not null,
  tag_id uuid references public.tags(id) on delete cascade not null,
  primary key (item_id, tag_id)
);

-- 8. Favorites
CREATE TABLE public.favorites (
  id uuid default uuid_generate_v4() primary key,
  profile_id uuid references public.profiles(id) on delete cascade not null,
  item_id uuid references public.inspiration_items(id) on delete cascade not null,
  created_at timestamptz default now() not null,
  UNIQUE(profile_id, item_id)
);

-- 9. Admin Log
CREATE TABLE public.admin_action_log (
  id uuid default uuid_generate_v4() primary key,
  actor_profile_id uuid references public.profiles(id) on delete set null not null,
  action text not null,
  target_item_id uuid,
  details jsonb,
  created_at timestamptz default now() not null
);

-- 10. Delete Requests
CREATE TABLE public.delete_requests (
  id uuid default uuid_generate_v4() primary key,
  item_id uuid references public.inspiration_items(id) on delete cascade not null,
  requester_profile_id uuid references public.profiles(id) on delete cascade not null,
  reason text,
  status text default 'open' check (status in ('open','closed')),
  created_at timestamptz default now() not null,
  resolved_by uuid references public.profiles(id),
  resolved_at timestamptz
);

-- ==========================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==========================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inspiration_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.item_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.item_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_action_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.delete_requests ENABLE ROW LEVEL SECURITY;

-- 1. Profiles
CREATE POLICY "Users can view own profile or admins view all"
  ON public.profiles FOR SELECT
  USING (id = auth.uid() OR public.is_admin());

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (id = auth.uid());

CREATE POLICY "Admins can update all profiles"
  ON public.profiles FOR UPDATE
  USING (public.is_admin());

-- 2. inspiration_items
CREATE POLICY "Public items are viewable by everyone"
  ON public.inspiration_items FOR SELECT
  USING ( (state = 'published' AND visibility = 'public') 
       OR uploader_profile_id = auth.uid() 
       OR public.is_admin() );

CREATE POLICY "Users can insert pending items"
  ON public.inspiration_items FOR INSERT
  WITH CHECK (
    uploader_profile_id = auth.uid() 
    AND state = 'pending_review' 
    AND visibility = 'private'
  );

CREATE POLICY "Admins can insert any item"
  ON public.inspiration_items FOR INSERT
  WITH CHECK (public.is_admin());

CREATE POLICY "Users can update their draft/pending items"
  ON public.inspiration_items FOR UPDATE
  USING (uploader_profile_id = auth.uid() AND state IN ('draft','pending_review'))
  WITH CHECK (state IN ('draft','pending_review') AND visibility = 'private');

CREATE POLICY "Admins can update any item"
  ON public.inspiration_items FOR UPDATE
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE POLICY "Only admins can delete items"
  ON public.inspiration_items FOR DELETE
  USING (public.is_admin());

-- 3. Taxonomies (categories, tags, item_categories, item_tags)
CREATE POLICY "Taxonomies are viewable by everyone"
  ON public.categories FOR SELECT USING (true);
CREATE POLICY "Admins can insert categories"
  ON public.categories FOR INSERT WITH CHECK (public.is_admin());
CREATE POLICY "Admins can update categories"
  ON public.categories FOR UPDATE USING (public.is_admin());
CREATE POLICY "Admins can delete categories"
  ON public.categories FOR DELETE USING (public.is_admin());

CREATE POLICY "Taxonomies are viewable by everyone"
  ON public.tags FOR SELECT USING (true);
CREATE POLICY "Admins can insert tags"
  ON public.tags FOR INSERT WITH CHECK (public.is_admin());
CREATE POLICY "Admins can update tags"
  ON public.tags FOR UPDATE USING (public.is_admin());
CREATE POLICY "Admins can delete tags"
  ON public.tags FOR DELETE USING (public.is_admin());

CREATE POLICY "Item Taxonomies are viewable by everyone"
  ON public.item_categories FOR SELECT USING (true);
CREATE POLICY "Admins can insert item_categories"
  ON public.item_categories FOR INSERT WITH CHECK (public.is_admin());
CREATE POLICY "Admins can update item_categories"
  ON public.item_categories FOR UPDATE USING (public.is_admin());
CREATE POLICY "Admins can delete item_categories"
  ON public.item_categories FOR DELETE USING (public.is_admin());

CREATE POLICY "Item Taxonomies are viewable by everyone"
  ON public.item_tags FOR SELECT USING (true);
CREATE POLICY "Admins can insert item_tags"
  ON public.item_tags FOR INSERT WITH CHECK (public.is_admin());
CREATE POLICY "Admins can update item_tags"
  ON public.item_tags FOR UPDATE USING (public.is_admin());
CREATE POLICY "Admins can delete item_tags"
  ON public.item_tags FOR DELETE USING (public.is_admin());

-- 4. Favorites 
CREATE POLICY "Users see own favorites"
  ON public.favorites FOR SELECT USING (profile_id = auth.uid());
CREATE POLICY "Users inert own favorites"
  ON public.favorites FOR INSERT WITH CHECK (profile_id = auth.uid());
CREATE POLICY "Users delete own favorites"
  ON public.favorites FOR DELETE USING (profile_id = auth.uid());

-- 5. Admin Log
CREATE POLICY "Admins read action logs"
  ON public.admin_action_log FOR SELECT USING (public.is_admin());
CREATE POLICY "Admins insert action logs"
  ON public.admin_action_log FOR INSERT WITH CHECK (public.is_admin());

-- 6. Delete requests
CREATE POLICY "Users read own delete requests or admin"
  ON public.delete_requests FOR SELECT USING (requester_profile_id = auth.uid() OR public.is_admin());
CREATE POLICY "Users insert own delete requests"
  ON public.delete_requests FOR INSERT WITH CHECK (requester_profile_id = auth.uid());
CREATE POLICY "Admins update delete requests"
  ON public.delete_requests FOR UPDATE USING (public.is_admin());

-- ==========================================
-- STORAGE SETUP & POLICIES
-- ==========================================

-- We assume storage schema exists in a full Supabase environment. Next migrations will handle buckets if they don't exist via API, but we'll try configuring here through SQL if valid.
-- For now, the buckets should be created manually or via Supabase Storage API seed scripts in production.
-- If running local supabase, we can insert into storage.buckets.

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES 
  ('inspiration-public', 'inspiration-public', true, 10485760, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']),
  ('inspiration-private', 'inspiration-private', false, 10485760, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif'])
ON CONFLICT (id) DO UPDATE SET public = excluded.public;

-- Storage object policies
CREATE POLICY "Public images are viewable by anyone"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'inspiration-public');

CREATE POLICY "Admin can insert to public bucket"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'inspiration-public' AND public.is_admin());

CREATE POLICY "Admin can update public bucket"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'inspiration-public' AND public.is_admin());

CREATE POLICY "Admin can delete from public bucket"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'inspiration-public' AND public.is_admin());

CREATE POLICY "Private images are viewable by owner or admin"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'inspiration-private' 
    AND ( auth.uid()::text = (storage.foldername(name))[1] OR public.is_admin() )
  );

CREATE POLICY "Users can upload to their private folder"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'inspiration-private' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can delete their private folder objects or admin"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'inspiration-private' 
    AND ( auth.uid()::text = (storage.foldername(name))[1] OR public.is_admin() )
  );
