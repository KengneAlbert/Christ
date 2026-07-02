-- ============================================================
-- Sécurisation : RLS admin_users + rate limiting serveur
-- ============================================================

-- 1. RLS sur admin_users (manquait)
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin can read own record"
ON public.admin_users FOR SELECT
USING (auth.uid() = id);

CREATE POLICY "Admin can update own record"
ON public.admin_users FOR UPDATE
USING (auth.uid() = id);

CREATE POLICY "Admin can insert own record"
ON public.admin_users FOR INSERT
WITH CHECK (auth.uid() = id);

-- 2. Table login_attempts pour rate limiting côté serveur
CREATE TABLE IF NOT EXISTS public.login_attempts (
    id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    email       TEXT        NOT NULL,
    success     BOOLEAN     NOT NULL DEFAULT FALSE,
    attempted_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_login_attempts_email_time
    ON public.login_attempts (email, attempted_at);

ALTER TABLE public.login_attempts ENABLE ROW LEVEL SECURITY;

-- Autoriser INSERT anonyme (avant authentification)
CREATE POLICY "Allow anonymous insert for login attempts"
ON public.login_attempts FOR INSERT
WITH CHECK (true);

-- Pas de SELECT public : seules les fonctions SECURITY DEFINER peuvent lire

-- 3. Vérifie si l'email est bloqué (>= 5 échecs sur la dernière heure)
CREATE OR REPLACE FUNCTION public.check_login_rate_limit(p_email TEXT)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COUNT(*) >= 5
  FROM public.login_attempts
  WHERE email = lower(p_email)
    AND success = FALSE
    AND attempted_at > NOW() - INTERVAL '1 hour';
$$;

-- 4. Enregistre une tentative (succès ou échec)
CREATE OR REPLACE FUNCTION public.record_login_attempt(p_email TEXT, p_success BOOLEAN)
RETURNS VOID
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  INSERT INTO public.login_attempts (email, success)
  VALUES (lower(p_email), p_success);
$$;

-- 5. Nettoyage automatique des tentatives > 24h (à appeler via pg_cron ou manuellement)
CREATE OR REPLACE FUNCTION public.cleanup_old_login_attempts()
RETURNS VOID
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  DELETE FROM public.login_attempts
  WHERE attempted_at < NOW() - INTERVAL '24 hours';
$$;
