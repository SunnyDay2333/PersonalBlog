// ============================================================
// 全局加载页
// 路由切换时展示骨架屏
// ============================================================

import { PublicHeader } from "@/components/layout/public-header";
import { PublicFooter } from "@/components/layout/public-footer";
import { Skeleton } from "@/components/ui/skeleton";

export default function LoadingPage() {
  return (
    <>
      <PublicHeader />

      <main className="flex-1">
        {/* Hero 骨架 */}
        <div className="border-b border-border">
          <div className="mx-auto max-w-3xl px-4 py-20 sm:px-6 sm:py-28">
            <Skeleton className="mb-6 h-4 w-20" />
            <Skeleton className="mb-4 h-10 w-64" />
            <Skeleton className="mb-3 h-5 w-96" />
            <Skeleton className="mb-6 h-5 w-80" />
            <Skeleton className="h-10 w-28" />
          </div>
        </div>

        {/* 文章列表骨架 */}
        <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
          <Skeleton className="mb-8 h-4 w-24" />
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex gap-6 py-4">
                <Skeleton className="h-4 w-20 shrink-0" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-5 w-48" />
                  <Skeleton className="h-4 w-full" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>

      <PublicFooter />
    </>
  );
}
