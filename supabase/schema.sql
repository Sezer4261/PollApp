-- Poll App database
-- Run this in the Supabase SQL editor, then put the project URL and anon key
-- into src/environments/environment.ts

create table if not exists public.surveys (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  category text not null,
  status text not null default 'published' check (status in ('draft', 'published')),
  ends_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.questions (
  id uuid primary key default gen_random_uuid(),
  survey_id uuid not null references public.surveys(id) on delete cascade,
  text text not null,
  allow_multiple boolean not null default false,
  sort_order int not null default 0
);

create table if not exists public.options (
  id uuid primary key default gen_random_uuid(),
  question_id uuid not null references public.questions(id) on delete cascade,
  text text not null,
  sort_order int not null default 0
);

create table if not exists public.votes (
  id uuid primary key default gen_random_uuid(),
  option_id uuid not null references public.options(id) on delete cascade,
  created_at timestamptz not null default now()
);

alter table public.surveys enable row level security;
alter table public.questions enable row level security;
alter table public.options enable row level security;
alter table public.votes enable row level security;

create policy "Public can read surveys" on public.surveys for select using (true);
create policy "Public can insert surveys" on public.surveys for insert with check (true);
create policy "Public can read questions" on public.questions for select using (true);
create policy "Public can insert questions" on public.questions for insert with check (true);
create policy "Public can read options" on public.options for select using (true);
create policy "Public can insert options" on public.options for insert with check (true);
create policy "Public can read votes" on public.votes for select using (true);
create policy "Public can insert votes" on public.votes for insert with check (true);

alter publication supabase_realtime add table public.votes;
