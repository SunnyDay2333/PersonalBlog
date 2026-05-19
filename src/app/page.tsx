// ============================================================
// 首页 — Hero + 最近说说（横向卡片栏）+ 最近文章（时间线）
// ============================================================

import Link from "next/link";
import { PublicHeader } from "@/components/layout/public-header";
import { PublicFooter } from "@/components/layout/public-footer";
import { PostTimelineEnhanced } from "@/components/posts/post-timeline-enhanced";
import { HeroSection } from "@/components/posts/hero-section";
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

export default async function HomePage() {
  const posts = await getPublishedPosts();

  // 获取说说数据
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

        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">

          {/* ===== 最近文章 — 时间线 ===== */}
          <div className="mb-10 flex items-center gap-4">
            <span className="h-px flex-1 bg-gradient-to-r from-transparent via-border to-transparent" />
            <h2 className="shrink-0 text-sm font-medium tracking-wide text-muted-foreground uppercase">
              最近文章
            </h2>
            <span className="relative h-px flex-1 overflow-hidden bg-gradient-to-r from-transparent via-border to-transparent">
              <span className="absolute inset-0 -translate-x-full animate-divider-shimmer bg-gradient-to-r from-transparent via-[#425AEF]/50 to-transparent" />
            </span>
          </div>

          {posts.length === 0 ? (
            <EmptyState
              title="还没有文章"
              description="博主正在酝酿灵感，敬请期待。"
            />
          ) : (
            <>
              <PostTimelineEnhanced posts={posts} />
              <div className="mt-10 flex justify-end">
                <Link
                  href="/posts"
                  className="inline-flex items-center gap-1 text-[13px] font-medium text-[#425AEF] transition-all hover:gap-2"
                >
                  查看全部文章
                  <span className="text-base leading-none">→</span>
                </Link>
              </div>
            </>
          )}

          {/* ===== 最近说说 — 横向卡片栏 ===== */}
          <div className="mt-16 mb-10 flex items-center gap-4">
            <span className="h-px flex-1 bg-gradient-to-r from-transparent via-border to-transparent" />
            <h2 className="shrink-0 text-sm font-medium tracking-wide text-muted-foreground uppercase">
              最近说说
            </h2>
            <span className="relative h-px flex-1 overflow-hidden bg-gradient-to-r from-transparent via-border to-transparent">
              <span className="absolute inset-0 -translate-x-full animate-divider-shimmer bg-gradient-to-r from-transparent via-[#425AEF]/50 to-transparent" />
            </span>
          </div>

          {moments.length === 0 ? (
            <p className="py-8 text-center text-[14px] text-muted-foreground">
              还没有说说，这里空空如也～。
            </p>
          ) : (
            <>
              <div className="-mx-2 flex gap-4 overflow-x-auto px-2 pb-2 snap-x snap-mandatory scrollbar-none">
                {moments.map((m) => (
                  <MomentMiniCard key={m.id} moment={m} />
                ))}
              </div>
              <div className="mt-10 flex justify-end">
                <Link
                  href="/moments"
                  className="inline-flex items-center gap-1 text-[13px] font-medium text-[#425AEF] transition-all hover:gap-2"
                >
                  查看全部说说
                  <span className="text-base leading-none">→</span>
                </Link>
              </div>
            </>
          )}
        </div>
      </main>

      <PublicFooter />
    </>
  );
}
