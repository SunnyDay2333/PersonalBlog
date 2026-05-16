// ============================================================
// Next.js Proxy
// 拦截 /admin 及其子路由，校验 Supabase Auth 登录状态
// 未登录用户重定向至 /admin/login
// ============================================================

import { createServerClient } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";
import { ADMIN_ROUTE_PREFIX, ADMIN_LOGIN_PATH } from "@/lib/constants";

export async function proxy(request: NextRequest) {
  // 创建响应对象，用于后续 cookie 写入
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            request.cookies.set(name, value);
            response.cookies.set(name, value, options);
          });
        },
      },
    },
  );

  // 获取当前 session —— 避免对每次请求都调用 getUser（性能考虑）
  const {
    data: { session },
  } = await supabase.auth.getSession();

  const { pathname } = request.nextUrl;

  // 安全管理：已登录用户访问登录页，重定向至管理首页
  if (pathname === ADMIN_LOGIN_PATH && session) {
    return NextResponse.redirect(new URL("/admin", request.url));
  }

  // 未登录用户访问 /admin/*（除登录页外），重定向至登录页
  if (
    pathname.startsWith(ADMIN_ROUTE_PREFIX) &&
    pathname !== ADMIN_LOGIN_PATH &&
    !session
  ) {
    const loginUrl = new URL(ADMIN_LOGIN_PATH, request.url);
    // 登录成功后跳回原页面
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return response;
}

/** 中间件匹配范围：仅 /admin 及其子路由 */
export const config = {
  matcher: ["/admin/:path*"],
};
