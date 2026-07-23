-- Einmal im Supabase Dashboard unter "SQL Editor" ausführen.
-- Jeder Nutzer kann danach ausschließlich seine eigenen Einträge sehen und ändern.

create table if not exists public.check_ins (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  entry_date date not null default current_date,
  created_at timestamptz not null default now(),
  mood smallint not null check (mood between 1 and 5),
  stress smallint not null check (stress between 1 and 5),
  loneliness smallint not null check (loneliness between 1 and 5),
  sleep smallint not null check (sleep between 1 and 5),
  ai_minutes smallint not null check (ai_minutes between 0 and 1440),
  ai_purpose text not null check (ai_purpose in ('arbeit', 'lernen', 'unterhaltung', 'emotionale_unterstuetzung')),
  ai_effect text not null check (ai_effect in ('hilfreich', 'neutral', 'belastend')),
  note text check (char_length(note) <= 1200),
  unique (user_id, entry_date)
);

create index if not exists check_ins_user_date_idx
  on public.check_ins (user_id, entry_date desc);

alter table public.check_ins enable row level security;

drop policy if exists "Eigene Check-ins lesen" on public.check_ins;
create policy "Eigene Check-ins lesen"
  on public.check_ins for select
  to authenticated
  using ((select auth.uid()) = user_id);

drop policy if exists "Eigene Check-ins anlegen" on public.check_ins;
create policy "Eigene Check-ins anlegen"
  on public.check_ins for insert
  to authenticated
  with check ((select auth.uid()) = user_id);

drop policy if exists "Eigene Check-ins aktualisieren" on public.check_ins;
create policy "Eigene Check-ins aktualisieren"
  on public.check_ins for update
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

drop policy if exists "Eigene Check-ins löschen" on public.check_ins;
create policy "Eigene Check-ins löschen"
  on public.check_ins for delete
  to authenticated
  using ((select auth.uid()) = user_id);

revoke all on table public.check_ins from anon;
grant select, insert, update, delete on table public.check_ins to authenticated;

create table if not exists public.tool_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  tool_name text not null check (char_length(tool_name) between 1 and 120),
  task text not null check (char_length(task) between 1 and 500),
  started_at timestamptz not null,
  ended_at timestamptz not null,
  duration_minutes smallint not null check (duration_minutes between 1 and 1440),
  effectiveness smallint not null check (effectiveness between 1 and 5),
  burden smallint not null check (burden between 1 and 5),
  notes text check (char_length(notes) <= 500),
  created_at timestamptz not null default now(),
  check (ended_at >= started_at)
);

create index if not exists tool_sessions_user_created_idx on public.tool_sessions (user_id, created_at desc);
alter table public.tool_sessions enable row level security;
drop policy if exists "Eigene Tool-Sitzungen lesen" on public.tool_sessions;
create policy "Eigene Tool-Sitzungen lesen" on public.tool_sessions for select to authenticated using ((select auth.uid()) = user_id);
drop policy if exists "Eigene Tool-Sitzungen anlegen" on public.tool_sessions;
create policy "Eigene Tool-Sitzungen anlegen" on public.tool_sessions for insert to authenticated with check ((select auth.uid()) = user_id);
drop policy if exists "Eigene Tool-Sitzungen aktualisieren" on public.tool_sessions;
create policy "Eigene Tool-Sitzungen aktualisieren" on public.tool_sessions for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
drop policy if exists "Eigene Tool-Sitzungen löschen" on public.tool_sessions;
create policy "Eigene Tool-Sitzungen löschen" on public.tool_sessions for delete to authenticated using ((select auth.uid()) = user_id);
revoke all on table public.tool_sessions from anon;
grant select, insert, update, delete on table public.tool_sessions to authenticated;

create table if not exists public.self_checks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  score smallint not null check (score between 0 and 30),
  answers jsonb not null,
  created_at timestamptz not null default now(),
  check (jsonb_typeof(answers) in ('array', 'object'))
);

-- Bestehende Installationen von der ersten numerischen Testversion aktualisieren.
alter table public.self_checks drop constraint if exists self_checks_answers_check;
alter table public.self_checks add constraint self_checks_answers_check
  check (jsonb_typeof(answers) in ('array', 'object'));

create index if not exists self_checks_user_created_idx on public.self_checks (user_id, created_at desc);
alter table public.self_checks enable row level security;
drop policy if exists "Eigene Selbstchecks lesen" on public.self_checks;
create policy "Eigene Selbstchecks lesen" on public.self_checks for select to authenticated using ((select auth.uid()) = user_id);
drop policy if exists "Eigene Selbstchecks anlegen" on public.self_checks;
create policy "Eigene Selbstchecks anlegen" on public.self_checks for insert to authenticated with check ((select auth.uid()) = user_id);
drop policy if exists "Eigene Selbstchecks löschen" on public.self_checks;
create policy "Eigene Selbstchecks löschen" on public.self_checks for delete to authenticated using ((select auth.uid()) = user_id);
revoke all on table public.self_checks from anon;
grant select, insert, delete on table public.self_checks to authenticated;

create table if not exists public.focus_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  started_at timestamptz not null,
  ended_at timestamptz not null,
  duration_minutes smallint not null check (duration_minutes between 1 and 120),
  break_activity text check (char_length(break_activity) <= 160),
  completed boolean not null default true,
  created_at timestamptz not null default now(),
  check (ended_at >= started_at)
);

