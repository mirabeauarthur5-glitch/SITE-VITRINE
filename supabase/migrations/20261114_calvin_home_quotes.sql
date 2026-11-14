-- Migration appliquée au projet Supabase (demandes de devis CALVIN HOME)
create table public.calvin_home_quotes (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(btrim(name)) between 3 and 80),
  phone text not null check (char_length(btrim(phone)) between 8 and 30),
  service text not null check (char_length(btrim(service)) between 1 and 80),
  subject text not null check (char_length(btrim(subject)) between 1 and 80),
  description text not null check (char_length(btrim(description)) between 5 and 1500),
  status text not null default 'new' check (status in ('new','contacted','closed')),
  created_at timestamptz not null default now()
);
alter table public.calvin_home_quotes enable row level security;
-- Le public peut UNIQUEMENT déposer une demande (statut forcé à 'new') ; aucune lecture/modification/suppression publique.
create policy "public can submit quotes" on public.calvin_home_quotes
  for insert to anon, authenticated with check (status = 'new');
create index calvin_home_quotes_created_idx on public.calvin_home_quotes (created_at desc);
