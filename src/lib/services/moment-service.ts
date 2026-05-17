// ============================================================
// 说说 CRUD 服务层
// 封装所有说说相关的数据库操作
// 服务端/客户端均可调用
// ============================================================

import type { Moment, MomentImage, MomentWithImages, MomentWithAuthor, MomentAuthor, CreateMomentInput } from "@/types/moment";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";

type Supabase = SupabaseClient<Database>;

function groupImagesByMomentId(images: MomentImage[]): Record<string, MomentImage[]> {
  const map: Record<string, MomentImage[]> = {};
  for (const img of images) {
    if (!map[img.moment_id]) map[img.moment_id] = [];
    map[img.moment_id].push(img);
  }
  return map;
}

/** 从 join 结果中提取作者信息 */
function extractAuthor(row: Record<string, unknown>): MomentAuthor {
  const profile = row.profiles as { display_name: string | null; avatar_url: string | null } | null;
  return {
    display_name: profile?.display_name ?? null,
    avatar_url: profile?.avatar_url ?? null,
  };
}

/** 获取已发布说说列表（C 端，分页，含作者信息） */
export async function getPublishedMoments(
  supabase: Supabase,
  page = 0,
  pageSize = 20,
): Promise<MomentWithAuthor[]> {
  const { data: moments, error } = await supabase
    .from("moments")
    .select("*, profiles!moments_author_id_fkey(display_name, avatar_url)")
    .eq("status", "published")
    .order("created_at", { ascending: false })
    .range(page * pageSize, (page + 1) * pageSize - 1);

  if (error) throw new Error(error.message);
  if (!moments || moments.length === 0) return [];

  const momentIds = moments.map((m) => m.id);

  const { data: images, error: imgError } = await supabase
    .from("moment_images")
    .select("*")
    .in("moment_id", momentIds)
    .order("sort_order", { ascending: true });

  if (imgError) throw new Error(imgError.message);

  const grouped = groupImagesByMomentId((images as MomentImage[]) ?? []);

  return moments.map((m) => ({
    id: m.id,
    content: m.content,
    status: m.status,
    author_id: m.author_id,
    created_at: m.created_at,
    updated_at: m.updated_at,
    author: extractAuthor(m as Record<string, unknown>),
    images: grouped[m.id] ?? [],
  })) as MomentWithAuthor[];
}

/** 获取全部说说（B 端管理列表，含草稿，不分页，含作者信息） */
export async function getAllMoments(supabase: Supabase): Promise<MomentWithAuthor[]> {
  const { data: moments, error } = await supabase
    .from("moments")
    .select("*, profiles!moments_author_id_fkey(display_name, avatar_url)")
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  if (!moments || moments.length === 0) return [];

  const momentIds = moments.map((m) => m.id);

  const { data: images, error: imgError } = await supabase
    .from("moment_images")
    .select("*")
    .in("moment_id", momentIds)
    .order("sort_order", { ascending: true });

  if (imgError) throw new Error(imgError.message);

  const grouped = groupImagesByMomentId((images as MomentImage[]) ?? []);

  return moments.map((m) => ({
    id: m.id,
    content: m.content,
    status: m.status,
    author_id: m.author_id,
    created_at: m.created_at,
    updated_at: m.updated_at,
    author: extractAuthor(m as Record<string, unknown>),
    images: grouped[m.id] ?? [],
  })) as MomentWithAuthor[];
}

/** 按 ID 获取单条说说 + 关联图片 + 作者信息 */
export async function getMomentById(
  supabase: Supabase,
  id: string,
): Promise<MomentWithAuthor | null> {
  const { data: moment, error } = await supabase
    .from("moments")
    .select("*, profiles!moments_author_id_fkey(display_name, avatar_url)")
    .eq("id", id)
    .single();

  if (error || !moment) return null;

  const { data: images, error: imgError } = await supabase
    .from("moment_images")
    .select("*")
    .eq("moment_id", id)
    .order("sort_order", { ascending: true });

  if (imgError) throw new Error(imgError.message);

  return {
    id: moment.id,
    content: moment.content,
    status: moment.status,
    author_id: moment.author_id,
    created_at: moment.created_at,
    updated_at: moment.updated_at,
    author: extractAuthor(moment as Record<string, unknown>),
    images: (images as MomentImage[]) ?? [],
  } as MomentWithAuthor;
}

/** 创建说说 + 关联图片 */
export async function createMoment(
  supabase: Supabase,
  input: CreateMomentInput & { author_id: string },
): Promise<MomentWithAuthor> {
  const { data: moment, error } = await supabase
    .from("moments")
    .insert({
      content: input.content,
      status: "published",
      author_id: input.author_id,
    })
    .select()
    .single();

  if (error) throw new Error(error.message);
  if (!moment) throw new Error("创建说说失败");

  if (input.images && input.images.length > 0) {
    const imageRows = input.images.map((img, i) => ({
      moment_id: moment.id,
      url: img.url,
      width: img.width ?? null,
      height: img.height ?? null,
      sort_order: img.sort_order ?? i,
    }));

    const { error: imgError } = await supabase
      .from("moment_images")
      .insert(imageRows);

    if (imgError) throw new Error(imgError.message);
  }

  // 重新获取完整数据（含图片）
  return (await getMomentById(supabase, moment.id))!;
}

/** 删除说说（级联删除关联图片记录） */
export async function deleteMoment(
  supabase: Supabase,
  id: string,
): Promise<void> {
  const { error: imgError } = await supabase
    .from("moment_images")
    .delete()
    .eq("moment_id", id);

  if (imgError) throw new Error(imgError.message);

  const { error } = await supabase
    .from("moments")
    .delete()
    .eq("id", id);

  if (error) throw new Error(error.message);
}
