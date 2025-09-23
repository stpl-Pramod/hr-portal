# 🧪 Testing Checklist

## Pre-Testing Requirements

### ✅ Environment Setup
- [ ] Supabase credentials added to `.env.local`
- [ ] Development server restarted after environment changes
- [ ] Database tables created via SQL scripts
- [ ] Seed data inserted

### ✅ Database Verification
- [ ] Navigate to Supabase → Table Editor
- [ ] Verify all tables exist:
  - [ ] `profiles`
  - [ ] `departments` 
  - [ ] `leave_types`
  - [ ] `leave_requests`
  - [ ] `attendance`
  - [ ] `salary_slips`
  - [ ] `notifications`
- [ ] Check sample data exists in `departments` and `leave_types`

## Testing Workflow

### 1. Basic Application Load
```bash
npm run dev
```
- [ ] Application starts without errors
- [ ] No console errors in browser
- [ ] Redirects to login page when not authenticated

### 2. Authentication Flow
- [ ] **Registration**: Can create new account
- [ ] **Email Verification**: Receives confirmation email
- [ ] **Login**: Can login with verified account
- [ ] **Auto-redirect**: Redirects to dashboard after login
- [ ] **Profile Creation**: Profile automatically created via trigger

### 3. Dashboard Functionality
- [ ] **Dashboard Loads**: Main dashboard displays
- [ ] **User Profile**: Shows correct user information
- [ ] **Navigation**: Sidebar navigation works
- [ ] **Stats Cards**: Display user statistics
- [ ] **Quick Actions**: Action buttons functional

### 4. Core Features
- [ ] **Profile Management**: Can edit profile
- [ ] **Password Change**: Can change password
- [ ] **Leave Requests**: Can submit leave requests
- [ ] **Leave History**: Can view leave request history
- [ ] **Attendance**: Can view attendance records

### 5. Admin Features (if applicable)
- [ ] **Employee Management**: Can view all employees
- [ ] **Leave Approvals**: Can approve/reject leave requests
- [ ] **Reports**: Can generate reports

### 6. Error Handling
- [ ] **Network Errors**: Displays user-friendly messages
- [ ] **Validation Errors**: Form validation works
- [ ] **Error Boundaries**: Catches and displays React errors
- [ ] **Loading States**: Shows loading indicators

### 7. Responsive Design
- [ ] **Mobile**: Works on mobile devices
- [ ] **Tablet**: Works on tablet devices
- [ ] **Desktop**: Works on desktop

## Common Issues & Fixes

### Issue: "NetworkError when attempting to fetch resource"
**Solution**: Check `.env.local` has correct Supabase credentials

### Issue: "relation 'profiles' does not exist"
**Solution**: Run database setup SQL scripts

### Issue: "Row Level Security policy violation"
**Solution**: Ensure RLS policies are created via SQL scripts

### Issue: Login redirects to same page
**Solution**: Check middleware and auth flow

### Issue: Profile not created after registration
**Solution**: Verify trigger function is created (script 009)

## Performance Checklist
- [ ] **Initial Load**: < 3 seconds
- [ ] **Navigation**: < 1 second between pages
- [ ] **Form Submission**: < 2 seconds
- [ ] **No Memory Leaks**: No increasing memory usage

## Security Checklist
- [ ] **Authentication Required**: All protected routes require auth
- [ ] **Role-based Access**: Users only see what they should
- [ ] **Data Isolation**: Users only see their own data
- [ ] **HTTPS**: Production uses HTTPS

## Production Readiness
- [ ] **Build Success**: `npm run build` completes without errors
- [ ] **Type Safety**: No TypeScript errors
- [ ] **Linting**: No ESLint errors
- [ ] **Environment Variables**: Production variables set

## Documentation
- [ ] **README Updated**: Instructions for setup
- [ ] **Environment Variables**: Documented
- [ ] **Database Schema**: Documented
- [ ] **API Endpoints**: Documented (if any)

## Sign-off
- [ ] **Developer Testing**: All features tested
- [ ] **User Acceptance**: Basic user flows tested
- [ ] **Performance**: Meets performance requirements
- [ ] **Security**: Security checklist completed
- [ ] **Ready for Production**: All checks passed