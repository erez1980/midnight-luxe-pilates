-- Online health declaration (/health/) and Rotem's client records.
--
-- Health data is sensitive personal information (Israeli Privacy Protection
-- Law, "מידע רגיש"). The public never reads or writes these tables directly:
--   * rows are written only by the `health-declaration` Edge Function, which
--     uses the service role (bypasses RLS) after validating the submission;
--   * only the studio admins (public.is_gallery_admin(), i.e. Rotem and Erez)
--     can read or delete them, from /app/?page=clients or the dashboard.
-- There are deliberately no insert/update policies for anon or authenticated.

create table if not exists public.clients (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  phone text not null unique,               -- digits only, e.g. 0548024606
  birth_date date,
  email text,
  emergency_name text,
  emergency_phone text,
  last_declaration_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.health_declarations (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.clients(id) on delete cascade,
  form_version text not null,
  submitted_at timestamptz not null default now(),
  -- [{ id, question, answer: 'yes' | 'no' | 'na', details }]
  answers jsonb not null,
  has_flags boolean not null default false, -- at least one "yes" answer
  signer_name text not null,
  guardian_name text,                       -- set when the client is a minor
  signature_png text not null,              -- data:image/png;base64,...
  consent_declaration boolean not null,
  consent_privacy boolean not null,
  user_agent text
);

create index if not exists health_declarations_client_idx
  on public.health_declarations (client_id, submitted_at desc);

alter table public.clients enable row level security;
alter table public.health_declarations enable row level security;

drop policy if exists clients_admin_read on public.clients;
create policy clients_admin_read on public.clients
  for select using (public.is_gallery_admin());
drop policy if exists clients_admin_delete on public.clients;
create policy clients_admin_delete on public.clients
  for delete using (public.is_gallery_admin());

drop policy if exists health_declarations_admin_read on public.health_declarations;
create policy health_declarations_admin_read on public.health_declarations
  for select using (public.is_gallery_admin());
drop policy if exists health_declarations_admin_delete on public.health_declarations;
create policy health_declarations_admin_delete on public.health_declarations
  for delete using (public.is_gallery_admin());

-- Belt and braces: the anon role gets no table privileges at all.
revoke all on public.clients from anon;
revoke all on public.health_declarations from anon;
