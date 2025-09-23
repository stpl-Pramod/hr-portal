-- Create salary slips table
create table if not exists public.salary_slips (
  id uuid primary key default gen_random_uuid(),
  employee_id uuid not null references public.profiles(id) on delete cascade,
  month integer not null check (month >= 1 and month <= 12),
  year integer not null,
  basic_salary decimal(10,2) not null,
  allowances decimal(10,2) default 0,
  deductions decimal(10,2) default 0,
  gross_salary decimal(10,2) not null,
  tax_deduction decimal(10,2) default 0,
  net_salary decimal(10,2) not null,
  status text not null default 'draft' check (status in ('draft', 'generated', 'sent')),
  generated_at timestamp with time zone,
  sent_at timestamp with time zone,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(employee_id, month, year)
);

-- Enable RLS
alter table public.salary_slips enable row level security;

-- RLS Policies for salary slips
create policy "salary_slips_select_own_or_hr"
  on public.salary_slips for select
  using (
    auth.uid() = employee_id OR
    exists (
      select 1 from public.profiles 
      where id = auth.uid() and role in ('hr_admin', 'super_admin')
    )
  );

create policy "salary_slips_insert_hr_admin"
  on public.salary_slips for insert
  with check (
    exists (
      select 1 from public.profiles 
      where id = auth.uid() and role in ('hr_admin', 'super_admin')
    )
  );

create policy "salary_slips_update_hr_admin"
  on public.salary_slips for update
  using (
    exists (
      select 1 from public.profiles 
      where id = auth.uid() and role in ('hr_admin', 'super_admin')
    )
  );

create trigger salary_slips_updated_at
  before update on public.salary_slips
  for each row
  execute function public.handle_updated_at();
