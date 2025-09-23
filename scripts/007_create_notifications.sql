-- Create notifications table
create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  recipient_id uuid not null references public.profiles(id) on delete cascade,
  title text not null,
  message text not null,
  type text not null check (type in ('birthday', 'leave_request', 'leave_approved', 'leave_rejected', 'attendance', 'salary', 'general')),
  is_read boolean default false,
  action_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.notifications enable row level security;

-- RLS Policies for notifications
create policy "notifications_select_own"
  on public.notifications for select
  using (auth.uid() = recipient_id);

create policy "notifications_insert_hr_or_manager"
  on public.notifications for insert
  with check (
    exists (
      select 1 from public.profiles 
      where id = auth.uid() and role in ('hr_admin', 'super_admin', 'team_lead')
    )
  );

create policy "notifications_update_own"
  on public.notifications for update
  using (auth.uid() = recipient_id);

create policy "notifications_delete_own"
  on public.notifications for delete
  using (auth.uid() = recipient_id);
