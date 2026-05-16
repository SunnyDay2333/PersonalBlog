// ============================================================
// 新建文章页
//   选择入口：空白撰写 / 上传 MD 文档
// ============================================================

import type { Metadata } from "next";
import { AuthGuard } from "@/components/admin/auth-guard";
import { NewPostForm } from "@/components/admin/new-post-form";

export const metadata: Metadata = {
  title: "新建文章",
};

export default function NewPostPage() {
  return (
    <AuthGuard>
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">新建文章</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          选择从空白开始撰写，或直接上传本地 Markdown 文档
        </p>
        <div className="mt-6">
          <NewPostForm />
        </div>
      </div>
    </AuthGuard>
  );
}
