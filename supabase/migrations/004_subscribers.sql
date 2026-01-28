-- Create subscribers table
create table subscribers (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid references profiles(id) on delete cascade not null,
  email text not null,
  name text,
  created_at timestamptz default now(),
  unique(profile_id, email)
);

-- Add subscriber form settings to page_settings
alter table page_settings add column subscriber_form_enabled boolean default false;
alter table page_settings add column subscriber_form_title text default 'Inscreva-se';
alter table page_settings add column subscriber_form_description text;

-- Add subscriber feature flag
alter table feature_flags add column can_collect_subscribers boolean default false;

-- Change max_links default to NULL (unlimited for free tier)
alter table feature_flags alter column max_links set default null;

-- Create indexes
create index subscribers_profile_id_idx on subscribers(profile_id);
create index subscribers_created_at_idx on subscribers(profile_id, created_at desc);

-- Enable RLS
alter table subscribers enable row level security;

-- Subscribers policies
-- Users can view their own subscribers
create policy "Users can view their own subscribers"
  on subscribers for select
  using (auth.uid() = profile_id);

-- Users can delete their own subscribers
create policy "Users can delete their own subscribers"
  on subscribers for delete
  using (auth.uid() = profile_id);

-- Public can insert subscribers (with validation in application)
create policy "Anyone can subscribe"
  on subscribers for insert
  with check (true);

-- Trigger for updated_at (subscribers don't have updated_at, but adding for consistency if needed later)
