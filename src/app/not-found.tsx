// ============================================================
// 404 页面
// ============================================================

import Link from "next/link";
import { PublicHeader } from "@/components/layout/public-header";
import { PublicFooter } from "@/components/layout/public-footer";
import { FileQuestion } from "lucide-react";

export default function NotFoundPage() {
  return (
    <>
      <PublicHeader />
      <main className="flex flex-1 items-center justify-center px-4 py-20">
        <div className="flex max-w-sm flex-col items-center text-center">
          <FileQuestion className="mb-4 h-10 w-10 text-muted-foreground" />
          <h1 className="text-lg font-semibold text-foreground">
            页面未找到
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            你访问的页面不存在，或者已被移动到别处。
          </p>
          <Link
            href="/"
            className="mt-6 inline-flex items-center gap-2 rounded-lg bg-foreground px-5 py-2.5 text-sm font-medium text-background transition-all hover:bg-foreground/90"
          >
            返回首页
          </Link>
        </div>
      </main>
      <PublicFooter />
    </>
  );
}
