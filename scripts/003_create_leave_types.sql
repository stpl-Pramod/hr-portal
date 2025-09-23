-- Create leave types table
create table if not exists public.leave_types (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  description text,
  max_days_per_year integer not null default 0,
  carry_forward boolean default false,
  requires_approval boolean default true,
  color text default '#3b82f6',
  is_active boolean default true,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.leave_types enable row level security;

-- RLS Policies for leave types
create policy "leave_types_select_all"
  on public.leave_types for select
  using (true);

create policy "leave_types_insert_hr_admin"
  on public.leave_types for insert
  with check (
    exists (
      select 1 from public.profiles 
      where id = auth.uid() and role in ('hr_admin', 'super_admin')
    )
  );

create policy "leave_types_update_hr_admin"
  on public.leave_types for update
  using (
    exists (
      select 1 from public.profiles 
      where id = auth.uid() and role in ('hr_admin', 'super_admin')
    )
  );

create policy "leave_types_delete_hr_admin"
  on public.leave_types for delete
  using (
    exists (
      select 1 from public.profiles 
      where id = auth.uid() and role in ('hr_admin', 'super_admin')
    )
  );

create trigger leave_types_updated_at
  before update on public.leave_types
  for each row
  execute function public.handle_updated_at();
