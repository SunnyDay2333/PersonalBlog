// ============================================================
// 文章相关类型定义
// 与数据库 public.posts 表字段一一对应
// ============================================================

/** 文章状态枚举 */
export type PostStatus = "draft" | "published" | "archived";

/** 文章实体（完整字段，对应数据库 posts 表） */
export interface Post {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string | null;
  cover_image: string | null;
  status: PostStatus;
  featured: boolean;
  published_at: string | null;
  created_at: string;
  updated_at: string;
  author_id: string;
}

/** 创建文章时的输入字段（不含服务端自动生成的字段） */
export interface CreatePostInput {
  title: string;
  slug: string;
  content?: string;
  excerpt?: string;
  cover_image?: string;
  status?: PostStatus;
  featured?: boolean;
  published_at?: string;
}

/** 更新文章时的输入字段（全部可选） */
export interface UpdatePostInput extends Partial<CreatePostInput> {}
