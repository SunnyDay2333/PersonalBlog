"use client";

// ============================================================
// 全局错误页面
// 捕获未处理的渲染错误，展示友好提示
// ============================================================

import { useEffect } from "react";
import { PublicHeader } from "@/components/layout/public-header";
import { PublicFooter } from "@/components/layout/public-footer";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("页面渲染错误:", error);
  }, [error]);

  return (
    <>
      <PublicHeader />
      <main className="flex flex-1 items-center justify-center px-4 py-20">
        <div className="flex max-w-sm flex-col items-center text-center">
          <AlertTriangle className="mb-4 h-10 w-10 text-destructive" />
          <h1 className="text-lg font-semibold text-foreground">
            出错了
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            页面渲染时遇到了问题。请稍后重试。
          </p>
          <Button onClick={reset} className="mt-6" variant="outline">
            重新加载
          </Button>
        </div>
      </main>
      <PublicFooter />
    </>
  );
}
