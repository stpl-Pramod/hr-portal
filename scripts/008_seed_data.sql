-- Insert default leave types
insert into public.leave_types (name, description, max_days_per_year, carry_forward, color) values
('Annual Leave', 'Yearly vacation leave', 21, true, '#10b981'),
('Sick Leave', 'Medical leave', 10, false, '#ef4444'),
('Personal Leave', 'Personal time off', 5, false, '#f59e0b'),
('Maternity Leave', 'Maternity leave', 90, false, '#ec4899'),
('Paternity Leave', 'Paternity leave', 15, false, '#8b5cf6'),
('Emergency Leave', 'Emergency situations', 3, false, '#dc2626')
on conflict (name) do nothing;

-- Insert default departments
insert into public.departments (name, description) values
('Human Resources', 'HR department managing employee relations'),
('Engineering', 'Software development and technical teams'),
('Marketing', 'Marketing and brand management'),
('Sales', 'Sales and business development'),
('Finance', 'Financial planning and accounting'),
('Operations', 'Business operations and support')
on conflict (name) do nothing;
