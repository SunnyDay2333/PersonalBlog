// ============================================================
// 管理员 Supabase 客户端（Service Role）
// 仅限服务端使用！拥有绕过 RLS 的超级权限
// 严禁在任何客户端代码中引入此文件
// ============================================================

import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";

/**
 * 创建 Service Role 客户端
 * 使用 SUPABASE_SERVICE_ROLE_KEY（非 NEXT_PUBLIC_ 前缀，不会暴露到前端）
 * 用于需要绕过 RLS 的操作，如：获取所有文章（含草稿）、管理用户等
 */
export function createAdminClient() {
  return createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    },
  );
}
