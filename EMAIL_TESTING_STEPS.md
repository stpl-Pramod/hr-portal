# Step-by-Step Guide: Email Testing & Supabase Error Checking

## 📧 Step 1: Test Different Email Providers

### 1.1 Gmail Testing
1. **Go to**: http://localhost:3002/auth/register
2. **Fill out the form** with a Gmail address:
   ```
   Email: your-gmail-address@gmail.com
   First Name: Test
   Last Name: User
   Department: Engineering
   Position: Developer
   Password: (strong password)
   Confirm Password: (same password)
   ```
3. **Click "Create Account"**
4. **Check Gmail inbox**:
   - Check main inbox
   - Check "Promotions" tab
   - Check "Spam" folder
   - Check "All Mail" for any Supabase emails
5. **Wait up to 5 minutes** for email delivery

### 1.2 Yahoo Testing
1. **Repeat registration** with Yahoo email:
   ```
   Email: your-yahoo-address@yahoo.com
   ```
2. **Check Yahoo Mail**:
   - Check inbox
   - Check spam folder
   - Look for emails from Supabase or your project domain

### 1.3 Outlook/Hotmail Testing
1. **Repeat registration** with Microsoft email:
   ```
   Email: your-outlook-address@outlook.com
   # or @hotmail.com
   ```
2. **Check Outlook**:
   - Check inbox
   - Check "Junk Email" folder
   - Check "Other" folder if using focused inbox

### 1.4 Corporate Email Testing (if available)
1. **Try work email** if you have one
2. **Note**: Corporate emails often have strict filtering
3. **Check with IT** if emails don't arrive

## 🔍 Step 2: Check Supabase Dashboard for Errors

### 2.1 Access Supabase Dashboard
1. **Open**: https://supabase.com/dashboard/project/hvegmmsygtwfafieejdp
2. **Login** to your Supabase account
3. **Select your project** (should be hvegmmsygtwfafieejdp)

### 2.2 Check Authentication Logs
1. **Navigate to**: "Logs" → "Auth Logs" (left sidebar)
2. **Look for recent events** (last 30 minutes):
   ```
   Events to look for:
   - user.signup
   - email.confirmation_sent
   - email.delivery_failed
   - email.bounce
   - email.complaint
   ```
3. **Click on each event** to see details
4. **Note any error messages** or failed deliveries

### 2.3 Check Real-time Logs
1. **Navigate to**: "Logs" → "Logs Explorer"
2. **Filter by**:
   - **Level**: Error, Warning
   - **Time range**: Last hour
3. **Search for keywords**:
   ```
   - "email"
   - "smtp"
   - "delivery"
   - "failed"
   - "bounce"
   ```

### 2.4 Check Authentication Settings
1. **Navigate to**: "Authentication" → "Settings"
2. **Verify Email Settings**:
   ```
   ✅ Check: Enable email confirmations
   ✅ Check: Custom SMTP settings (if any)
   ❓ Note: Rate limits and current usage
   ```
3. **Screenshot settings** if needed for troubleshooting

### 2.5 Check URL Configuration
1. **Navigate to**: "Authentication" → "URL Configuration"
2. **Verify Redirect URLs include**:
   ```
   ✅ http://localhost:3002/auth/callback
   ✅ http://localhost:3002/auth/verify
   ```
3. **Verify Site URL**:
   ```
   ✅ http://localhost:3002
   ```
4. **Add missing URLs** if needed

### 2.6 Check Email Templates
1. **Navigate to**: "Authentication" → "Email Templates"
2. **Check "Confirm signup" template**:
   ```
   ✅ Template is enabled
   ✅ Subject line exists
   ✅ Body contains {{ .ConfirmationURL }}
   ✅ From email is configured
   ```
3. **Test with default template** if custom template has issues

## 🧪 Step 3: Systematic Testing Process

### 3.1 Test Matrix
Create a test for each email provider:

| Email Provider | Registration Success | Email Received | Time to Arrive | Link Works |
|---------------|---------------------|----------------|----------------|------------|
| Gmail         | ✅/❌              | ✅/❌          | ___ minutes    | ✅/❌      |
| Yahoo         | ✅/❌              | ✅/❌          | ___ minutes    | ✅/❌      |
| Outlook       | ✅/❌              | ✅/❌          | ___ minutes    | ✅/❌      |
| Corporate     | ✅/❌              | ✅/❌          | ___ minutes    | ✅/❌      |

### 3.2 Document Results
For each test, record:
```
Email Provider: Gmail
Registration Time: 14:30:25
Email Received: Yes/No
Arrival Time: 14:32:15 (2 minutes delay)
Email Location: Inbox/Spam/Promotions
Verification Link: Works/Broken
Error Messages: None/[specific error]
```

## 🚨 Step 4: Common Issues & Solutions

### 4.1 If No Emails Arrive (Any Provider)
**Check Supabase Dashboard**:
1. **Auth Logs** → Look for `email.confirmation_sent` events
2. **If no send events**: Email service not configured
3. **If send events exist**: Delivery issue

**Possible Solutions**:
- Enable custom SMTP in Supabase
- Check Supabase service status
- Contact Supabase support

### 4.2 If Emails Go to Spam
**Solutions**:
1. **Setup SPF/DKIM** records (for production)
2. **Use custom SMTP** with reputation
3. **Add sender to contacts** before testing

### 4.3 If Registration Fails
**Check**:
1. **Browser console** for JavaScript errors
2. **Network tab** for failed API calls
3. **Supabase logs** for database errors

## 📋 Step 5: Quick Diagnostic Commands

Run these in your terminal for quick checks:

```bash
# Check current configuration
cd /home/pramod-bhamare/Downloads/hr-portal
echo "Redirect URL: $(grep REDIRECT .env.local)"

# Test registration programmatically
node test-updated-config.js

# Check server logs
# (Look at the terminal running npm run dev)
```

## 📊 Step 6: Report Template

Use this template to report your findings:

```
## Email Testing Results

### Configuration
- Server URL: http://localhost:3002
- Redirect URL: http://localhost:3002/auth/callback
- Supabase Project: hvegmmsygtwfafieejdp

### Email Provider Tests
1. **Gmail**: [Success/Failed] - [Email received: Yes/No] - [Time: X minutes]
2. **Yahoo**: [Success/Failed] - [Email received: Yes/No] - [Time: X minutes]
3. **Outlook**: [Success/Failed] - [Email received: Yes/No] - [Time: X minutes]

### Supabase Dashboard Findings
- **Auth Logs**: [Found/No] email.confirmation_sent events
- **Errors**: [None/List specific errors]
- **Settings**: [All correct/Issues found]

### Next Steps Needed
- [List any issues that need fixing]
- [Specific error messages to investigate]
```

---

**Start with Gmail testing first**, as it's most commonly used and has good spam detection. Then check the Supabase Dashboard logs immediately after each registration attempt to see if emails are being sent from Supabase's side.