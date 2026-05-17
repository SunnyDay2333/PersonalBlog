// ============================================================
// 说说相关类型定义
// 与数据库 public.moments / public.moment_images 表字段一一对应
// ============================================================

import type { PostStatus } from "./post";

/** 说说实体（对应数据库 moments 表） */
export interface Moment {
  id: string;
  content: string;
  status: PostStatus;
  author_id: string;
  created_at: string;
  updated_at: string;
}

/** 说说图片（对应数据库 moment_images 表） */
export interface MomentImage {
  id: string;
  moment_id: string;
  url: string;
  width: number | null;
  height: number | null;
  sort_order: number;
  created_at: string;
}

/** 说说 + 关联图片（C 端展示用聚合类型） */
export interface MomentWithImages extends Moment {
  images: MomentImage[];
}

/** 创建说说时的输入 */
export interface CreateMomentInput {
  content: string;
  images?: {
    url: string;
    width?: number | null;
    height?: number | null;
    sort_order?: number;
  }[];
}
