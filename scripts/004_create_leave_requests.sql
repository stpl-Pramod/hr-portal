-- Create leave requests table
create table if not exists public.leave_requests (
  id uuid primary key default gen_random_uuid(),
  employee_id uuid not null references public.profiles(id) on delete cascade,
  leave_type_id uuid not null references public.leave_types(id),
  start_date date not null,
  end_date date not null,
  days_requested integer not null,
  reason text,
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected', 'cancelled')),
  approved_by uuid references public.profiles(id),
  approved_at timestamp with time zone,
  rejection_reason text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.leave_requests enable row level security;

-- RLS Policies for leave requests
create policy "leave_requests_select_own_or_managed"
  on public.leave_requests for select
  using (
    auth.uid() = employee_id OR
    exists (
      select 1 from public.profiles p1, public.profiles p2
      where p1.id = auth.uid() 
      and p2.id = leave_requests.employee_id
      and (p1.id = p2.manager_id or p1.role in ('hr_admin', 'super_admin'))
    )
  );

create policy "leave_requests_insert_own"
  on public.leave_requests for insert
  with check (auth.uid() = employee_id);

create policy "leave_requests_update_own_or_manager"
  on public.leave_requests for update
  using (
    auth.uid() = employee_id OR
    exists (
      select 1 from public.profiles p1, public.profiles p2
      where p1.id = auth.uid() 
      and p2.id = leave_requests.employee_id
      and (p1.id = p2.manager_id or p1.role in ('hr_admin', 'super_admin'))
    )
  );

create policy "leave_requests_delete_own"
  on public.leave_requests for delete
  using (auth.uid() = employee_id and status = 'pending');

create trigger leave_requests_updated_at
  before update on public.leave_requests
  for each row
  execute function public.handle_updated_at();
