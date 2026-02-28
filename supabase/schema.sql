-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- 1. Workspaces Table
create table public.workspaces (
  id uuid default uuid_generate_v4() primary key,
  owner_id uuid references auth.users(id) not null,
  name text not null,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

alter table public.workspaces enable row level security;

-- 2. Profiles Table
create table public.profiles (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users(id) not null unique,
  email text not null,
  workspace_id uuid references public.workspaces(id), -- Default workspace
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

alter table public.profiles enable row level security;

-- 3. Memberships Table
create table public.memberships (
  profile_id uuid references public.profiles(id) not null,
  workspace_id uuid references public.workspaces(id) not null,
  role text not null check (role in ('owner', 'admin', 'member')),
  created_at timestamptz default now() not null,
  primary key (profile_id, workspace_id)
);

alter table public.memberships enable row level security;

-- 4. Prompt Templates Table
create table public.prompt_templates (
  id uuid default uuid_generate_v4() primary key,
  workspace_id uuid references public.workspaces(id) not null,
  current_version_id uuid, -- Will reference prompt_versions once created
  name text not null,
  description text,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

alter table public.prompt_templates enable row level security;

-- Helper function to get the current profile id
create or replace function public.get_current_profile_id()
returns uuid
language sql security definer as $$
  select id from public.profiles where user_id = auth.uid();
$$;

-- ==========================================
-- ROW LEVEL SECURITY POLICIES
-- ==========================================

-- RLS: Profiles
-- User can only read/update their own profile
create policy "Users can view own profile"
  on public.profiles for select
  using (auth.uid() = user_id);

create policy "Users can insert own profile"
  on public.profiles for insert
  with check (auth.uid() = user_id);

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = user_id);

-- RLS: Workspaces
-- Private; only the owner/members can access.
create policy "Users can view workspaces they own or belong to"
  on public.workspaces for select
  using (
    auth.uid() = owner_id or
    id in (
      select workspace_id from public.memberships
      where profile_id = public.get_current_profile_id()
    )
  );

create policy "Users can insert workspaces"
  on public.workspaces for insert
  with check (auth.uid() = owner_id);

create policy "Users can update workspaces they own"
  on public.workspaces for update
  using (auth.uid() = owner_id);

-- RLS: Memberships
create policy "Users can view memberships in their workspaces"
  on public.memberships for select
  using (
    workspace_id in (
      select workspace_id from public.memberships
      where profile_id = public.get_current_profile_id()
    )
    or profile_id = public.get_current_profile_id()
  );

create policy "Owners can manage memberships"
  on public.memberships for all
  using (
    workspace_id in (
      select id from public.workspaces where owner_id = auth.uid()
    )
  );

-- RLS: Prompt Templates
create policy "Users can view templates in their workspaces"
  on public.prompt_templates for select
  using (
    workspace_id in (
      select workspace_id from public.memberships
      where profile_id = public.get_current_profile_id()
    )
  );

create policy "Users can modify templates in their workspaces"
  on public.prompt_templates for all
  using (
    workspace_id in (
      select workspace_id from public.memberships
      where profile_id = public.get_current_profile_id()
      and role in ('owner', 'admin', 'member')
    )
  );
