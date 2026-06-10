// ============================================================
// 首页 — Hero + 最近说说（横向卡片栏）+ 最近文章（时间线）
// ============================================================

import Link from "next/link";
import { ArrowRight, BookOpenText, MessageCircle } from "lucide-react";
import { PublicHeader } from "@/components/layout/public-header";
import { PublicFooter } from "@/components/layout/public-footer";
import { PostTimelineEnhanced } from "@/components/posts/post-timeline-enhanced";
import { HeroSection } from "@/components/posts/hero-section";
import { MomentMiniCard } from "@/components/moments/moment-mini-card";
import { EmptyState } from "@/components/shared/empty-state";
import type { Post } from "@/types/post";
import type { MomentWithImages } from "@/types/moment";

export const revalidate = 60;

function SectionHeader({
  eyebrow,
  title,
  description,
  href,
  linkLabel,
  icon: Icon,
}: {
  eyebrow: string;
  title: string;
  description: string;
  href: string;
  linkLabel: string;
  icon: typeof BookOpenText;
}) {
  return (
    <div className="mb-8 flex flex-col gap-4 border-b border-border/70 pb-5 sm:flex-row sm:items-end sm:justify-between">
      <div className="max-w-xl">
        <div className="mb-3 inline-flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
          <Icon className="h-3.5 w-3.5 text-[#425AEF]" />
          {eyebrow}
        </div>
        <h2 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
          {title}
        </h2>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          {description}
        </p>
      </div>
      <Link
        href={href}
        className="group inline-flex w-fit items-center gap-2 rounded-md border border-border bg-card px-3 py-2 text-sm font-medium text-foreground transition-all hover:-translate-y-0.5 hover:border-[#425AEF]/40 hover:text-[#425AEF]"
      >
        {linkLabel}
        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
      </Link>
    </div>
  );
}

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

        <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-20">
          <section>
            <SectionHeader
              eyebrow="Latest writing"
              title="最近文章"
              description="把技术学习、项目实践和一些慢慢想清楚的问题，整理成可以回看的文字。"
              href="/posts"
              linkLabel="全部文章"
              icon={BookOpenText}
            />

            {posts.length === 0 ? (
              <EmptyState
                title="还没有文章"
                description="博主正在酝酿灵感，敬请期待。"
              />
            ) : (
              <PostTimelineEnhanced posts={posts} />
            )}
          </section>

          <section className="mt-20">
            <SectionHeader
              eyebrow="Moments"
              title="最近说说"
              description="短句、照片和当下的碎片，保留一点未经精修的生活温度。"
              href="/moments"
              linkLabel="全部说说"
              icon={MessageCircle}
            />

            {moments.length === 0 ? (
              <p className="rounded-md border border-dashed border-border py-10 text-center text-sm text-muted-foreground">
                还没有说说，这里空空如也～。
              </p>
            ) : (
              <div className="-mx-4 flex gap-4 overflow-x-auto px-4 pb-3 snap-x snap-mandatory scrollbar-none">
                {moments.map((m) => (
                  <MomentMiniCard key={m.id} moment={m} />
                ))}
              </div>
            )}
          </section>
        </div>
      </main>

      <PublicFooter />
    </>
  );
}
