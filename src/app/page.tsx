// ============================================================
// 首页（特效增强版）
// ============================================================

import { PublicHeader } from "@/components/layout/public-header";
import { PublicFooter } from "@/components/layout/public-footer";
import { PostTimelineEnhanced } from "@/components/posts/post-timeline-enhanced";
import { HeroSection } from "@/components/posts/hero-section";
import { EmptyState } from "@/components/shared/empty-state";
import type { Post } from "@/types/post";

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

  return (
    <>
      <PublicHeader />

      <main className="flex-1">
        <HeroSection />

        <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
          <div className="mb-10 flex items-center gap-4">
            <span className="h-px flex-1 bg-gradient-to-r from-transparent via-border to-transparent" />
            <h2 className="shrink-0 text-sm font-medium tracking-wide text-muted-foreground uppercase">
              最新动态
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
            <PostTimelineEnhanced posts={posts} />
          )}
        </section>
      </main>

      <PublicFooter />
    </>
  );
}
