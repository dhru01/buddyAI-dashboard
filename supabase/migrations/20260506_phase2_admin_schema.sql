-- Buddy Learning Phase 2: Staff Web App & Admin Backend
-- POPIA consideration: keep PII minimal, role-restricted, and audit admin changes.

create extension if not exists "uuid-ossp";

create table if not exists admin_users (
  id uuid primary key default uuid_generate_v4(),
  auth_user_id uuid unique not null,
  full_name text not null,
  role text not null default 'staff',
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists learners (
  id uuid primary key default uuid_generate_v4(),
  learner_name text not null,
  grade text not null,
  school text,
  curriculum text,
  preferred_language text,
  status text not null default 'active',
  consent_status text default 'pending',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists learner_subjects (
  id uuid primary key default uuid_generate_v4(),
  learner_id uuid not null references learners(id) on delete cascade,
  subject text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists conversations (
  id uuid primary key default uuid_generate_v4(),
  learner_id uuid not null references learners(id) on delete cascade,
  subject text,
  language text,
  status text default 'new',
  flagged boolean default false,
  fallback_used boolean default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists messages (
  id uuid primary key default uuid_generate_v4(),
  conversation_id uuid not null references conversations(id) on delete cascade,
  sender_type text not null,
  content text not null,
  has_image boolean default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists message_metadata (
  id uuid primary key default uuid_generate_v4(),
  message_id uuid not null references messages(id) on delete cascade,
  subject text,
  topic text,
  language text,
  difficulty text,
  confidence numeric(5,4),
  correctness text,
  fallback_used boolean default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists learner_progress (
  id uuid primary key default uuid_generate_v4(),
  learner_id uuid not null references learners(id) on delete cascade,
  strong_topics text[] default '{}',
  weak_topics text[] default '{}',
  total_questions int default 0,
  sessions_count int default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists learner_points (
  id uuid primary key default uuid_generate_v4(),
  learner_id uuid not null references learners(id) on delete cascade,
  points int not null default 0,
  reason text,
  adjusted_by uuid references admin_users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists badges (
  id uuid primary key default uuid_generate_v4(),
  badge_name text not null unique,
  criteria text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists learner_badges (
  id uuid primary key default uuid_generate_v4(),
  learner_id uuid not null references learners(id) on delete cascade,
  badge_id uuid not null references badges(id) on delete cascade,
  awarded_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists streaks (
  id uuid primary key default uuid_generate_v4(),
  learner_id uuid not null references learners(id) on delete cascade,
  current_streak int not null default 0,
  longest_streak int not null default 0,
  last_active_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists onboarding_events (
  id uuid primary key default uuid_generate_v4(),
  learner_id uuid not null references learners(id) on delete cascade,
  step_name text not null,
  event_status text not null default 'completed',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists error_logs (
  id uuid primary key default uuid_generate_v4(),
  learner_id uuid references learners(id) on delete set null,
  conversation_id uuid references conversations(id) on delete set null,
  error_type text not null,
  snippet text,
  status text not null default 'new',
  assigned_staff uuid references admin_users(id),
  internal_note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists support_flags (
  id uuid primary key default uuid_generate_v4(),
  learner_id uuid references learners(id) on delete cascade,
  conversation_id uuid references conversations(id) on delete set null,
  flag_type text not null,
  status text not null default 'new',
  raised_by uuid references admin_users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists admin_notes (
  id uuid primary key default uuid_generate_v4(),
  learner_id uuid references learners(id) on delete cascade,
  conversation_id uuid references conversations(id) on delete set null,
  admin_user_id uuid references admin_users(id),
  note text not null,
  resolved boolean default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists system_settings (
  id uuid primary key default uuid_generate_v4(),
  setting_key text unique not null,
  setting_value jsonb not null default '{}'::jsonb,
  updated_by uuid references admin_users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_learner_subjects_learner_id on learner_subjects(learner_id);
create index if not exists idx_conversations_learner_id on conversations(learner_id);
create index if not exists idx_conversations_created_at on conversations(created_at);
create index if not exists idx_conversations_subject on conversations(subject);
create index if not exists idx_conversations_language on conversations(language);
create index if not exists idx_messages_conversation_id on messages(conversation_id);
create index if not exists idx_messages_created_at on messages(created_at);
create index if not exists idx_error_logs_status on error_logs(status);
create index if not exists idx_error_logs_created_at on error_logs(created_at);
create index if not exists idx_admin_notes_learner_id on admin_notes(learner_id);
create index if not exists idx_support_flags_status on support_flags(status);

alter table admin_users enable row level security;
alter table learners enable row level security;
alter table learner_subjects enable row level security;
alter table conversations enable row level security;
alter table messages enable row level security;
alter table message_metadata enable row level security;
alter table learner_progress enable row level security;
alter table learner_points enable row level security;
alter table badges enable row level security;
alter table learner_badges enable row level security;
alter table streaks enable row level security;
alter table onboarding_events enable row level security;
alter table error_logs enable row level security;
alter table support_flags enable row level security;
alter table admin_notes enable row level security;
alter table system_settings enable row level security;

create or replace function is_admin_user()
returns boolean language sql stable as $$
  select exists (
    select 1 from admin_users
    where auth_user_id = auth.uid() and is_active = true
  );
$$;

create policy "admin read write admin_users" on admin_users
for all using (is_admin_user()) with check (is_admin_user());

create policy "admin read write learners" on learners
for all using (is_admin_user()) with check (is_admin_user());

create policy "admin read write learner_subjects" on learner_subjects
for all using (is_admin_user()) with check (is_admin_user());

create policy "admin read write conversations" on conversations
for all using (is_admin_user()) with check (is_admin_user());

create policy "admin read write messages" on messages
for all using (is_admin_user()) with check (is_admin_user());

create policy "admin read write message_metadata" on message_metadata
for all using (is_admin_user()) with check (is_admin_user());

create policy "admin read write learner_progress" on learner_progress
for all using (is_admin_user()) with check (is_admin_user());

create policy "admin read write learner_points" on learner_points
for all using (is_admin_user()) with check (is_admin_user());

create policy "admin read write badges" on badges
for all using (is_admin_user()) with check (is_admin_user());

create policy "admin read write learner_badges" on learner_badges
for all using (is_admin_user()) with check (is_admin_user());

create policy "admin read write streaks" on streaks
for all using (is_admin_user()) with check (is_admin_user());

create policy "admin read write onboarding_events" on onboarding_events
for all using (is_admin_user()) with check (is_admin_user());

create policy "admin read write error_logs" on error_logs
for all using (is_admin_user()) with check (is_admin_user());

create policy "admin read write support_flags" on support_flags
for all using (is_admin_user()) with check (is_admin_user());

create policy "admin read write admin_notes" on admin_notes
for all using (is_admin_user()) with check (is_admin_user());

create policy "admin read write system_settings" on system_settings
for all using (is_admin_user()) with check (is_admin_user());
