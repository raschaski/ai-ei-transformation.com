-- Einmal im Supabase Dashboard unter "SQL Editor" ausführen.
-- Jeder Nutzer kann danach ausschließlich seine eigenen Check-ins sehen und ändern.

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
