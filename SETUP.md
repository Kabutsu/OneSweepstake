# OneSweepstake - Setup Guide

## Slice 1: Basic Project Setup & Authentication

This guide will help you set up the OneSweepstake platform from scratch.

## Prerequisites

- Node.js 18 or higher
- npm or yarn
- A Supabase account (free tier is fine)
- A Google Cloud account (for OAuth setup)

## Step 1: Clone and Install

```bash
git clone https://github.com/Kabutsu/OneSweepstake.git
cd OneSweepstake
npm install
```

## Step 2: Supabase Setup

### Create a Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign in
2. Click "New Project"
3. Choose an organization
4. Enter project details:
   - Name: OneSweepstake (or your choice)
   - Database Password: (save this securely)
   - Region: (closest to your users)
5. Click "Create new project" and wait for setup to complete

### Get Supabase Credentials

1. In your Supabase dashboard, go to Settings > API
2. Copy:
   - Project URL (e.g., `https://xxxxx.supabase.co`)
   - anon/public key
3. Go to Settings > Database
4. Copy the Connection String (URI format)

### Enable Authentication Providers

#### Google OAuth

1. In Supabase dashboard, go to Authentication > Providers
2. Find "Google" and enable it
3. Set up Google OAuth:
   - Go to [Google Cloud Console](https://console.cloud.google.com)
   - Create a new project or select existing
   - Enable Google+ API
   - Go to Credentials > Create Credentials > OAuth client ID
   - Application type: Web application
   - Authorized redirect URIs: Add `https://[your-project-ref].supabase.co/auth/v1/callback`
   - Copy Client ID and Client Secret
4. Back in Supabase, paste the Client ID and Client Secret
5. Save the configuration

#### Magic Link (Email)

Magic Link is enabled by default in Supabase. No additional setup needed.

## Step 3: Environment Variables

Create a `.env.local` file in the project root:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here

# Database Connection String
DATABASE_URL=postgresql://postgres:[your-db-password]@db.[your-project-ref].supabase.co:5432/postgres
```

Replace:
- `your-project-ref` with your Supabase project reference
- `your-anon-key-here` with your Supabase anon key
- `[your-db-password]` with your database password

## Step 4: Database Migration

Push the database schema to Supabase:

```bash
npm run db:push
```

This will create all required tables:
- users
- tournaments
- sweepstakes
- participants
- team_assignments
- chat_messages
- match_cache

### Verify Tables

1. Go to your Supabase dashboard
2. Click on "Table Editor" in the sidebar
3. You should see all 7 tables listed

## Step 5: Configure Supabase Auth Settings

1. In Supabase dashboard, go to Authentication > URL Configuration
2. Set Site URL: `http://localhost:3000` (for development)
3. Add Redirect URLs:
   - `http://localhost:3000/auth/callback`
   - `http://localhost:3000/**` (wildcard for all routes)
4. For production, add your production URLs

## Step 6: Run the Application

Start the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

You should be redirected to the sign-in page.

## Step 7: Test Authentication

### Test Google OAuth

1. Click "Continue with Google"
2. Select your Google account
3. Authorize the application
4. You should be redirected back and signed in

### Test Magic Link

1. Enter your email address
2. Click "Send Magic Link"
3. Check your email for the magic link
4. Click the link in the email
5. You should be signed in

## Troubleshooting

### "Invalid redirect URL"

- Make sure your redirect URLs are configured in Supabase
- Check that your `.env.local` has the correct Supabase URL

### Google OAuth not working

- Verify Google OAuth is enabled in Supabase
- Check that redirect URI in Google Cloud matches Supabase callback URL
- Make sure Google+ API is enabled in Google Cloud

### Magic Link not arriving

- Check spam folder
- Verify email template in Supabase Authentication > Email Templates
- Check Supabase logs for email sending errors

### Database connection errors

- Verify DATABASE_URL is correct
- Check database password is correct
- Ensure database is accessible (Supabase projects pause after inactivity on free tier)

## Next Steps

After completing Slice 1, you can:
- Browse existing tournaments (Slice 2)
- Create and join sweepstakes (Slice 3)
- Chat with other participants (Slice 4)

## Support

If you encounter issues, please check:
1. Supabase dashboard logs
2. Browser console for errors
3. Terminal for server errors

For persistent issues, open an issue on GitHub.
