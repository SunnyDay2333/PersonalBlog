-- ============================================================
-- 003_article_images_storage.sql
-- 创建文章正文图片存储桶 + RLS 策略
-- 用于粘贴上传 / 拖拽上传的正文内嵌图片
--
-- 前置操作：
--   在 Supabase Dashboard → Storage 中手动创建桶：
--     名称：article-images
--     公开访问：是
--     文件大小限制：10MB
--     允许的 MIME 类型：image/png, image/jpeg, image/webp, image/gif, image/svg+xml
-- ============================================================

-- 1. 公开读取策略（所有人可查看文章图片）
CREATE POLICY "public_read_article_images"
ON storage.objects FOR SELECT
USING (bucket_id = 'article-images');

-- 2. 认证用户可上传
CREATE POLICY "auth_insert_article_images"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'article-images'
  AND auth.role() = 'authenticated'
);

-- 3. 认证用户可删除自己上传的图片
CREATE POLICY "auth_delete_own_images"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'article-images'
  AND auth.uid() = owner
);
