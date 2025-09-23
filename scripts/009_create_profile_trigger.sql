-- Create trigger to auto-create profile on user signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  -- Insert profile with security definer to bypass RLS
  insert into public.profiles (
    id, 
    employee_id, 
    first_name, 
    last_name, 
    email, 
    department, 
    position, 
    role, 
    hire_date
  )
  values (
    new.id,
    'EMP' || to_char(extract(epoch from now()), 'FM999999999'),
    coalesce(new.raw_user_meta_data ->> 'first_name', 'New'),
    coalesce(new.raw_user_meta_data ->> 'last_name', 'Employee'),
    new.email,
    coalesce(new.raw_user_meta_data ->> 'department', 'Engineering'),
    coalesce(new.raw_user_meta_data ->> 'position', 'Employee'),
    coalesce(new.raw_user_meta_data ->> 'role', 'employee'),
    current_date
  )
  on conflict (id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute function public.handle_new_user();
