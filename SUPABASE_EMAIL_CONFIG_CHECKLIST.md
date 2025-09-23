# Supabase Email Configuration Checklist

## Access Your Supabase Dashboard
🔗 **Dashboard URL**: https://supabase.com/dashboard/project/hvegmmsygtwfafieejdp

## ✅ Configuration Steps to Check

### 1. Authentication Settings
Navigate to: **Authentication > Settings**

#### SMTP Settings Section
- [ ] **Enable email confirmations** - Should be ON
- [ ] **Enable custom SMTP** - Check if enabled
- [ ] **SMTP Server details** - If using custom SMTP:
  - Server address
  - Port (usually 587 or 465)
  - Username/Password
  - TLS/SSL settings

**Default Behavior**: If custom SMTP is NOT configured, Supabase uses their built-in email service (which should work for development).

#### Email Rate Limits
- [ ] Check if rate limits are reasonable
- [ ] Ensure you haven't hit daily/hourly limits

### 2. URL Configuration
Navigate to: **Authentication > URL Configuration**

#### Redirect URLs
- [ ] Add: `http://localhost:3000/auth/callback`
- [ ] Add: `http://localhost:3000/auth/verify`
- [ ] Check if `https://` versions are also needed for production

#### Site URL
- [ ] Set to: `http://localhost:3000` (for development)

### 3. Email Templates
Navigate to: **Authentication > Email Templates**

#### Confirm Signup Template
- [ ] **Template is enabled** ✅
- [ ] **Subject line** looks appropriate
- [ ] **Email body** contains verification link
- [ ] **From email** is set correctly

**Default Template Should Include**:
```html
<h2>Confirm your signup</h2>
<p>Follow this link to confirm your user:</p>
<a href="{{ .ConfirmationURL }}">Confirm your mail</a>
```

### 4. Auth Providers
Navigate to: **Authentication > Providers**

#### Email Provider
- [ ] **Email** provider is enabled
- [ ] **Confirm email** toggle is ON
- [ ] **Secure email change** is configured appropriately

## 🧪 Testing Email Delivery

### Option 1: Use Your Real Email
1. Go to: http://localhost:3000/auth/register
2. Register with your actual email address
3. Check inbox AND spam folder
4. Look for email from Supabase

### Option 2: Check Supabase Logs
1. Go to: **Logs > Auth Logs** in Supabase Dashboard
2. Look for recent email sending events
3. Check for any error messages

### Option 3: Test with Different Email Providers
Try registering with:
- [ ] Gmail account
- [ ] Yahoo account  
- [ ] Outlook account
- [ ] Company email (if available)

## 🚨 Common Issues & Solutions

### Issue: "Email sent but not received"
**Possible Causes**:
1. **Spam folder** - Check spam/junk folders
2. **Email rate limits** - Wait and try again
3. **Invalid SMTP config** - Verify SMTP settings
4. **Blocked domain** - Some email providers block certain senders

**Solutions**:
1. Check spam folders thoroughly
2. Verify SMTP configuration if using custom provider
3. Try different email providers
4. Check Supabase logs for delivery errors

### Issue: "Email template not working"
**Solutions**:
1. Verify template is enabled
2. Check template syntax
3. Ensure `{{ .ConfirmationURL }}` placeholder exists
4. Test with default template first

### Issue: "Rate limit exceeded"
**Solutions**:
1. Wait for rate limit reset
2. Upgrade Supabase plan if needed
3. Configure custom SMTP for higher limits

## 📋 Quick Verification Steps

1. **Check Authentication Settings** ✅
   - Email confirmations enabled
   - SMTP configured (or using default)
   
2. **Verify URL Configuration** ✅
   - Redirect URLs include localhost:3000
   - Site URL is set correctly
   
3. **Confirm Email Templates** ✅
   - Signup confirmation template enabled
   - Template contains confirmation link
   
4. **Test Email Delivery** ✅
   - Register with real email
   - Check inbox and spam
   - Verify link works

## 🎯 Expected Result

After configuring everything correctly:
1. User registers successfully ✅ (Already working!)
2. Verification email arrives in inbox
3. User clicks verification link
4. User is redirected to dashboard
5. User can log in normally

## 📞 If Still Having Issues

If emails still don't arrive after checking all settings:

1. **Enable custom SMTP** with a reliable provider:
   - SendGrid (free tier available)
   - Mailgun (free tier available)
   - Amazon SES
   - Gmail SMTP

2. **Check Supabase status**: https://status.supabase.com
   - Verify email service is operational

3. **Contact Supabase support** if using their email service
   - They can check server-side delivery logs

---

**Status**: Registration is working ✅ | Email delivery configuration in progress ⏳