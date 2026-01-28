-- Allow public read access to feature_flags
-- This is needed for public pages to know what features the profile owner has enabled

-- Drop the restrictive policy
drop policy if exists "Users can view their own feature flags" on feature_flags;

-- Create a new policy that allows anyone to read feature flags
create policy "Feature flags are publicly viewable"
  on feature_flags for select
  using (true);

-- Keep the insert policy restrictive (only owner can create their own flags)
-- The existing insert policy is fine
