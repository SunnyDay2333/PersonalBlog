// ============================================================
// 管理端仪表盘首页
// 文章统计 + 快捷操作 + 最近文章
// ============================================================

import Link from "next/link";
import { AuthGuard } from "@/components/admin/auth-guard";
import { DashboardStats } from "@/components/admin/dashboard-stats";
import { getPostCount } from "@/lib/services/post-service";
import { formatDetailDate } from "@/lib/utils/date";
import { FileText, PlusCircle, MessageCircle, ArrowRight } from "lucide-react";
import type { Post } from "@/types/post";

async function getStats() {
  const { createAdminClient } = await import("@/lib/supabase/admin");
  const supabase = createAdminClient();

  try {
    return await getPostCount(supabase);
  } catch {
    return { total: 0, published: 0, draft: 0 };
  }
}

async function getRecentPosts(): Promise<Post[]> {
  const { createAdminClient } = await import("@/lib/supabase/admin");
  const supabase = createAdminClient();

  const { data } = await supabase
    .from("posts")
    .select("id, title, slug, status, created_at")
    .order("created_at", { ascending: false })
    .limit(5);

  return (data as Post[]) ?? [];
}

export const dynamic = "force-dynamic";

const QUICK_ACTIONS = [
  {
    label: "新建文章",
    desc: "撰写一篇新文章",
    href: "/admin/posts/new",
    icon: PlusCircle,
    accent: "bg-[#425AEF]/10 text-[#425AEF]",
  },
  {
    label: "文章管理",
    desc: "管理全部文章",
    href: "/admin/posts",
    icon: FileText,
    accent: "bg-emerald-500/10 text-emerald-500",
  },
  {
    label: "新建说说",
    desc: "发布一条说说",
    href: "/admin/moments/new",
    icon: MessageCircle,
    accent: "bg-amber-500/10 text-amber-500",
  },
];

const STATUS_LABEL: Record<string, string> = {
  published: "已发布",
  draft: "草稿",
  archived: "已归档",
};
const STATUS_COLOR: Record<string, string> = {
  published: "bg-emerald-500/10 text-emerald-600",
  draft: "bg-amber-500/10 text-amber-600",
  archived: "bg-muted text-muted-foreground",
};

export default async function AdminDashboardPage() {
  const stats = await getStats();
  const recentPosts = await getRecentPosts();

  return (
    <AuthGuard>
      <div className="flex flex-col gap-6">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">仪表盘</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            博客数据概览
          </p>
        </div>

        {/* 统计卡片 */}
        <DashboardStats
          total={stats.total}
          published={stats.published}
          draft={stats.draft}
        />

        {/* 快捷操作 + 最近文章 双栏 */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* 快捷操作 */}
          <div className="rounded-xl border border-border bg-card p-5">
            <h2 className="text-sm font-semibold text-foreground">快捷操作</h2>
            <div className="mt-4 flex flex-col gap-2">
              {QUICK_ACTIONS.map((action) => (
                <Link
                  key={action.href}
                  href={action.href}
                  className="group flex items-center gap-4 rounded-lg border border-border/60 p-3 transition-all hover:border-[#425AEF]/30 hover:bg-accent/50"
                >
                  <div
                    className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${action.accent}`}
                  >
                    <action.icon className="h-4 w-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-foreground">
                      {action.label}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {action.desc}
                    </p>
                  </div>
                  <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground/30 transition-all group-hover:translate-x-0.5 group-hover:text-[#425AEF]" />
                </Link>
              ))}
            </div>
          </div>

          {/* 最近文章 */}
          <div className="rounded-xl border border-border bg-card p-5">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-foreground">
                最近文章
              </h2>
              <Link
                href="/admin/posts"
                className="text-xs text-muted-foreground hover:text-foreground"
              >
                查看全部
              </Link>
            </div>
            {recentPosts.length === 0 ? (
              <p className="mt-8 text-center text-sm text-muted-foreground">
                还没有文章
              </p>
            ) : (
              <div className="mt-4 flex flex-col gap-0.5">
                {recentPosts.map((post) => (
                  <Link
                    key={post.id}
                    href={`/admin/posts/${post.id}/edit`}
                    className="group flex items-center gap-3 rounded-lg px-2 py-2 transition-colors hover:bg-accent/50"
                  >
                    <span className="min-w-0 flex-1 truncate text-sm text-foreground transition-colors group-hover:text-[#425AEF]">
                      {post.title}
                    </span>
                    <span
                      className={`shrink-0 rounded px-1.5 py-0.5 text-[10px] font-medium ${STATUS_COLOR[post.status] ?? ""}`}
                    >
                      {STATUS_LABEL[post.status] ?? post.status}
                    </span>
                    <span className="shrink-0 text-[11px] tabular-nums text-muted-foreground">
                      {formatDetailDate(post.created_at)}
                    </span>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </AuthGuard>
  );
}
