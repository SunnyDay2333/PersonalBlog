-- ============================================================
-- 001_initial_schema.sql
-- Supabase 初始数据库架构
-- 执行方式：在 Supabase Dashboard → SQL Editor 中粘贴执行
-- ============================================================

-- 0. 启用 UUID 扩展（通常已默认启用）
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- 1. profiles — 管理员用户资料
--   与 Supabase Auth 的 auth.users 表 1:1 映射
-- ============================================================
CREATE TABLE public.profiles (
  id          UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username    TEXT UNIQUE,
  display_name TEXT,
  avatar_url  TEXT,
  bio         TEXT,
  website     TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- 2. categories — 文章分类（可选扩展）
-- ============================================================
CREATE TABLE public.categories (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name        TEXT NOT NULL UNIQUE,
  slug        TEXT NOT NULL UNIQUE,
  description TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- 3. posts — 文章/动态主表
-- ============================================================
CREATE TYPE public.post_status AS ENUM ('draft', 'published', 'archived');

CREATE TABLE public.posts (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title        TEXT NOT NULL,
  slug         TEXT NOT NULL UNIQUE,
  content      TEXT NOT NULL DEFAULT '',          -- Markdown 原始内容
  excerpt      TEXT,                               -- 摘要（自动截取或手动填写）
  cover_image  TEXT,                               -- 封面图 URL
  status       post_status NOT NULL DEFAULT 'draft',
  featured     BOOLEAN NOT NULL DEFAULT false,
  published_at TIMESTAMPTZ,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  author_id    UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE
);

-- 索引：按发布时间倒序查询（首页高频查询）
CREATE INDEX idx_posts_published_at ON public.posts (status, published_at DESC);
CREATE INDEX idx_posts_slug       ON public.posts (slug);

-- ============================================================
-- 4. post_categories — 文章-分类多对多关联表
-- ============================================================
CREATE TABLE public.post_categories (
  post_id     UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  category_id UUID NOT NULL REFERENCES public.categories(id) ON DELETE CASCADE,
  PRIMARY KEY (post_id, category_id)
);

-- ============================================================
-- 5. updated_at 自动更新触发器
-- ============================================================
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_posts_updated_at
  BEFORE UPDATE ON public.posts
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================================
-- 6. 自动创建 profile（注册时触发）
-- ============================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, username, display_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data ->> 'username',
    NEW.raw_user_meta_data ->> 'display_name',
    NEW.raw_user_meta_data ->> 'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================================
-- 7. Row Level Security (RLS) 策略
-- ============================================================

-- 启用 RLS
ALTER TABLE public.profiles        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.posts           ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_categories ENABLE ROW LEVEL SECURITY;

-- ---- profiles 策略 ----
-- 所有人可读
CREATE POLICY "profiles_public_read" ON public.profiles
  FOR SELECT USING (true);
-- 仅本人可更新
CREATE POLICY "profiles_owner_update" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- ---- posts 策略 ----
-- 所有人可读已发布文章
CREATE POLICY "posts_public_read_published" ON public.posts
  FOR SELECT USING (status = 'published');
-- 认证用户可读自己的全部文章（含草稿）
CREATE POLICY "posts_owner_read_all" ON public.posts
  FOR SELECT USING (auth.uid() = author_id);
-- 认证用户可创建
CREATE POLICY "posts_auth_insert" ON public.posts
  FOR INSERT WITH CHECK (auth.uid() = author_id);
-- 认证用户可更新自己的文章
CREATE POLICY "posts_owner_update" ON public.posts
  FOR UPDATE USING (auth.uid() = author_id);
-- 认证用户可删除自己的文章
CREATE POLICY "posts_owner_delete" ON public.posts
  FOR DELETE USING (auth.uid() = author_id);

-- ---- categories 策略 ----
CREATE POLICY "categories_public_read" ON public.categories
  FOR SELECT USING (true);

-- ---- post_categories 策略 ----
CREATE POLICY "post_categories_public_read" ON public.post_categories
  FOR SELECT USING (true);
