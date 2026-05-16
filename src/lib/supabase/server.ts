// ============================================================
// 服务端 Supabase 客户端
// 在 Server Component / Route Handler 中调用
// 通过 cookies() 读取请求中的 session token
// ============================================================

import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import type { Database } from "@/types/database";

/**
 * 创建服务端 Supabase 客户端
 * 适用于 Server Components 和 Route Handlers
 * 自动从请求 cookies 中提取 session 进行认证
 */
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            );
          } catch {
            // 在 Server Component 中调用 setAll 会抛出异常
            // 忽略即可 —— 中间件已处理 cookie 刷新
          }
        },
      },
    },
  );
}
