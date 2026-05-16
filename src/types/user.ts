// ============================================================
// 用户 / 管理员资料类型定义
// 对应数据库 public.profiles 表 + Supabase Auth 用户
// ============================================================

/** 用户资料（对应 public.profiles 表） */
export interface Profile {
  id: string;
  username: string | null;
  display_name: string | null;
  avatar_url: string | null;
  bio: string | null;
  website: string | null;
  created_at: string;
  updated_at: string;
}

/** Supabase Auth 用户（精简字段，仅保留常用属性） */
export interface AuthUser {
  id: string;
  email?: string;
  profile: Profile | null;
}
