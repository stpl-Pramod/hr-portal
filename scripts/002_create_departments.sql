-- Create departments table
create table if not exists public.departments (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  description text,
  head_id uuid references public.profiles(id),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.departments enable row level security;

-- RLS Policies for departments
create policy "departments_select_all"
  on public.departments for select
  using (true);

create policy "departments_insert_hr_admin"
  on public.departments for insert
  with check (
    exists (
      select 1 from public.profiles 
      where id = auth.uid() and role in ('hr_admin', 'super_admin')
    )
  );

create policy "departments_update_hr_admin"
  on public.departments for update
  using (
    exists (
      select 1 from public.profiles 
      where id = auth.uid() and role in ('hr_admin', 'super_admin')
    )
  );

create policy "departments_delete_hr_admin"
  on public.departments for delete
  using (
    exists (
      select 1 from public.profiles 
      where id = auth.uid() and role in ('hr_admin', 'super_admin')
    )
  );

create trigger departments_updated_at
  before update on public.departments
  for each row
  execute function public.handle_updated_at();
