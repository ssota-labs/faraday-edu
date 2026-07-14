-- Faraday Stage 2 — initial schema (P0/P3)
-- Mirrors packages/platform-adapter-supabase/migrations/001_init.sql
-- RLS: deny-all for anon/authenticated; service role only via server.

create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  display_name text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists courses (
  id text primary key,
  slug text unique not null,
  owner_id text not null,
  title text not null,
  status text not null,
  access text not null,
  active_release_id text,
  created_at timestamptz not null,
  updated_at timestamptz not null
);

create table if not exists course_versions (
  id text primary key,
  course_id text not null references courses(id),
  definition jsonb not null,
  created_at timestamptz not null,
  published_at timestamptz
);

create table if not exists releases (
  id text primary key,
  course_id text not null references courses(id),
  course_version_id text not null,
  build_hash text not null,
  status text not null,
  manifest_sha256 text not null,
  public_artifact_path text not null,
  sealed_bundle_path text not null,
  created_at timestamptz not null,
  created_by text not null
);

create table if not exists entitlements (
  id text primary key,
  course_id text not null,
  user_id text,
  status text not null,
  source text not null,
  provider_reference text,
  starts_at timestamptz not null,
  expires_at timestamptz,
  reason text,
  created_at timestamptz not null
);

create table if not exists enrollments (
  id text primary key,
  course_id text not null,
  learner_id text not null,
  course_version_id text not null,
  created_at timestamptz not null,
  unique (course_id, learner_id)
);

create table if not exists learning_events (
  event_id text primary key,
  schema_version int not null,
  course_id text not null,
  course_version_id text not null,
  learner_id text not null,
  session_id text not null,
  node_id text,
  type text not null,
  occurred_at timestamptz not null,
  payload jsonb
);

create table if not exists progress_projections (
  course_id text not null,
  learner_id text not null,
  course_version_id text not null,
  completed_node_ids jsonb not null,
  xp int not null default 0,
  last_event_at timestamptz,
  updated_at timestamptz not null,
  primary key (course_id, learner_id)
);

create table if not exists assessment_attempts (
  id text primary key,
  assessment_id text not null,
  assessment_version_id text not null,
  course_id text not null,
  course_version_id text not null,
  learner_id text not null,
  status text not null,
  item_order jsonb not null,
  responses jsonb not null default '{}',
  score numeric,
  passed boolean,
  started_at timestamptz not null,
  submitted_at timestamptz,
  graded_at timestamptz,
  idempotency_key text not null,
  unique (learner_id, idempotency_key)
);

create table if not exists community_threads (
  id text primary key,
  course_id text not null,
  author_id text not null,
  title text not null,
  body text not null,
  pinned boolean not null default false,
  locked boolean not null default false,
  hidden boolean not null default false,
  created_at timestamptz not null,
  updated_at timestamptz not null
);

create table if not exists orders (
  id text primary key,
  course_id text not null,
  buyer_id text not null,
  amount_cents int not null,
  currency text not null,
  status text not null,
  provider text not null,
  provider_payment_id text,
  entitlement_id text,
  created_at timestamptz not null,
  updated_at timestamptz not null
);

create table if not exists usage_meters (
  id text primary key,
  user_id text not null,
  course_id text not null,
  kind text not null,
  quantity numeric not null,
  occurred_at timestamptz not null
);

-- Sample course for e2e shell resolution
insert into courses (
  id, slug, owner_id, title, status, access, active_release_id, created_at, updated_at
) values (
  'course_e2e_sample',
  'mechanics',
  'seed',
  'Mechanics (e2e)',
  'DRAFT',
  'PUBLIC_FREE',
  null,
  now(),
  now()
) on conflict (id) do nothing;

alter table profiles enable row level security;
alter table courses enable row level security;
alter table course_versions enable row level security;
alter table releases enable row level security;
alter table entitlements enable row level security;
alter table enrollments enable row level security;
alter table learning_events enable row level security;
alter table progress_projections enable row level security;
alter table assessment_attempts enable row level security;
alter table community_threads enable row level security;
alter table orders enable row level security;
alter table usage_meters enable row level security;
