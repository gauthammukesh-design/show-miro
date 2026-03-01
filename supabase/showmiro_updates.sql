-- 1. Update Existing Prompt Templates Table
alter table public.prompt_templates
  add column if not exists is_public boolean default false not null,
  add column if not exists source_url text;

-- 2. Create Favorites Table
create table if not exists public.favorites (
  id uuid default uuid_generate_v4() primary key,
  profile_id uuid references public.profiles(id) not null,
  prompt_template_id uuid references public.prompt_templates(id) not null,
  created_at timestamptz default now() not null,
  unique (profile_id, prompt_template_id)
);

alter table public.favorites enable row level security;

-- 3. Update Row Level Security Policies

-- RLS: Prompt Templates Update
-- Drop the original restricted SELECT policy
drop policy if exists "Users can view templates in their workspaces" on public.prompt_templates;

-- Create the new, more permissive SELECT policy
-- Anyone authenticated can read if it's public, OR if they are a member of the owning workspace
create policy "Users can view public templates or templates in their workspaces"
  on public.prompt_templates for select
  using (
    is_public = true or
    workspace_id in (
      select workspace_id from public.memberships
      where profile_id = public.get_current_profile_id()
    )
  );

-- Note: The existing modify policy ("Users can modify templates in their workspaces") remains unchanged.
-- Only members of the particular workspace can insert/update/delete.

-- RLS: Favorites
create policy "Users can view own favorites"
  on public.favorites for select
  using (auth.uid() in (
    select user_id from public.profiles where id = profile_id
  ));

create policy "Users can insert own favorites"
  on public.favorites for insert
  with check (auth.uid() in (
    select user_id from public.profiles where id = profile_id
  ));

create policy "Users can delete own favorites"
  on public.favorites for delete
  using (auth.uid() in (
    select user_id from public.profiles where id = profile_id
  ));
