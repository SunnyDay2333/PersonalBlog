// ============================================================
// 文章卡片组件
//   支持三种变体：
//     list     — 水平行（归档页等列表场景）
//     card     — 垂直卡片（首页 2 列网格）
//     featured — 首篇大卡片（全宽，带封面图预览）
// ============================================================

import Link from "next/link";
import { ArrowRight, Calendar } from "lucide-react";
import type { Post } from "@/types/post";
import { formatPostDate } from "@/lib/utils/date";

interface PostCardProps {
  post: Post;
  variant?: "list" | "card" | "featured";
}

export function PostCard({ post, variant = "list" }: PostCardProps) {
  if (variant === "featured") return <PostCardFeatured post={post} />;
  if (variant === "card") return <PostCardGrid post={post} />;
  return <PostCardList post={post} />;
}

// ============================================================
// List 变体（原始水平布局）
// ============================================================
function PostCardList({ post }: { post: Post }) {
  return (
    <Link
      href={`/posts/${post.slug}`}
      className="group relative -mx-3 block rounded-xl transition-all duration-300 hover:-translate-y-0.5 sm:px-4"
    >
      <span className="pointer-events-none absolute inset-0 rounded-xl bg-gradient-to-r from-[#425AEF]/4 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
      <span className="absolute left-0 top-1/3 bottom-1/3 w-[3px] rounded-full bg-gradient-to-b from-[#425AEF] to-violet-500 opacity-0 transition-all duration-300 group-hover:opacity-100" />

      <article className="relative flex flex-col gap-2 px-3 py-5 sm:flex-row sm:items-baseline sm:gap-6 sm:py-5">
        <time
          dateTime={post.published_at ?? post.created_at}
          className="shrink-0 text-xs tabular-nums text-muted-foreground transition-colors duration-300 group-hover:text-foreground/70 sm:w-28 sm:text-right"
        >
          {post.published_at
            ? formatPostDate(post.published_at)
            : formatPostDate(post.created_at)}
        </time>
        <div className="min-w-0 flex-1">
          <h2 className="text-base font-medium leading-snug text-foreground transition-colors duration-300 group-hover:text-[#425AEF]">
            {post.title}
          </h2>
          {post.excerpt && (
            <p className="mt-1 line-clamp-1 text-sm text-muted-foreground">
              {post.excerpt}
            </p>
          )}
        </div>
      </article>
    </Link>
  );
}

// ============================================================
// Card 变体（网格卡片）
// ============================================================
function PostCardGrid({ post }: { post: Post }) {
  return (
    <Link
      href={`/posts/${post.slug}`}
      className="group relative flex flex-col rounded-2xl border border-border/60 bg-card p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-[#425AEF]/30 hover:shadow-lg hover:shadow-[#425AEF]/5"
    >
      {/* hover 顶部渐变指示条 */}
      <span className="absolute inset-x-0 top-0 h-[3px] rounded-t-2xl bg-gradient-to-r from-[#425AEF] to-violet-500 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

      {/* 标题 */}
      <h2 className="text-base font-semibold leading-snug text-foreground transition-colors duration-300 group-hover:text-[#425AEF]">
        {post.title}
      </h2>

      {/* 摘要 */}
      {post.excerpt && (
        <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-muted-foreground">
          {post.excerpt}
        </p>
      )}

      {/* 底部：日期 + 箭头 */}
      <div className="mt-auto flex items-center justify-between pt-4">
        <time
          dateTime={post.published_at ?? post.created_at}
          className="flex items-center gap-1.5 text-xs tabular-nums text-muted-foreground"
        >
          <Calendar className="h-3.5 w-3.5" />
          {post.published_at
            ? formatPostDate(post.published_at)
            : formatPostDate(post.created_at)}
        </time>
        <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground/40 transition-all duration-300 group-hover:translate-x-0.5 group-hover:text-[#425AEF]" />
      </div>
    </Link>
  );
}

// ============================================================
// Featured 变体（首篇大卡片，全宽，含封面图）
// ============================================================
function PostCardFeatured({ post }: { post: Post }) {
  return (
    <Link
      href={`/posts/${post.slug}`}
      className="group relative flex flex-col overflow-hidden rounded-2xl border border-border/60 bg-card shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-[#425AEF]/30 hover:shadow-lg hover:shadow-[#425AEF]/5 sm:flex-row"
    >
      {/* 封面图（如果有） */}
      {post.cover_image && (
        <div className="relative shrink-0 overflow-hidden sm:w-72">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-transparent to-card sm:bg-gradient-to-r" />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={post.cover_image}
            alt={post.title}
            className="h-48 w-full object-cover transition-transform duration-500 group-hover:scale-105 sm:h-full"
          />
        </div>
      )}

      <div className="flex flex-1 flex-col justify-center gap-3 p-6 sm:p-8">
        {/* 日期 */}
        <time
          dateTime={post.published_at ?? post.created_at}
          className="flex items-center gap-1.5 text-xs tabular-nums text-muted-foreground"
        >
          <Calendar className="h-3.5 w-3.5" />
          {post.published_at
            ? formatPostDate(post.published_at)
            : formatPostDate(post.created_at)}
        </time>

        {/* 标题 */}
        <h2 className="text-xl font-bold leading-snug text-foreground transition-colors duration-300 group-hover:text-[#425AEF] sm:text-2xl">
          {post.title}
        </h2>

        {/* 摘要 */}
        {post.excerpt && (
          <p className="line-clamp-3 text-sm leading-relaxed text-muted-foreground">
            {post.excerpt}
          </p>
        )}

        {/* 阅读链接 */}
        <span className="inline-flex items-center gap-1.5 text-sm font-medium text-[#425AEF]">
          阅读全文
          <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
        </span>
      </div>
    </Link>
  );
}
