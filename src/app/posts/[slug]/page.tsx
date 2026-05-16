// ============================================================
// 文章详情页（C 端）
// 设计：极简优雅、左对齐头部、TOC 雾化目录、几何装饰
// ============================================================

import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PublicHeader } from "@/components/layout/public-header";
import { PublicFooter } from "@/components/layout/public-footer";
import { PostContent } from "@/components/posts/post-content";
import { PostHeader } from "@/components/posts/post-header";
import { PostToc } from "@/components/posts/post-toc";
import { GeometricBackground } from "@/components/posts/geometric-background";
import { ScrollToTopButton } from "@/components/posts/scroll-to-top-button";
import { WalineComment } from "@/components/comments/waline";
import { SITE_NAME } from "@/lib/constants";
import type { Post } from "@/types/post";

// ============================================================
// 静态参数
// ============================================================
export async function generateStaticParams() {
  const { createAdminClient } = await import("@/lib/supabase/admin");
  const supabase = createAdminClient();
  const { data: posts } = await supabase
    .from("posts")
    .select("slug")
    .eq("status", "published");
  return (posts ?? []).map((post) => ({ slug: post.slug }));
}

/** SEO 元数据 */
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) return { title: "文章未找到" };

  return {
    title: post.title,
    description: post.excerpt ?? undefined,
    openGraph: {
      title: `${post.title} | ${SITE_NAME}`,
      description: post.excerpt ?? undefined,
      type: "article",
      publishedTime: post.published_at ?? undefined,
      images: post.cover_image ? [post.cover_image] : undefined,
    },
  };
}

export const revalidate = 60;

async function getPost(slug: string): Promise<Post | null> {
  const { createClient } = await import("@/lib/supabase/server");
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("posts")
    .select("*")
    .eq("slug", slug)
    .eq("status", "published")
    .single();

  if (error || !data) return null;
  return data as Post;
}

// ============================================================
// 页面
// ============================================================
export default async function PostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await getPost(slug);

  if (!post) notFound();

  return (
    <>
      <PublicHeader />

      <main className="relative flex-1">
        <div className="relative mx-auto max-w-6xl px-4 pt-10 pb-20 sm:px-6 sm:pt-14">
          <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_240px]">
            {/* 左 — 文章主体 */}
            <article className="min-w-0">
              {/* 头部 */}
              <PostHeader post={post} />

              {/* Markdown 正文（max-w-[720px] 约束阅读宽度） */}
              <div className="mt-10 mx-auto max-w-[720px]">
                <PostContent content={post.content} />
              </div>

              {/* 文末分隔线 + 致谢 */}
              <div className="mt-16 flex items-center gap-4">
                <span className="h-px flex-1 bg-gradient-to-r from-transparent via-border to-transparent" />
                <span className="text-xs text-muted-foreground">
                  感谢阅读 ✨
                </span>
                <span className="h-px flex-1 bg-gradient-to-r from-transparent via-border to-transparent" />
              </div>

              {/* 评论区域 */}
              <WalineComment path={`/posts/${post.slug}`} />
            </article>

            {/* 右 — TOC 目录侧栏（仅桌面端） */}
            <div className="hidden lg:block">
              <PostToc content={post.content} />
            </div>
          </div>
        </div>

        <GeometricBackground />
      </main>

      <ScrollToTopButton />

      <PublicFooter />
    </>
  );
}
