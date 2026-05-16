"use client";

// ============================================================
// Admin 鉴权守卫组件
// 包裹管理端页面，未登录时重定向至登录页
// 与 proxy.ts 形成双重保障：proxy 拦截请求，auth-guard 客户端兜底
// ============================================================

import { useEffect, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import { ADMIN_LOGIN_PATH } from "@/lib/constants";
import { Skeleton } from "@/components/ui/skeleton";

interface AuthGuardProps {
  children: ReactNode;
}

export function AuthGuard({ children }: AuthGuardProps) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && !loading && !user) {
      const loginUrl = new URL(ADMIN_LOGIN_PATH, window.location.origin);
      loginUrl.searchParams.set("redirect", window.location.pathname);
      router.replace(loginUrl.toString());
    }
  }, [mounted, loading, user, router]);

  // SSR 期间 / 加载中显示骨架屏，避免闪烁
  if (!mounted || loading) {
    return (
      <div className="flex flex-col gap-6 p-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-96" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  // 未登录：不渲染任何内容（useEffect 会触发重定向）
  if (!user) {
    return null;
  }

  return <>{children}</>;
}
