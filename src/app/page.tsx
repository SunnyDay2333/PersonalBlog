// ============================================================
// 首页（Hero + 最近说说横向滚动 + 最新文章首篇突出 + 网格）
// ============================================================

import Link from "next/link";
import { PublicHeader } from "@/components/layout/public-header";
import { PublicFooter } from "@/components/layout/public-footer";
import { HeroSection } from "@/components/posts/hero-section";
import { PostCard } from "@/components/posts/post-card";
import { MomentMiniCard } from "@/components/moments/moment-mini-card";
import { EmptyState } from "@/components/shared/empty-state";
import type { Post } from "@/types/post";
import type { MomentWithImages } from "@/types/moment";

export const revalidate = 60;

async function getPublishedPosts(): Promise<Post[]> {
  const { createClient } = await import("@/lib/supabase/server");
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("posts")
    .select("*")
    .eq("status", "published")
    .order("published_at", { ascending: false })
    .limit(20);

  if (error) {
    console.error("获取文章列表失败:", error.message);
    return [];
  }

  return data as Post[];
}

// ============================================================
// 区块标题
// ============================================================
function SectionHeading({
  icon,
  title,
  count,
}: {
  icon: string;
  title: string;
  count: number;
}) {
  return (
    <div className="flex items-center gap-4 pt-14 pb-7">
      <span className="text-lg">{icon}</span>
      <h2 className="text-[18px] font-bold tracking-[-0.01em] text-foreground">
        {title}
      </h2>
      <span className="rounded-full bg-muted/60 px-2.5 py-0.5 text-[13px] font-medium text-muted-foreground">
        {count}
      </span>
      <span className="h-px flex-1 bg-gradient-to-r from-border/50 to-transparent" />
    </div>
  );
}

// ============================================================
// 查看全部链接
// ============================================================
function ViewAllLink({ href }: { href: string }) {
  return (
    <div className="flex justify-end pt-5">
      <Link
        href={href}
        className="inline-flex items-center gap-1 text-[13px] font-medium text-[#425AEF] transition-all hover:gap-2"
      >
        查看全部
        <span className="text-base leading-none">→</span>
      </Link>
    </div>
  );
}

export default async function HomePage() {
  const posts = await getPublishedPosts();

  // 同时获取说说数据
  const { createClient: createServerClient } = await import(
    "@/lib/supabase/server"
  );
  const { getPublishedMoments } = await import(
    "@/lib/services/moment-service"
  );
  const supabase = await createServerClient();
  const moments: MomentWithImages[] = await getPublishedMoments(supabase, 0, 8);

  return (
    <>
      <PublicHeader />

      <main className="flex-1">
        <HeroSection />

        {/* 廊道容器 — 与说说页一致的柔光边界 */}
        <div
          className="relative mx-auto max-w-6xl bg-white/38 dark:bg-card/55"
          style={{
            boxShadow:
              "inset 1px 0 0 rgba(0,0,0,0.04), inset -1px 0 0 rgba(0,0,0,0.04)",
          }}
        >
          <div className="px-4 pb-20 sm:px-6">

            {/* ===== 最近说说 ===== */}
            <SectionHeading icon="💬" title="最近说说" count={moments.length} />

            {moments.length === 0 ? (
              <p className="py-8 text-center text-[14px] text-muted-foreground">
                还没有说说，先去发布一条吧。
              </p>
            ) : (
              <div className="-mx-2 flex gap-4 overflow-x-auto px-2 pb-2 snap-x snap-mandatory scrollbar-none">
                {moments.map((m) => (
                  <MomentMiniCard key={m.id} moment={m} />
                ))}
              </div>
            )}

            {moments.length > 0 && <ViewAllLink href="/moments" />}

            {/* ===== 最新文章 ===== */}
            <SectionHeading icon="📰" title="最新文章" count={posts.length} />

            {posts.length === 0 ? (
              <EmptyState
                title="还没有文章"
                description="博主正在酝酿灵感，敬请期待。"
              />
            ) : (
              <>
                {/* 首篇大卡片 */}
                <PostCard post={posts[0]} variant="featured" />

                {/* 其余 2 列网格 */}
                {posts.length > 1 && (
                  <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
                    {posts.slice(1).map((p) => (
                      <PostCard key={p.id} post={p} variant="card" />
                    ))}
                  </div>
                )}
              </>
            )}

            {posts.length > 0 && <ViewAllLink href="/posts" />}

          </div>
        </div>
      </main>

      <PublicFooter />
    </>
  );
}
