// ============================================================
// 鉴权服务层
// 封装 Supabase Auth 的登录/登出/获取用户等操作
// ============================================================

import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";

type Supabase = SupabaseClient<Database>;

/** 邮箱密码登录 */
export async function signIn(
  supabase: Supabase,
  email: string,
  password: string,
) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) throw new Error(error.message);
  return data;
}

/** 退出登录 */
export async function signOut(supabase: Supabase) {
  const { error } = await supabase.auth.signOut();
  if (error) throw new Error(error.message);
}

/** 获取当前登录用户（服务端） */
export async function getCurrentUser(supabase: Supabase) {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

/** 获取当前 session（中间件用） */
export async function getSession(supabase: Supabase) {
  const {
    data: { session },
  } = await supabase.auth.getSession();
  return session;
}
