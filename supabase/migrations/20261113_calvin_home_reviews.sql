-- Migration appliquée au projet Supabase (avis clients CALVIN HOME)
create table public.calvin_home_reviews (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(btrim(name)) between 1 and 60),
  rating smallint not null check (rating between 1 and 5),
  text text not null check (char_length(btrim(text)) between 1 and 800),
  status text not null default 'pending' check (status in ('pending','approved','rejected')),
  created_at timestamptz not null default now()
);
alter table public.calvin_home_reviews enable row level security;
create policy "public can submit pending reviews" on public.calvin_home_reviews
  for insert to anon, authenticated with check (status = 'pending');
create policy "public can read approved reviews" on public.calvin_home_reviews
  for select to anon, authenticated using (status = 'approved');
create index calvin_home_reviews_status_created_idx on public.calvin_home_reviews (status, created_at desc);
