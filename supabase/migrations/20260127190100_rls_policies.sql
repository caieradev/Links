-- Enable RLS on all tables
alter table profiles enable row level security;
alter table links enable row level security;
alter table page_settings enable row level security;
alter table feature_flags enable row level security;
alter table custom_domains enable row level security;

-- Profiles policies
create policy "Profiles are publicly viewable"
  on profiles for select
  using (true);

create policy "Users can insert their own profile"
  on profiles for insert
  with check (auth.uid() = id);

create policy "Users can update their own profile"
  on profiles for update
  using (auth.uid() = id);

-- Links policies
create policy "Active links are publicly viewable"
  on links for select
  using (is_active = true);

create policy "Users can view their own links"
  on links for select
  using (auth.uid() = user_id);

create policy "Users can insert their own links"
  on links for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own links"
  on links for update
  using (auth.uid() = user_id);

create policy "Users can delete their own links"
  on links for delete
  using (auth.uid() = user_id);

-- Page settings policies
create policy "Page settings are publicly viewable"
  on page_settings for select
  using (true);

create policy "Users can insert their own page settings"
  on page_settings for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own page settings"
  on page_settings for update
  using (auth.uid() = user_id);

-- Feature flags policies
create policy "Users can view their own feature flags"
  on feature_flags for select
  using (auth.uid() = user_id);

create policy "Users can insert their own feature flags"
  on feature_flags for insert
  with check (auth.uid() = user_id);

-- Custom domains policies
create policy "Users can view their own domains"
  on custom_domains for select
  using (auth.uid() = user_id);

create policy "Users can insert their own domains"
  on custom_domains for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own domains"
  on custom_domains for update
  using (auth.uid() = user_id);

create policy "Users can delete their own domains"
  on custom_domains for delete
  using (auth.uid() = user_id);

-- Allow public read of custom_domains for domain resolution (domain lookup only)
create policy "Verified domains are publicly viewable"
  on custom_domains for select
  using (is_verified = true);
