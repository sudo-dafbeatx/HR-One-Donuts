-- Fix: Avatar profil tidak muncul di ulasan
-- Sebelumnya RPC hanya ambil avatar dari auth.users metadata (Google OAuth)
-- Sekarang prioritas: profiles.avatar_url > auth metadata

CREATE OR REPLACE FUNCTION public.get_product_reviews_with_user_info(
  p_product_id TEXT,
  p_limit INTEGER DEFAULT 10,
  p_offset INTEGER DEFAULT 0
)
RETURNS TABLE (
  id UUID,
  product_id TEXT,
  user_id UUID,
  rating INTEGER,
  comment TEXT,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ,
  reviewer_name TEXT,
  reviewer_avatar TEXT,
  reviewer_email TEXT
)
SET search_path = public
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    pr.id,
    pr.product_id,
    pr.user_id,
    pr.rating,
    pr.comment,
    pr.created_at,
    pr.updated_at,
    COALESCE(
      p.full_name,
      u.raw_user_meta_data->>'full_name',
      u.raw_user_meta_data->>'name',
      SPLIT_PART(u.email, '@', 1)
    ) as reviewer_name,
    COALESCE(
      p.avatar_url,
      u.raw_user_meta_data->>'avatar_url',
      u.raw_user_meta_data->>'picture'
    ) as reviewer_avatar,
    u.email as reviewer_email
  FROM public.product_reviews pr
  JOIN auth.users u ON pr.user_id = u.id
  LEFT JOIN public.profiles p ON pr.user_id = p.id
  WHERE pr.product_id = p_product_id
  ORDER BY pr.created_at DESC
  LIMIT p_limit
  OFFSET p_offset;
END;
$$;
