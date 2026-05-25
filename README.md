# BuddyAI Admin Dashboard

Phase 2 staff web app and admin backend foundation for Buddy Learning.

## Stack

- Next.js 14 App Router + TypeScript
- Tailwind CSS (Buddy Learning warm theme)
- Supabase Auth + Postgres
- Recharts
- Vercel-ready structure

## Features Implemented

- Staff login with Supabase email/password auth
- Protected `/dashboard` routes via middleware and server-side auth checks
- Sidebar admin layout and responsive pages
- Overview KPIs and charts
- Learner directory with filter/search inputs and learner profile page
- Conversation viewer with WhatsApp-style message bubbles and metadata
- Engagement analytics, language/subject breakdown, onboarding metrics
- Error and fallback monitor
- Manual controls page with `sendManualMessage()` placeholder service
- System configuration page
- Supabase migration + seed scripts for demo data

## Setup

1. Install dependencies:

```bash
npm install
```

2. Create `.env.local`:

```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

3. Run Supabase schema and seed:

- Apply SQL in `supabase/migrations/20260506_phase2_admin_schema.sql`
- Apply SQL in `supabase/seed/phase2_demo_seed.sql`
- In Supabase Auth, create a staff user and map user `auth.uid()` to `admin_users.auth_user_id`

4. Start local dev:

```bash
npm run dev
```

5. Deploy to Vercel:

- Import repo into Vercel
- Add same environment variables
- Deploy with default Next.js settings

## Privacy and Security Notes

- RLS is enabled for all dashboard tables.
- Policies restrict reads/writes to authenticated admin users.
- Schema intentionally avoids unnecessary sensitive personal data.
- Add audit logging and encryption controls before production launch.
