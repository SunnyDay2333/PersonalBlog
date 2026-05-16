// ============================================================
// 管理员登录页
// 仅限单用户超级管理员使用 Supabase Auth 邮箱密码登录
// ============================================================

import { Suspense } from "react";
import type { Metadata } from "next";
import { LoginForm } from "./login-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { SITE_NAME } from "@/lib/constants";

export const metadata: Metadata = {
  title: "管理员登录",
  robots: { index: false, follow: false },
};

export default function LoginPage() {
  return (
    <div className="flex min-h-full flex-col items-center justify-center">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <CardTitle className="text-xl">{SITE_NAME} 控制台</CardTitle>
          <p className="text-xs text-muted-foreground">管理员登录</p>
        </CardHeader>
        <CardContent>
          <Suspense
            fallback={
              <div className="flex flex-col gap-4">
                <Skeleton className="h-9 w-full" />
                <Skeleton className="h-9 w-full" />
                <Skeleton className="h-10 w-full" />
              </div>
            }
          >
            <LoginForm />
          </Suspense>
        </CardContent>
      </Card>
    </div>
  );
}
