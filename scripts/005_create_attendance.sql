-- Create attendance table
create table if not exists public.attendance (
  id uuid primary key default gen_random_uuid(),
  employee_id uuid not null references public.profiles(id) on delete cascade,
  date date not null,
  check_in timestamp with time zone,
  check_out timestamp with time zone,
  break_start timestamp with time zone,
  break_end timestamp with time zone,
  total_hours decimal(4,2),
  status text not null default 'present' check (status in ('present', 'absent', 'late', 'half_day', 'on_leave')),
  notes text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(employee_id, date)
);

-- Enable RLS
alter table public.attendance enable row level security;

-- RLS Policies for attendance
create policy "attendance_select_own_or_managed"
  on public.attendance for select
  using (
    auth.uid() = employee_id OR
    exists (
      select 1 from public.profiles p1, public.profiles p2
      where p1.id = auth.uid() 
      and p2.id = attendance.employee_id
      and (p1.id = p2.manager_id or p1.role in ('hr_admin', 'super_admin'))
    )
  );

create policy "attendance_insert_own_or_hr"
  on public.attendance for insert
  with check (
    auth.uid() = employee_id OR
    exists (
      select 1 from public.profiles 
      where id = auth.uid() and role in ('hr_admin', 'super_admin')
    )
  );

create policy "attendance_update_own_or_hr"
  on public.attendance for update
  using (
    auth.uid() = employee_id OR
    exists (
      select 1 from public.profiles 
      where id = auth.uid() and role in ('hr_admin', 'super_admin')
    )
  );

create trigger attendance_updated_at
  before update on public.attendance
  for each row
  execute function public.handle_updated_at();
