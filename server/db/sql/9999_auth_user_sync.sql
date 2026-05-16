-- Manual migration: sync Supabase Auth users into public.users.
--
-- Why this is NOT in the drizzle-managed migrations/ folder:
--   drizzle-kit only tracks DDL it generated from TS schema. Triggers on the
--   reserved auth.* schema (owned by Supabase) need to be applied out-of-band
--   so they survive `drizzle-kit drop` and aren't fought over by the toolchain.
--
-- Apply: Supabase Dashboard → SQL Editor → paste & run.
-- Re-running is safe (CREATE OR REPLACE + DROP TRIGGER IF EXISTS).

CREATE OR REPLACE FUNCTION public.handle_new_auth_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.users (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    'jamaah'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_auth_user();
