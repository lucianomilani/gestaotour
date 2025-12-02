# Edge Function Deployment Guide

## Prerequisites
- Supabase CLI installed
- Access to your Supabase project

## Installation

### Option 1: NPM (Global)
```bash
sudo npm install -g supabase
```

### Option 2: Homebrew (macOS/Linux)
```bash
brew install supabase/tap/supabase
```

### Option 3: Direct Download
Visit: https://github.com/supabase/cli/releases

## Deployment Steps

### 1. Login to Supabase
```bash
supabase login
```

### 2. Link Your Project
```bash
cd /home/lmilani/Documentos/gestaotour/gestaotour
supabase link --project-ref YOUR_PROJECT_REF
```

**To find your PROJECT_REF:**
- Go to your Supabase Dashboard
- Settings > General > Reference ID

### 3. Deploy the Function
```bash
supabase functions deploy create-user
```

### 4. Set Environment Variables (if needed)
The function uses these environment variables (automatically available):
- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY` (set in Supabase Dashboard)

## Testing the Function

After deployment, test it with:
```bash
curl -i --location --request POST \
  'https://YOUR_PROJECT_REF.supabase.co/functions/v1/create-user' \
  --header 'Authorization: Bearer YOUR_ANON_KEY' \
  --header 'Content-Type: application/json' \
  --data '{"email":"test@example.com","password":"test123","name":"Test User","role":"Guia"}'
```

## Troubleshooting

### Permission Denied
```bash
sudo npm install -g supabase
```

### Function Not Found
Make sure you're in the project directory and the function exists at:
`supabase/functions/create-user/index.ts`

### CORS Errors
The function includes CORS headers. If you still get errors, check your Supabase project settings.

## Alternative: Manual User Creation

If you can't deploy the Edge Function, you can still create users manually:

1. Go to Supabase Dashboard > Authentication > Users
2. Click "Invite User" or "Add User"
3. Enter email and password
4. Then run this SQL to link to staff profile:
```sql
UPDATE public.staff
SET auth_id = (SELECT id FROM auth.users WHERE email = 'user@example.com')
WHERE email = 'user@example.com';
```
