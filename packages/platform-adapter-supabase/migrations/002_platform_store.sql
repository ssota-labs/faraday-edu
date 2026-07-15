-- Studio drafts + blob helpers for Postgres-backed PlatformStore
create table if not exists studio_drafts (
  id text primary key,
  course_id text not null,
  owner_id text not null,
  files jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

create table if not exists release_manifests (
  build_hash text primary key,
  manifest jsonb not null,
  updated_at timestamptz not null default now()
);

create table if not exists artifact_files (
  build_hash text not null,
  path text not null,
  content text not null,
  updated_at timestamptz not null default now(),
  primary key (build_hash, path)
);

create table if not exists sealed_bundles (
  course_version_id text primary key,
  data jsonb not null,
  updated_at timestamptz not null default now()
);

create table if not exists tutor_runs (
  id text primary key,
  user_id text not null,
  course_id text not null,
  course_version_id text not null,
  conversation_id text not null,
  status text not null,
  official_attempt_id text,
  model_version text,
  grounding_version text,
  created_at timestamptz not null
);

create table if not exists assessment_definitions (
  assessment_id text primary key,
  definition jsonb not null,
  updated_at timestamptz not null default now()
);

create table if not exists sealed_grading_keys (
  assessment_version_id text primary key,
  payload jsonb not null,
  updated_at timestamptz not null default now()
);

create table if not exists community_comments (
  id text primary key,
  thread_id text not null,
  author_id text not null,
  body text not null,
  hidden boolean not null default false,
  created_at timestamptz not null
);

create table if not exists community_reports (
  id text primary key,
  payload jsonb not null,
  created_at timestamptz not null default now()
);

create table if not exists auth_bootstrap_states (
  state text primary key,
  data jsonb not null,
  created_at timestamptz not null default now()
);

create table if not exists auth_bootstrap_codes (
  code text primary key,
  data jsonb not null,
  created_at timestamptz not null default now()
);

alter table studio_drafts enable row level security;
alter table release_manifests enable row level security;
alter table artifact_files enable row level security;
alter table sealed_bundles enable row level security;
alter table tutor_runs enable row level security;
alter table assessment_definitions enable row level security;
alter table sealed_grading_keys enable row level security;
alter table community_comments enable row level security;
alter table community_reports enable row level security;
alter table auth_bootstrap_states enable row level security;
alter table auth_bootstrap_codes enable row level security;
