-- ============================================================
-- 002_article_covers_storage.sql
-- 创建文章封面图片存储桶 + RLS 策略
-- 执行方式：Supabase Dashboard → SQL Editor
-- ============================================================

-- 1. 创建存储桶（通过 SQL 不可直接创建，需在 Supabase Dashboard → Storage 手动创建）
--    桶名称：article-covers
--    公开访问：是（封面图需要公开读取）
--    文件大小限制：5MB
--    允许的 MIME 类型：image/png, image/jpeg, image/webp, image/gif, image/svg+xml

-- 2. 公开读取策略（所有人可查看封面图）
CREATE POLICY "public_read_article_covers"
ON storage.objects FOR SELECT
USING (bucket_id = 'article-covers');

-- 3. 认证用户可上传
CREATE POLICY "auth_insert_article_covers"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'article-covers'
  AND auth.role() = 'authenticated'
);

-- 4. 认证用户可删除自己上传的封面
CREATE POLICY "auth_delete_own_covers"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'article-covers'
  AND auth.uid() = owner
);
