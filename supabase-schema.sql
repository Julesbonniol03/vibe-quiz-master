-- ============================================
-- TEUBÉ — Schéma Supabase (Phase 3)
-- ============================================
-- À exécuter dans le SQL Editor de Supabase

-- 1. Table profiles
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  pseudo text not null,
  avatar_id text not null default 'hacker',
  xp integer not null default 0,
  games_played integer not null default 0,
  total_played integer not null default 0,
  total_correct integer not null default 0,
  best_streak integer not null default 0,
  daily_streak integer not null default 0,
  daily_last_date text default '',
  daily_completed text default '',
  premium_status boolean not null default false,
  category_stats jsonb not null default '{}',
  speed_record jsonb not null default '{"totalTime":0,"totalAnswered":0,"bestAvg":0}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 2. Index pour le leaderboard
create index if not exists idx_profiles_xp on public.profiles(xp desc);

-- 3. Row Level Security
alter table public.profiles enable row level security;

-- Lecture publique (leaderboard)
create policy "Profiles are viewable by everyone"
  on public.profiles for select
  using (true);

-- Insertion uniquement par l'utilisateur lui-même
create policy "Users can insert their own profile"
  on public.profiles for insert
  with check (auth.uid() = id);

-- Modification uniquement par l'utilisateur lui-même
create policy "Users can update their own profile"
  on public.profiles for update
  using (auth.uid() = id);

-- 4. Fonction auto-update updated_at
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger on_profiles_updated
  before update on public.profiles
  for each row execute function public.handle_updated_at();

-- 5. Trigger pour créer un profil automatiquement à l'inscription
-- Récupère pseudo et avatar_id depuis raw_user_meta_data (envoyés par signUp)
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, pseudo, avatar_id)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'pseudo', 'Teubé'),
    coalesce(new.raw_user_meta_data->>'avatar_id', 'hacker')
  )
  on conflict (id) do nothing;
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
