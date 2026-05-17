// ============================================================
// 说说 CRUD 服务层
// 封装所有说说相关的数据库操作
// 服务端/客户端均可调用
// ============================================================

import type { Moment, MomentImage, MomentWithImages, CreateMomentInput } from "@/types/moment";
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

/** 获取已发布说说列表（C 端，分页） */
export async function getPublishedMoments(
  supabase: Supabase,
  page = 0,
  pageSize = 20,
): Promise<MomentWithImages[]> {
  const { data: moments, error } = await supabase
    .from("moments")
    .select("*")
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
    ...m,
    images: grouped[m.id] ?? [],
  })) as MomentWithImages[];
}

/** 获取全部说说（B 端管理列表，含草稿，不分页） */
export async function getAllMoments(supabase: Supabase): Promise<MomentWithImages[]> {
  const { data: moments, error } = await supabase
    .from("moments")
    .select("*")
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
    ...m,
    images: grouped[m.id] ?? [],
  })) as MomentWithImages[];
}

/** 按 ID 获取单条说说 + 关联图片 */
export async function getMomentById(
  supabase: Supabase,
  id: string,
): Promise<MomentWithImages | null> {
  const { data: moment, error } = await supabase
    .from("moments")
    .select("*")
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
    ...moment,
    images: (images as MomentImage[]) ?? [],
  } as MomentWithImages;
}

/** 创建说说 + 关联图片 */
export async function createMoment(
  supabase: Supabase,
  input: CreateMomentInput & { author_id: string },
): Promise<MomentWithImages> {
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
