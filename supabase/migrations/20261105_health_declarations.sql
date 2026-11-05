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
  -- The personal details exactly as submitted with this declaration. The
  -- client row keeps the details from the first declaration: the form is
  -- public, so a later submission with the same phone must not overwrite them.
  personal jsonb not null,
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

-- One transaction for the client and the declaration, so a failed insert can
-- never leave a client looking freshly declared. Called only by the Edge
-- Function (service role).
create or replace function public.submit_health_declaration(p jsonb)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_client uuid;
  v_now timestamptz := now();
begin
  -- New phone: create the client. Known phone: keep the stored details and
  -- only record that a new declaration arrived.
  insert into public.clients as c
    (full_name, phone, birth_date, email, emergency_name, emergency_phone, last_declaration_at)
  values (
    p->'personal'->>'full_name',
    p->>'phone',
    (p->'personal'->>'birth_date')::date,
    nullif(p->'personal'->>'email', ''),
    p->'personal'->>'emergency_name',
    p->'personal'->>'emergency_phone',
    v_now
  )
  on conflict (phone) do update
    set last_declaration_at = v_now, updated_at = v_now
  returning c.id into v_client;

  insert into public.health_declarations
    (client_id, form_version, submitted_at, answers, has_flags, personal, signer_name,
     guardian_name, signature_png, consent_declaration, consent_privacy, user_agent)
  values (
    v_client,
    p->>'form_version',
    v_now,
    p->'answers',
    (p->>'has_flags')::boolean,
    p->'personal',
    p->'personal'->>'full_name',
    nullif(p->>'guardian_name', ''),
    p->>'signature_png',
    true,
    true,
    p->>'user_agent'
  );
  return v_client;
end;
$$;

revoke all on function public.submit_health_declaration(jsonb) from public, anon, authenticated;
grant execute on function public.submit_health_declaration(jsonb) to service_role;

-- Belt and braces: the anon role gets no table privileges at all.
revoke all on public.clients from anon;
revoke all on public.health_declarations from anon;
