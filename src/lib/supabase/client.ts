// ============================================================
// 浏览器端 Supabase 客户端（单例）
// 仅在客户端组件中调用 —— 使用 createBrowserClient
// ============================================================

import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "@/types/database";

/**
 * 创建浏览器端 Supabase 客户端
 * 使用 @supabase/ssr 的 createBrowserClient，自动处理 cookie 持久化
 * 导出为函数而非单例，确保每次调用都使用最新的环境变量
 */
export function createClient() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
}
