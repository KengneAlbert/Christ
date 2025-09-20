-- Update RLS policies to allow admins to manage authorized_admins

-- Ensure RLS is enabled (should already be from earlier migration)
ALTER TABLE public.authorized_admins ENABLE ROW LEVEL SECURITY;

-- Optional: keep or replace existing read policy; we add a specific admin policy for full access

-- Allow admins to SELECT any rows
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'authorized_admins' AND policyname = 'Allow admins read authorized_admins'
  ) THEN
    CREATE POLICY "Allow admins read authorized_admins"
    ON public.authorized_admins
    FOR SELECT
    USING (public.is_admin());
  END IF;
END $$;

-- Allow admins to INSERT
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'authorized_admins' AND policyname = 'Allow admins insert authorized_admins'
  ) THEN
    CREATE POLICY "Allow admins insert authorized_admins"
    ON public.authorized_admins
    FOR INSERT
    WITH CHECK (public.is_admin());
  END IF;
END $$;

-- Allow admins to UPDATE
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'authorized_admins' AND policyname = 'Allow admins update authorized_admins'
  ) THEN
    CREATE POLICY "Allow admins update authorized_admins"
    ON public.authorized_admins
    FOR UPDATE
    USING (public.is_admin())
    WITH CHECK (public.is_admin());
  END IF;
END $$;

-- Allow admins to DELETE
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'authorized_admins' AND policyname = 'Allow admins delete authorized_admins'
  ) THEN
    CREATE POLICY "Allow admins delete authorized_admins"
    ON public.authorized_admins
    FOR DELETE
    USING (public.is_admin());
  END IF;
END $$;
