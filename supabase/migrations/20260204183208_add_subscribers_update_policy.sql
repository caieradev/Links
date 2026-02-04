-- Add phone column to subscribers
ALTER TABLE subscribers ADD COLUMN IF NOT EXISTS phone text;

-- Ensure ALL policy exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
    AND tablename = 'subscribers'
    AND policyname = 'Allow all operations on subscribers'
  ) THEN
    EXECUTE 'CREATE POLICY "Allow all operations on subscribers" ON public.subscribers FOR ALL USING (true) WITH CHECK (true)';
  END IF;
END $$;

-- Drop any other policies besides the ALL policy
DO $$
DECLARE
  policy_record RECORD;
BEGIN
  FOR policy_record IN
    SELECT policyname
    FROM pg_policies
    WHERE schemaname = 'public'
    AND tablename = 'subscribers'
    AND policyname != 'Allow all operations on subscribers'
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.subscribers', policy_record.policyname);
  END LOOP;
END $$;
