-- ============================================================
-- 004_moments.sql
-- 说说（Moments）模块数据表 + RLS 策略 + Storage 桶策略
-- 前置操作：
--   1. 在 Supabase Dashboard → SQL Editor 中执行本文件
--   2. 在 Supabase Dashboard → Storage 中手动创建桶：
--       名称：moment-images
--       公开访问：是
--       文件大小限制：5MB
--       允许 MIME：image/png, image/jpeg, image/webp, image/gif
-- ============================================================

-- 1. 说说主表
CREATE TABLE public.moments (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  content      TEXT NOT NULL,
  status       public.post_status NOT NULL DEFAULT 'published',
  author_id    UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_moments_created_at ON public.moments (status, created_at DESC);

-- 2. 说说图片表（1:N，不限制数量）
CREATE TABLE public.moment_images (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  moment_id  UUID NOT NULL REFERENCES public.moments(id) ON DELETE CASCADE,
  url        TEXT NOT NULL,
  width      INTEGER,
  height     INTEGER,
  sort_order SMALLINT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_moment_images_moment ON public.moment_images (moment_id, sort_order);

-- 3. updated_at 自动更新触发器
CREATE TRIGGER update_moments_updated_at
  BEFORE UPDATE ON public.moments
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 4. RLS 策略
ALTER TABLE public.moments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.moment_images ENABLE ROW LEVEL SECURITY;

CREATE POLICY "moments_public_read_published" ON public.moments
  FOR SELECT USING (status = 'published');

CREATE POLICY "moments_owner_read_all" ON public.moments
  FOR SELECT USING (auth.uid() = author_id);

CREATE POLICY "moments_auth_insert" ON public.moments
  FOR INSERT WITH CHECK (auth.uid() = author_id);

CREATE POLICY "moments_owner_update" ON public.moments
  FOR UPDATE USING (auth.uid() = author_id);

CREATE POLICY "moments_owner_delete" ON public.moments
  FOR DELETE USING (auth.uid() = author_id);

CREATE POLICY "moment_images_public_read" ON public.moment_images
  FOR SELECT USING (true);

CREATE POLICY "moment_images_auth_insert" ON public.moment_images
  FOR INSERT WITH CHECK (
    auth.uid() = (SELECT author_id FROM public.moments WHERE id = moment_id)
  );

CREATE POLICY "moment_images_owner_delete" ON public.moment_images
  FOR DELETE USING (
    auth.uid() = (SELECT author_id FROM public.moments WHERE id = moment_id)
  );

-- 5. Storage 桶策略
CREATE POLICY "public_read_moment_images"
ON storage.objects FOR SELECT
USING (bucket_id = 'moment-images');

CREATE POLICY "auth_insert_moment_images"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'moment-images'
  AND auth.role() = 'authenticated'
);

CREATE POLICY "auth_delete_own_moment_images"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'moment-images'
  AND auth.uid() = owner
);
