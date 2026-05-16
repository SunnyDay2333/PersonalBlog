// ============================================================
// 文章卡片组件（特效增强版）
//   · hover 微上浮 + 左侧强调线 + 背景辉光
//   · 日期数字随 hover 微变色
//   · 标题渐变过渡
// ============================================================

import Link from "next/link";
import type { Post } from "@/types/post";
import { formatPostDate } from "@/lib/utils/date";

interface PostCardProps {
  post: Post;
}

export function PostCard({ post }: PostCardProps) {
  return (
    <Link
      href={`/posts/${post.slug}`}
      className="group relative -mx-3 block rounded-xl transition-all duration-300 hover:-translate-y-0.5 sm:px-4"
    >
      {/* hover 背景辉光 */}
      <span className="pointer-events-none absolute inset-0 rounded-xl bg-gradient-to-r from-[#425AEF]/4 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

      {/* 左侧强调线 */}
      <span className="absolute left-0 top-1/3 bottom-1/3 w-[3px] rounded-full bg-gradient-to-b from-[#425AEF] to-violet-500 opacity-0 transition-all duration-300 group-hover:opacity-100" />

      <article className="relative flex flex-col gap-2 px-3 py-5 sm:flex-row sm:items-baseline sm:gap-6 sm:py-5">
        {/* 日期 */}
        <time
          dateTime={post.published_at ?? post.created_at}
          className="shrink-0 text-xs tabular-nums text-muted-foreground transition-colors duration-300 group-hover:text-foreground/70 sm:w-28 sm:text-right"
        >
          {post.published_at
            ? formatPostDate(post.published_at)
            : formatPostDate(post.created_at)}
        </time>

        {/* 标题 + 摘要 */}
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
