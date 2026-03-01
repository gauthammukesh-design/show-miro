-- triggers.sql

-- 1. Create the function that will handle provisioning
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
declare
  new_workspace_id uuid;
  new_profile_id uuid;
begin
  -- Create a new workspace for the user
  insert into public.workspaces (owner_id, name)
  values (new.id, coalesce(new.raw_user_meta_data->>'full_name', new.email) || '''s Workspace')
  returning id into new_workspace_id;

  -- Create the profile with the default workspace linked
  insert into public.profiles (user_id, email, workspace_id)
  values (new.id, new.email, new_workspace_id)
  returning id into new_profile_id;

  -- Add the user as an owner to their new workspace
  insert into public.memberships (profile_id, workspace_id, role)
  values (new_profile_id, new_workspace_id, 'owner');

  return new;
end;
$$;

-- 2. Create the trigger on auth.users
-- Drop if exists to allow re-running this script
drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
