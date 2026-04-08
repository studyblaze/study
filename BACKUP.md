# GroupTutors Backup & Recovery Guide 📦

This guide outlines how to back up every component of your application to ensure you never lose data.

## 1. Source Code (GitHub)
Your code is currently hosted on GitHub. This is your primary backup for all logic and UI.
- **How to verify**: Ensure all local changes are pushed to `main`.
- **Recovery**: You can always re-clone the repository from GitHub.

## 2. Database (Supabase)
Your database contains all users, tutor profiles, activity logs, and settings.

### Manual Backup (Recommended Weekly)
1. Go to your [Supabase Dashboard](https://supabase.com/dashboard).
2. Select your project.
3. Go to **Settings** > **Database**.
4. Scroll down to **Backups**.
5. Supabase automatically takes daily backups, but you can also manually export data:
   - Go to **Table Editor**.
   - Select a table (e.g., `profiles`).
   - Click **Export to CSV**.

### Full Schema Backup (SQL)
To back up the *structure* of your database (all tables, policies, and functions):
1. Install [Supabase CLI](https://supabase.com/docs/guides/cli).
2. Run the following command in your terminal:
   ```bash
   supabase db dump --project-ref your_project_ref > supabase_schema_backup.sql
   ```
   *(Replace `your_project_ref` with your Supabase Project ID)*

## 3. Environment Variables (`.env`)
These keys are the "keys to the kingdom" and are NOT kept on GitHub for security.

### Current Required Keys Template
Copy these to a secure location (like a password manager or a private encrypted file):

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL="https://exkgplqcdtoxfmxqkdpl.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your_anon_key"
SUPABASE_SERVICE_ROLE_KEY="your_service_role_key"

# Email (Resend)
RESEND_API_KEY="your_resend_key"

# Payments (Stripe)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="your_stripe_pub_key"
STRIPE_SECRET_KEY="your_stripe_secret_key"
STRIPE_WEBHOOK_SECRET="your_stripe_webhook_secret"

# Payments (Razorpay)
NEXT_PUBLIC_RAZORPAY_KEY_ID="your_razorpay_key"
RAZORPAY_KEY_SECRET="your_razorpay_secret"

# Video/Classroom (LiveKit)
LIVEKIT_URL="wss://grouptutors-4kxiyvhk.livekit.cloud"
LIVEKIT_API_KEY="your_livekit_key"
LIVEKIT_API_SECRET="your_livekit_secret"

# Google Auth
NEXT_PUBLIC_GOOGLE_CLIENT_ID="your_google_client_id"
GOOGLE_CLIENT_SECRET="your_google_client_secret"
```

## 4. Disaster Recovery Checklist
If you lose everything and need to rebuild:
1. **Clone Code**: `git clone https://github.com/your-username/GroupLearn.git`
2. **Setup Env**: Create a `.env.local` file using the keys above.
3. **Database**: 
   - Create a new Supabase project.
   - Run the backed-up SQL schema in the **SQL Editor**.
   - Import CSV data for critical tables (`profiles`, `tutors`, etc.).
4. **Deploy**: Connect the new GitHub repo to Vercel and add the environment variables.

---
**Last Updated**: March 22, 2026
