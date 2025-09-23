# Email Verification Testing Plan

## 🚀 Current Status
- ✅ Database RLS fix applied successfully
- ✅ User registration now works
- ✅ Development server running on http://localhost:3002
- ⏳ Email delivery testing in progress

## 🧪 Testing Steps

### Step 1: Update Environment for New Port
Since the server is on port 3002, we need to update the redirect URL:

1. **Update .env.local**:
```
NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL=http://localhost:3002/auth/callback
```

2. **Update Supabase Dashboard** → Authentication → URL Configuration:
   - Add: `http://localhost:3002/auth/callback`
   - Update Site URL to: `http://localhost:3002`

### Step 2: Test Registration Flow
1. **Open**: http://localhost:3002/auth/register
2. **Fill out registration form** with:
   - Your real email address
   - Strong password
   - Valid employee information
3. **Submit registration**
4. **Verify redirect** to verification page

### Step 3: Check Email Delivery
1. **Check your email inbox** (including spam/junk folder)
2. **Look for email from**: Supabase or your project domain
3. **Subject should be**: Something like "Confirm your signup"
4. **Email should contain**: Verification link

### Step 4: Test Verification Link
1. **Click verification link** in email
2. **Should redirect** to: http://localhost:3002/auth/callback
3. **Then redirect** to: dashboard or login page
4. **Test login** with registered credentials

### Step 5: Troubleshooting if Email Doesn't Arrive

#### Check Supabase Configuration
1. Go to: https://supabase.com/dashboard/project/hvegmmsygtwfafieejdp
2. Navigate to: **Authentication** → **Settings**
3. Verify:
   - Enable email confirmations: ✅ ON
   - Custom SMTP: Check if configured
   - Rate limits: Not exceeded

#### Check URL Configuration
1. Navigate to: **Authentication** → **URL Configuration**
2. Verify redirect URLs include:
   - `http://localhost:3002/auth/callback`
   - `http://localhost:3002/auth/verify`

#### Check Email Templates
1. Navigate to: **Authentication** → **Email Templates**
2. Verify "Confirm signup" template:
   - Is enabled ✅
   - Contains `{{ .ConfirmationURL }}`
   - Has appropriate subject/content

#### Check Logs
1. Navigate to: **Logs** → **Auth Logs**
2. Look for recent events:
   - User signup events
   - Email sending attempts
   - Any error messages

## 🔧 Quick Fixes

### If Email Still Doesn't Send
1. **Try different email provider** (Gmail, Yahoo, Outlook)
2. **Check Supabase status**: https://status.supabase.com
3. **Enable custom SMTP** with reliable provider:
   - SendGrid (recommended for development)
   - Mailgun
   - Amazon SES

### Common Email Issues
- **Spam folder**: Always check spam/junk
- **Corporate email**: May have strict filtering
- **Rate limits**: Wait 5-10 minutes between attempts
- **Template issues**: Use default template first

## 📊 Expected Results

### Successful Flow:
1. User submits registration ✅
2. Sees "Verification email sent!" message ✅
3. Receives email within 1-5 minutes ⏳
4. Clicks verification link
5. Gets redirected to dashboard
6. Can log in successfully

### Current Status:
- Registration: ✅ **WORKING**
- Email sending: ⏳ **TESTING NEEDED**
- Email delivery: ❓ **TO BE VERIFIED**

## 🎯 Next Actions

1. **Update environment** for port 3002
2. **Test registration** with real email
3. **Check Supabase settings** if email doesn't arrive
4. **Report results** for further troubleshooting

---

**Ready to test**: http://localhost:3002/auth/register