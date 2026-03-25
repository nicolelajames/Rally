-- Rally: Family Activity Command Center
-- Run this in your Supabase SQL Editor

-- Families table (shared household unit)
create table families (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  invite_code text unique default upper(substring(gen_random_uuid()::text, 1, 6)),
  created_at timestamptz default now()
);

-- Users/profiles (linked to Supabase auth)
create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  family_id uuid references families(id),
  full_name text,
  role text default 'parent', -- 'parent' | 'coparent' | 'caregiver'
  avatar_color text default '#7F77DD',
  created_at timestamptz default now()
);

-- Children
create table children (
  id uuid primary key default gen_random_uuid(),
  family_id uuid references families(id) on delete cascade,
  name text not null,
  color text default '#1D9E75',
  grade text,
  school text,
  created_at timestamptz default now()
);

-- Feed items (events, actions, conflicts)
create table feed_items (
  id uuid primary key default gen_random_uuid(),
  family_id uuid references families(id) on delete cascade,
  child_id uuid references children(id),
  type text not null, -- 'action_required' | 'event' | 'conflict' | 'upcoming'
  priority integer default 0,
  title text not null,
  description text,
  due_at timestamptz,
  event_at timestamptz,
  location text,
  source_label text,
  badge_type text, -- 'urgent' | 'warning' | 'info' | 'change'
  badge_label text,
  is_done boolean default false,
  created_at timestamptz default now()
);

-- Uploaded documents (school papers)
create table documents (
  id uuid primary key default gen_random_uuid(),
  family_id uuid references families(id) on delete cascade,
  child_id uuid references children(id),
  file_path text not null,
  file_name text,
  extracted_text text,
  ai_summary text,
  feed_items_created integer default 0,
  created_at timestamptz default now()
);

-- Enable Row Level Security
alter table families enable row level security;
alter table profiles enable row level security;
alter table children enable row level security;
alter table feed_items enable row level security;
alter table documents enable row level security;

-- RLS Policies (family members see only their family's data)
create policy "Family members can read their family" on families
  for select using (
    id in (select family_id from profiles where id = auth.uid())
  );

-- Allow anyone to read families by invite_code (for joining)
create policy "Anyone can lookup families by invite code" on families
  for select using (true);

create policy "Profiles visible within family" on profiles
  for all using (
    family_id in (select family_id from profiles where id = auth.uid())
    or id = auth.uid()
  );

-- Allow users to create/update their own profile
create policy "Users can upsert own profile" on profiles
  for insert with check (id = auth.uid());

create policy "Users can update own profile" on profiles
  for update using (id = auth.uid());

create policy "Children visible within family" on children
  for all using (
    family_id in (select family_id from profiles where id = auth.uid())
  );

create policy "Children insertable by family" on children
  for insert with check (
    family_id in (select family_id from profiles where id = auth.uid())
  );

create policy "Feed items visible within family" on feed_items
  for all using (
    family_id in (select family_id from profiles where id = auth.uid())
  );

create policy "Feed items insertable by family" on feed_items
  for insert with check (
    family_id in (select family_id from profiles where id = auth.uid())
  );

create policy "Documents visible within family" on documents
  for all using (
    family_id in (select family_id from profiles where id = auth.uid())
  );

create policy "Documents insertable by family" on documents
  for insert with check (
    family_id in (select family_id from profiles where id = auth.uid())
  );

-- Allow anyone to create a family (during onboarding)
create policy "Anyone can create a family" on families
  for insert with check (true);

-- Realtime: enable on feed_items so co-parents see updates live
alter publication supabase_realtime add table feed_items;
