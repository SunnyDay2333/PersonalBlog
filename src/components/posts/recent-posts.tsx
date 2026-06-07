// ============================================================
// 最近发布 — 侧边栏卡片
// 展示 5 篇其他已发布文章，含封面缩略图和标题
// ============================================================

import Link from "next/link";
import { Clock } from "lucide-react";
import { createAdminClient } from "@/lib/supabase/admin";
import type { Post } from "@/types/post";

interface RecentPostsProps {
  /** 当前文章 slug，排除自身 */
  excludeSlug: string;
}

export async function RecentPosts({ excludeSlug }: RecentPostsProps) {
  const supabase = createAdminClient();

  const { data: posts } = await supabase
    .from("posts")
    .select("id, title, slug, cover_image")
    .eq("status", "published")
    .neq("slug", excludeSlug)
    .order("published_at", { ascending: false })
    .limit(5);

  if (!posts || posts.length === 0) return null;

  return (
    <aside className="mt-8">
      {/* 头部 — 与 ToC 完全一致的排版风格 */}
      <div className="mb-4 flex items-center gap-2 px-1">
        <Clock className="h-3.5 w-3.5 text-[#425AEF]" />
        <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          最近发布
        </span>
        <span className="ml-auto text-[10px] text-muted-foreground/60">
          {posts.length} 篇
        </span>
      </div>

      {/* 列表 */}
      <div className="space-y-0.5">
        {posts.map((post) => (
          <RecentPostItem key={post.id} post={post as Post} />
        ))}
      </div>
    </aside>
  );
}

function RecentPostItem({ post }: { post: Post }) {
  return (
    <Link
      href={`/posts/${post.slug}`}
      className="group flex items-center gap-3 rounded-lg px-1 py-2 transition-colors hover:bg-accent/50"
    >
      {/* 封面缩略图 40x40 */}
      <div className="h-10 w-10 shrink-0 overflow-hidden rounded-lg border border-border/50 bg-muted">
        {post.cover_image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={post.cover_image}
            alt=""
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-[#425AEF]/10 to-violet-500/10">
            <span className="text-[10px] font-medium text-[#425AEF]/50">
              {post.title.slice(0, 1)}
            </span>
          </div>
        )}
      </div>

      {/* 标题 */}
      <span className="min-w-0 flex-1 truncate text-[13px] leading-snug text-muted-foreground transition-colors group-hover:text-foreground">
        {post.title}
      </span>
    </Link>
  );
}
