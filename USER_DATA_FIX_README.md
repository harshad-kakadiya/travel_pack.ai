# Admin Dashboard User Data Fix

## Problem
The admin dashboard shows "Users in table: 0" and "No users found" even though the stats show 5 total users. This happens because:

1. **Missing RLS Policies**: The `user_emails` table has Row Level Security (RLS) enabled but **no policies defined**
2. **No Access**: Without policies, even the admin service role cannot access the user data
3. **Users Exist**: Users are being created in the `user_emails` table via the payment verification process, but they're not visible due to missing policies

## Root Cause
In `supabase/migrations/20250922150539_raspy_coral.sql`, the `user_emails` table has RLS enabled:
```sql
ALTER TABLE user_emails ENABLE ROW LEVEL SECURITY;
```

But no policies were created to allow access to the data.

## Solution
Run the SQL script `FIX_USER_POLICIES.sql` in your Supabase SQL Editor to add the necessary policies.

## Steps to Fix

1. **Open Supabase Dashboard**
   - Go to your Supabase project dashboard
   - Navigate to SQL Editor

2. **Run the Fix Script**
   - Copy the contents of `FIX_USER_POLICIES.sql`
   - Paste into SQL Editor
   - Click "Run" to execute

3. **Verify the Fix**
   - The script will show a list of created policies at the end
   - You should see policies for `user_emails`, `pending_sessions`, and `travel_briefs` tables

4. **Test the Admin Dashboard**
   - Refresh your admin dashboard
   - The user table should now show the actual users
   - Debug info should show correct user counts

## What the Fix Does

The script adds policies to allow:
- **Service role** (admin API) to read/write all user data
- **Authenticated users** to insert/update their own records
- **Proper access** to related tables (`pending_sessions`, `travel_briefs`)

## Files Created
- `FIX_USER_POLICIES.sql` - SQL script to fix the policies
- `supabase/migrations/20250131000000_fix_user_emails_policies.sql` - Migration file for future deployments

## Verification
After running the fix, you should see:
- ✅ Users in table: [actual count]
- ✅ User data displayed in the admin dashboard table
- ✅ All user statistics showing correct numbers