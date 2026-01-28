-- Create link_sections table
create table link_sections (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid references profiles(id) on delete cascade not null,
  title text not null,
  position integer not null default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Add section_id to links table
alter table links add column section_id uuid references link_sections(id) on delete set null;

-- Add feature flag for link sections
alter table feature_flags add column can_use_link_sections boolean default false;

-- Create indexes
create index link_sections_profile_id_idx on link_sections(profile_id);
create index link_sections_position_idx on link_sections(profile_id, position);
create index links_section_id_idx on links(section_id);

-- Enable RLS
alter table link_sections enable row level security;

-- Link sections policies
create policy "Link sections are publicly viewable"
  on link_sections for select
  using (true);

create policy "Users can insert their own sections"
  on link_sections for insert
  with check (auth.uid() = profile_id);

create policy "Users can update their own sections"
  on link_sections for update
  using (auth.uid() = profile_id);

create policy "Users can delete their own sections"
  on link_sections for delete
  using (auth.uid() = profile_id);

-- Trigger for updated_at
create trigger link_sections_updated_at before update on link_sections
  for each row execute function update_updated_at();
