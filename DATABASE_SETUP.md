# 🗄️ Database Setup Guide

## Step 1: Access Supabase SQL Editor

1. Go to your Supabase Dashboard
2. Navigate to **SQL Editor** in the left sidebar
3. Click **New Query**

## Step 2: Execute SQL Scripts in Order

**IMPORTANT**: Run these scripts in the exact order listed below:

### 1. Create Profiles Table
```sql
-- Copy and paste the content from: scripts/001_create_profiles.sql
-- This creates the main profiles table with user information
```

### 2. Create Departments Table
```sql
-- Copy and paste the content from: scripts/002_create_departments.sql
-- This creates the departments lookup table
```

### 3. Create Leave Types Table
```sql
-- Copy and paste the content from: scripts/003_create_leave_types.sql
-- This creates leave types (vacation, sick, personal, etc.)
```

### 4. Create Leave Requests Table
```sql
-- Copy and paste the content from: scripts/004_create_leave_requests.sql
-- This creates the leave requests table
```

### 5. Create Attendance Table
```sql
-- Copy and paste the content from: scripts/005_create_attendance.sql
-- This creates the attendance tracking table
```

### 6. Create Salary Slips Table
```sql
-- Copy and paste the content from: scripts/006_create_salary_slips.sql
-- This creates the salary/payroll table
```

### 7. Create Notifications Table
```sql
-- Copy and paste the content from: scripts/007_create_notifications.sql
-- This creates the notifications system
```

### 8. Insert Seed Data
```sql
-- Copy and paste the content from: scripts/008_seed_data.sql
-- This adds initial data (departments, leave types, etc.)
```

### 9. Create Profile Trigger
```sql
-- Copy and paste the content from: scripts/009_create_profile_trigger.sql
-- This automatically creates profiles for new users
```

## Step 3: Verify Setup

After running all scripts, verify in the **Table Editor**:

- ✅ **profiles** table exists
- ✅ **departments** table exists with sample data
- ✅ **leave_types** table exists with sample data
- ✅ **leave_requests** table exists
- ✅ **attendance** table exists
- ✅ **salary_slips** table exists
- ✅ **notifications** table exists

## Step 4: Test RLS Policies

1. Go to **Authentication → Policies**
2. Verify that Row Level Security policies are active
3. Check that each table has appropriate policies

## Quick Setup Script (Advanced Users)

If you prefer to run everything at once, you can combine all scripts:

```sql
-- Run each script content in sequence
-- 001_create_profiles.sql content here
-- 002_create_departments.sql content here
-- ... and so on
```

## Troubleshooting

### Common Issues:
- **"relation already exists"**: Table already created, safe to ignore
- **"permission denied"**: Check that you're the project owner
- **"column does not exist"**: Make sure scripts run in correct order

### Reset Database (if needed):
```sql
-- CAUTION: This will delete all data
DROP SCHEMA IF EXISTS public CASCADE;
CREATE SCHEMA public;
GRANT USAGE ON SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON SCHEMA public TO postgres, service_role;
```