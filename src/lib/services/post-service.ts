// ============================================================
// 文章 CRUD 服务层
// 封装所有文章相关的数据库操作
// 服务端/客户端均可调用（根据场景选择 server client 或 browser client）
// ============================================================

import type { Post, CreatePostInput, UpdatePostInput } from "@/types/post";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";

type Supabase = SupabaseClient<Database>;

/** 获取已发布文章列表（C 端） */
export async function getPublishedPosts(
  supabase: Supabase,
  page = 0,
  pageSize = 10,
): Promise<Post[]> {
  const { data, error } = await supabase
    .from("posts")
    .select("*")
    .eq("status", "published")
    .order("published_at", { ascending: false })
    .range(page * pageSize, (page + 1) * pageSize - 1);

  if (error) throw new Error(error.message);
  return (data as Post[]) ?? [];
}

/** 按 slug 获取已发布文章（C 端详情页） */
export async function getPostBySlug(
  supabase: Supabase,
  slug: string,
): Promise<Post | null> {
  const { data, error } = await supabase
    .from("posts")
    .select("*")
    .eq("slug", slug)
    .eq("status", "published")
    .single();

  if (error) return null;
  return data as Post;
}

/** 获取全部文章（B 端管理列表，含草稿） */
export async function getAllPosts(supabase: Supabase): Promise<Post[]> {
  const { data, error } = await supabase
    .from("posts")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  return (data as Post[]) ?? [];
}

/** 按 ID 获取文章（B 端编辑页） */
export async function getPostById(
  supabase: Supabase,
  id: string,
): Promise<Post | null> {
  const { data, error } = await supabase
    .from("posts")
    .select("*")
    .eq("id", id)
    .single();

  if (error) return null;
  return data as Post;
}

/** 创建新文章 */
export async function createPost(
  supabase: Supabase,
  input: CreatePostInput & { author_id: string },
): Promise<Post> {
  const { data, error } = await supabase
    .from("posts")
    .insert({
      ...input,
      status: input.status ?? "draft",
    })
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data as Post;
}

/** 更新文章 */
export async function updatePost(
  supabase: Supabase,
  id: string,
  input: UpdatePostInput,
): Promise<Post> {
  const { data, error } = await supabase
    .from("posts")
    .update(input)
    .eq("id", id)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data as Post;
}

/** 删除文章 */
export async function deletePost(
  supabase: Supabase,
  id: string,
): Promise<void> {
  const { error } = await supabase.from("posts").delete().eq("id", id);

  if (error) throw new Error(error.message);
}

/** 获取文章总数（仪表盘统计） */
export async function getPostCount(supabase: Supabase): Promise<{
  total: number;
  published: number;
  draft: number;
}> {
  const { data, error } = await supabase
    .from("posts")
    .select("status");

  if (error || !data) return { total: 0, published: 0, draft: 0 };

  return {
    total: data.length,
    published: data.filter((p) => p.status === "published").length,
    draft: data.filter((p) => p.status === "draft").length,
  };
}
