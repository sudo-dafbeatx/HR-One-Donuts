-- Fix admin_users schema to support login
ALTER TABLE public.admin_users
ADD COLUMN IF NOT EXISTS username TEXT UNIQUE,
ADD COLUMN IF NOT EXISTS password_hash TEXT;

-- Drop the foreign key constraint on auth.users because admin accounts are now independent
ALTER TABLE public.admin_users DROP CONSTRAINT IF EXISTS admin_users_id_fkey;

-- Give ID a default random UUID if it doesn't have one
ALTER TABLE public.admin_users ALTER COLUMN id SET DEFAULT gen_random_uuid();

-- Old accounts may not have an email
ALTER TABLE public.admin_users
ALTER COLUMN email DROP NOT NULL;

-- Insert the default admin account
INSERT INTO public.admin_users (username, password_hash, role)
VALUES (
  'admin_hronedonut',
  '$2b$10$EsaS2CmPxalm22QHKYKBJ.XAzRUzMx5aqXArnVZSVwzLCd.y5W0yO',
  'admin'
)
ON CONFLICT (username) DO UPDATE 
SET password_hash = EXCLUDED.password_hash;
