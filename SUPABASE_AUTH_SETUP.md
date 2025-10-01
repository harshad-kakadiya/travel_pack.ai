# Supabase Authentication Setup Guide

This guide will help you set up Supabase authentication for your TravelPack.ai project.

## 1. Supabase Dashboard Configuration

### Enable Authentication
1. Go to your Supabase project dashboard
2. Navigate to **Authentication** > **Settings**
3. Enable the following providers:
   - **Email** (already enabled by default)
   - **Google** (optional, for OAuth)

### Configure Email Authentication
1. In **Authentication** > **Settings**, scroll to **Email Auth**
2. Enable **Enable email confirmations** (recommended)
3. Configure **Email templates** if needed

### Configure Site URL
1. In **Authentication** > **Settings**, set **Site URL** to your domain
2. Add **Redirect URLs**:
   - `https://your-domain.com/reset-password`

## 2. Environment Variables

Make sure your `.env` file contains:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## 3. Database Setup (Optional)

If you want to store additional user data, create a `profiles` table:

```sql
-- Create profiles table
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  PRIMARY KEY (id)
);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Create policy for users to see their own profile
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

-- Create policy for users to update their own profile
CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- Create policy for users to insert their own profile
CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);
```

## 4. Features Implemented

### Authentication Features
- ✅ Email/Password sign up
- ✅ Email/Password sign in
- ✅ Password reset via email
- ✅ Protected routes
- ✅ User profile management
- ✅ Session persistence
- ✅ Automatic token refresh
- ✅ Single sign-in button with sign-up link

### Components Created
- `AuthContext` - Authentication state management
- `AuthModal` - Sign in/Sign up modal with integrated flow
- `UserProfile` - User profile modal
- `ProtectedRoute` - Route protection wrapper
- `ResetPassword` - Password reset page

### Protected Routes
- `/plan` - Main planning page (requires authentication)

## 5. Usage

### For Users
1. Click "Sign In" button to open authentication modal
2. Click "Sign up here" link in the modal to create an account
3. After successful signup, you'll be redirected to sign-in form
4. Use "Forgot Password" to reset password
5. Access protected features like trip planning

### For Developers
```typescript
import { useAuth } from './context/AuthContext';

function MyComponent() {
  const { user, signIn, signOut, loading } = useAuth();
  
  if (loading) return <div>Loading...</div>;
  
  return (
    <div>
      {user ? (
        <div>
          <p>Welcome, {user.email}!</p>
          <button onClick={signOut}>Sign Out</button>
        </div>
      ) : (
        <button onClick={() => signIn('email', 'password')}>
          Sign In
        </button>
      )}
    </div>
  );
}
```

## 6. Testing

1. Start your development server
2. Navigate to your app
3. Try signing up with a new account
4. Check your email for confirmation (if enabled)
5. Sign in with your credentials
6. Try accessing protected routes
7. Test password reset functionality

## 7. Troubleshooting

### Common Issues
1. **"Supabase not initialized" error**: Check your environment variables
2. **OAuth redirect issues**: Verify redirect URLs in Supabase dashboard
3. **Email not sending**: Check Supabase email settings and SMTP configuration
4. **Session not persisting**: Ensure `persistSession: true` in Supabase client config

### Debug Mode
Enable debug logging by adding to your Supabase client config:
```typescript
createClient(url, anon, {
  auth: {
    debug: true
  }
});
```

## 8. Security Considerations

1. Always use HTTPS in production
2. Configure proper CORS settings
3. Use Row Level Security (RLS) for database tables
4. Regularly rotate API keys
5. Monitor authentication logs in Supabase dashboard

## 9. Next Steps

Consider implementing:
- User profile management
- Role-based access control
- Social login providers (GitHub, Facebook, etc.)
- Multi-factor authentication
- Account deletion functionality
