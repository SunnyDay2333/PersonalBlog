// ============================================================
// 文章列表管理页
// 展示全部文章（含草稿），支持状态标签、编辑、删除
// ============================================================

import Link from "next/link";
import { AuthGuard } from "@/components/admin/auth-guard";
import { Badge } from "@/components/ui/badge";
import { PlusCircle, Pencil } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatDetailDate } from "@/lib/utils/date";
import type { Post } from "@/types/post";

async function getPosts(): Promise<Post[]> {
  const { createAdminClient } = await import("@/lib/supabase/admin");
  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from("posts")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) return [];
  return data as Post[];
}

export const dynamic = "force-dynamic";

/** 状态对应的 Badge 配置 */
const STATUS_CONFIG: Record<string, { variant: "default" | "secondary" | "outline"; label: string }> = {
  published: { variant: "default", label: "已发布" },
  draft: { variant: "secondary", label: "草稿" },
  archived: { variant: "outline", label: "已归档" },
};

export default async function AdminPostsPage() {
  const posts = await getPosts();

  return (
    <AuthGuard>
      <div className="flex flex-col gap-6">
        {/* 标题栏 */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">文章管理</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              共 {posts.length} 篇文章
            </p>
          </div>
          <Link
            href="/admin/posts/new"
            className={cn(
              "inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2",
              "text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90",
            )}
          >
            <PlusCircle className="h-4 w-4" />
            新建文章
          </Link>
        </div>

        {/* 文章表格 */}
        {posts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <p className="text-sm text-muted-foreground">
              还没有文章，点击上方按钮创建第一篇
            </p>
          </div>
        ) : (
          <div className="overflow-hidden rounded-lg border border-border">
            <table className="w-full">
              <thead className="border-b border-border bg-muted/50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">
                    标题
                  </th>
                  <th className="hidden px-4 py-3 text-left text-xs font-medium text-muted-foreground sm:table-cell">
                    状态
                  </th>
                  <th className="hidden px-4 py-3 text-left text-xs font-medium text-muted-foreground md:table-cell">
                    创建时间
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground">
                    操作
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {posts.map((post) => {
                  const status = STATUS_CONFIG[post.status] ?? STATUS_CONFIG.draft;
                  return (
                    <tr key={post.id} className="transition-colors hover:bg-muted/30">
                      <td className="px-4 py-3">
                        <div className="flex flex-col">
                          <span className="text-sm font-medium text-foreground">
                            {post.title}
                          </span>
                          <span className="text-xs text-muted-foreground md:hidden">
                            {status.label} · {formatDetailDate(post.created_at)}
                          </span>
                        </div>
                      </td>
                      <td className="hidden px-4 py-3 sm:table-cell">
                        <Badge variant={status.variant}>{status.label}</Badge>
                      </td>
                      <td className="hidden px-4 py-3 md:table-cell">
                        <span className="text-xs text-muted-foreground">
                          {formatDetailDate(post.created_at)}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <Link
                          href={`/admin/posts/${post.id}/edit`}
                          className="inline-flex items-center gap-1 rounded-md px-2 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                          <span className="ml-1 hidden sm:inline">编辑</span>
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AuthGuard>
  );
}