create index if not exists focus_sessions_user_created_idx on public.focus_sessions (user_id, created_at desc);
alter table public.focus_sessions enable row level security;
drop policy if exists "Eigene Fokus-Sitzungen lesen" on public.focus_sessions;
create policy "Eigene Fokus-Sitzungen lesen" on public.focus_sessions for select to authenticated using ((select auth.uid()) = user_id);
drop policy if exists "Eigene Fokus-Sitzungen anlegen" on public.focus_sessions;
create policy "Eigene Fokus-Sitzungen anlegen" on public.focus_sessions for insert to authenticated with check ((select auth.uid()) = user_id);
drop policy if exists "Eigene Fokus-Sitzungen löschen" on public.focus_sessions;
create policy "Eigene Fokus-Sitzungen löschen" on public.focus_sessions for delete to authenticated using ((select auth.uid()) = user_id);
revoke all on table public.focus_sessions from anon;
grant select, insert, delete on table public.focus_sessions to authenticated;

create table if not exists public.contact_requests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  full_name text not null check (char_length(trim(full_name)) between 2 and 120),
  email text not null check (char_length(email) between 3 and 254 and position('@' in email) > 1),
  phone text check (phone is null or char_length(phone) between 5 and 40),
  privacy_acknowledged boolean check (privacy_acknowledged = true),
  privacy_text_version text not null default '2026-07-23-v1',
  privacy_acknowledged_at timestamptz,
  health_data_consent boolean check (health_data_consent = true),
  health_consent_text_version text not null default '2026-07-23-v1',
  health_data_consented_at timestamptz,
  contact_consent boolean not null default false,
  contact_consent_text_version text not null default '2026-07-23-v1',
  contact_consented_at timestamptz,
  contact_withdrawn_at timestamptz,
  consent_text_version text not null default '2026-07-23-v1',
  consented_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  unique (user_id)
);

-- Bestehende Installationen der ersten Kontaktformular-Version aktualisieren.
alter table public.contact_requests
  drop constraint if exists contact_requests_contact_consent_check;
alter table public.contact_requests
  alter column contact_consent set default false;
alter table public.contact_requests
  add column if not exists privacy_acknowledged boolean check (privacy_acknowledged = true),
  add column if not exists privacy_text_version text not null default '2026-07-23-v1',
  add column if not exists privacy_acknowledged_at timestamptz,
  add column if not exists health_data_consent boolean check (health_data_consent = true),
  add column if not exists health_consent_text_version text not null default '2026-07-23-v1',
  add column if not exists health_data_consented_at timestamptz,
  add column if not exists contact_consent_text_version text not null default '2026-07-23-v1',
  add column if not exists contact_consented_at timestamptz,
  add column if not exists contact_withdrawn_at timestamptz;

create or replace function public.set_contact_request_timestamps()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();

  if tg_op = 'INSERT' then
    if new.privacy_acknowledged = true then
      new.privacy_acknowledged_at = now();
    end if;
    if new.health_data_consent = true then
      new.health_data_consented_at = now();
    end if;
    if new.contact_consent = true then
      new.contact_consented_at = now();
    end if;
  else
    if new.privacy_acknowledged = true and old.privacy_acknowledged is distinct from true then
      new.privacy_acknowledged_at = now();
    end if;
    if new.health_data_consent = true and old.health_data_consent is distinct from true then
      new.health_data_consented_at = now();
    end if;
    if new.contact_consent = true and old.contact_consent is distinct from true then
      new.contact_consented_at = now();
      new.contact_withdrawn_at = null;
    elsif new.contact_consent = false and old.contact_consent = true then
      new.contact_withdrawn_at = now();
    end if;
  end if;

  new.consented_at = now();
  return new;
end;
$$;

drop trigger if exists contact_requests_set_timestamps on public.contact_requests;
create trigger contact_requests_set_timestamps
  before insert or update on public.contact_requests
  for each row execute function public.set_contact_request_timestamps();

revoke all on function public.set_contact_request_timestamps() from public;

alter table public.contact_requests enable row level security;
drop policy if exists "Eigene Kontaktanfrage lesen" on public.contact_requests;
create policy "Eigene Kontaktanfrage lesen"
  on public.contact_requests for select
  to authenticated
  using ((select auth.uid()) = user_id);
drop policy if exists "Eigene Kontaktanfrage anlegen" on public.contact_requests;
create policy "Eigene Kontaktanfrage anlegen"
  on public.contact_requests for insert
  to authenticated
  with check (
    (select auth.uid()) = user_id
    and privacy_acknowledged = true
    and health_data_consent = true
  );
drop policy if exists "Eigene Kontaktanfrage aktualisieren" on public.contact_requests;
create policy "Eigene Kontaktanfrage aktualisieren"
  on public.contact_requests for update
  to authenticated
  using ((select auth.uid()) = user_id)
  with check (
    (select auth.uid()) = user_id
    and privacy_acknowledged = true
    and health_data_consent = true
  );
drop policy if exists "Eigene Kontaktanfrage löschen" on public.contact_requests;
create policy "Eigene Kontaktanfrage löschen"
  on public.contact_requests for delete
  to authenticated
  using ((select auth.uid()) = user_id);

revoke all on table public.contact_requests from anon, authenticated;
grant select, insert, update, delete on table public.contact_requests to authenticated;
