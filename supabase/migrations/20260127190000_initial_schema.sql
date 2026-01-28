-- Create profiles table
create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text unique not null,
  display_name text,
  bio text,
  avatar_url text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Create links table
create table links (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) on delete cascade not null,
  title text not null,
  url text not null,
  description text,
  icon text,
  thumbnail_url text,
  position integer not null,
  is_active boolean default true,
  click_count integer default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Create page_settings table
create table page_settings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) on delete cascade unique not null,
  background_type text default 'solid',
  background_color text default '#ffffff',
  background_gradient_start text,
  background_gradient_end text,
  background_gradient_direction text default 'to bottom',
  background_image_url text,
  background_blur integer default 0,
  text_color text default '#000000',
  link_background_color text default '#f3f4f6',
  link_text_color text default '#000000',
  link_hover_color text default '#e5e7eb',
  font_family text default 'Inter',
  link_style text default 'rounded',
  link_shadow boolean default false,
  show_avatar boolean default true,
  show_bio boolean default true,
  avatar_size text default 'medium',
  link_animation text default 'none',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Create feature_flags table
create table feature_flags (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) on delete cascade unique not null,
  can_use_custom_colors boolean default true,
  can_use_gradients boolean default false,
  can_use_custom_background_image boolean default false,
  can_use_custom_fonts boolean default false,
  can_use_animations boolean default false,
  can_use_link_thumbnails boolean default false,
  can_use_link_scheduling boolean default false,
  can_view_analytics boolean default false,
  can_use_custom_domain boolean default false,
  can_remove_branding boolean default false,
  max_links integer default 10,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Create custom_domains table
create table custom_domains (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) on delete cascade not null,
  domain text unique not null,
  is_verified boolean default false,
  verification_token text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Create indexes
create index links_user_id_idx on links(user_id);
create index links_position_idx on links(user_id, position);
create index custom_domains_domain_idx on custom_domains(domain);

-- Function to increment link clicks
create or replace function increment_link_click(link_id uuid)
returns void as $$
begin
  update links
  set click_count = click_count + 1
  where id = link_id;
end;
$$ language plpgsql security definer;

-- Function to update updated_at timestamp
create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Triggers for updated_at
create trigger profiles_updated_at before update on profiles
  for each row execute function update_updated_at();

create trigger links_updated_at before update on links
  for each row execute function update_updated_at();

create trigger page_settings_updated_at before update on page_settings
  for each row execute function update_updated_at();

create trigger feature_flags_updated_at before update on feature_flags
  for each row execute function update_updated_at();

create trigger custom_domains_updated_at before update on custom_domains
  for each row execute function update_updated_at();
