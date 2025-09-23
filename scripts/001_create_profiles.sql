-- Create profiles table for user management
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  employee_id text unique not null,
  first_name text not null,
  last_name text not null,
  email text not null,
  phone text,
  department text not null,
  position text not null,
  role text not null check (role in ('employee', 'team_lead', 'hr_admin', 'super_admin')),
  manager_id uuid references public.profiles(id),
  hire_date date not null,
  salary decimal(10,2),
  status text not null default 'active' check (status in ('active', 'inactive', 'terminated')),
  avatar_url text,
  address text,
  emergency_contact_name text,
  emergency_contact_phone text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.profiles enable row level security;

-- RLS Policies for profiles
create policy "profiles_select_own_or_managed"
  on public.profiles for select
  using (
    auth.uid() = id OR 
    auth.uid() = manager_id OR
    exists (
      select 1 from public.profiles 
      where id = auth.uid() and role in ('hr_admin', 'super_admin')
    )
  );

create policy "profiles_insert_hr_admin"
  on public.profiles for insert
  with check (
    exists (
      select 1 from public.profiles 
      where id = auth.uid() and role in ('hr_admin', 'super_admin')
    )
  );

create policy "profiles_update_own_or_hr"
  on public.profiles for update
  using (
    auth.uid() = id OR
    exists (
      select 1 from public.profiles 
      where id = auth.uid() and role in ('hr_admin', 'super_admin')
    )
  );

create policy "profiles_delete_hr_admin"
  on public.profiles for delete
  using (
    exists (
      select 1 from public.profiles 
      where id = auth.uid() and role in ('hr_admin', 'super_admin')
    )
  );

-- Create updated_at trigger
create or replace function public.handle_updated_at()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  new.updated_at = timezone('utc'::text, now());
  return new;
end;
$$;

create trigger profiles_updated_at
  before update on public.profiles
  for each row
  execute function public.handle_updated_at();
