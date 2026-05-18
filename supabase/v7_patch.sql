-- V7 PATCH: RLS fix, matching requests, photos, deposits, profile bio

alter table users add column if not exists bio text;
alter table jobs add column if not exists completion_notes text;
alter table payments add column if not exists payment_type text default 'deposit';

create table if not exists job_requests (
  id uuid primary key default gen_random_uuid(),
  job_id uuid references jobs(id) on delete cascade,
  provider_id uuid references users(id) on delete cascade,
  status text check (status in ('pending','accepted','declined','expired')) default 'pending',
  created_at timestamptz default now(),
  unique(job_id, provider_id)
);

create table if not exists job_photos (
  id uuid primary key default gen_random_uuid(),
  job_id uuid references jobs(id) on delete cascade,
  uploaded_by uuid references users(id) on delete cascade,
  photo_url text not null,
  photo_type text check (photo_type in ('problem','completion')) default 'problem',
  created_at timestamptz default now()
);

alter table job_requests enable row level security;
alter table job_photos enable row level security;

drop policy if exists "users can insert own profile" on users;
drop policy if exists "users can read own profile" on users;
drop policy if exists "users can update own profile" on users;
drop policy if exists "public provider names can be read" on users;

create policy "users can insert own profile"
on users for insert
with check (auth.uid() = id);

create policy "users can read own profile"
on users for select
using (auth.uid() = id);

create policy "users can update own profile"
on users for update
using (auth.uid() = id)
with check (auth.uid() = id);

create policy "public provider names can be read"
on users for select
using (role = 'provider');

create policy "providers can read their matched requests"
on job_requests for select
using (auth.uid() = provider_id);

create policy "system can create job requests"
on job_requests for insert
with check (true);

create policy "providers can update their own request responses"
on job_requests for update
using (auth.uid() = provider_id)
with check (auth.uid() = provider_id);

create policy "related users can read job photos"
on job_photos for select
using (
  exists (
    select 1 from jobs
    where jobs.id = job_photos.job_id
    and (jobs.customer_id = auth.uid() or jobs.provider_id = auth.uid())
  )
);

create policy "related users can upload job photos"
on job_photos for insert
with check (
  uploaded_by = auth.uid()
  and exists (
    select 1 from jobs
    where jobs.id = job_photos.job_id
    and (jobs.customer_id = auth.uid() or jobs.provider_id = auth.uid())
  )
);

do $$
begin
  begin
    alter publication supabase_realtime add table job_requests;
  exception when duplicate_object then null;
  end;

  begin
    alter publication supabase_realtime add table job_photos;
  exception when duplicate_object then null;
  end;
end $$;
