-- Migration: Security fixes for functions and RLS policies
-- Fixes warnings from Supabase Security Advisor

-- ============================================
-- 1. FIX FUNCTION SEARCH_PATH (3 functions)
-- ============================================

-- Fix increment_link_click - add search_path
CREATE OR REPLACE FUNCTION public.increment_link_click(link_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE links
  SET click_count = click_count + 1
  WHERE id = link_id;
END;
$$;

-- Fix update_updated_at - add search_path
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Fix update_subscriptions_updated_at - add search_path
CREATE OR REPLACE FUNCTION public.update_subscriptions_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- ============================================
-- 2. FIX RLS POLICIES (analytics_events, subscribers)
-- ============================================

-- Drop overly permissive policies
DROP POLICY IF EXISTS "Allow anonymous inserts" ON analytics_events;
DROP POLICY IF EXISTS "Anyone can subscribe" ON subscribers;

-- Create more restrictive policy for analytics_events
-- Validates that profile_id exists in profiles table
CREATE POLICY "Allow inserts for valid profiles"
ON analytics_events FOR INSERT
WITH CHECK (
  EXISTS (SELECT 1 FROM profiles WHERE id = profile_id)
);

-- Create more restrictive policy for subscribers
-- Validates that profile_id exists in profiles table
CREATE POLICY "Allow subscribe to valid profiles"
ON subscribers FOR INSERT
WITH CHECK (
  EXISTS (SELECT 1 FROM profiles WHERE id = profile_id)
);
