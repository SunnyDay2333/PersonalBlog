// ============================================================
// 文章列表项组件（C 端）
// 用于 /posts 文章列表页
// 封面图缩略图 + 日期 + 标题 + 摘要
// ============================================================

import Link from "next/link";
import type { Post } from "@/types/post";
import { formatPostDate } from "@/lib/utils/date";
import { CoverPlaceholder } from "@/components/posts/cover-placeholder";

interface PostListItemProps {
  post: Post;
}

export function PostListItem({ post }: PostListItemProps) {
  return (
    <Link
      href={`/posts/${post.slug}`}
      className="group -mx-3 flex items-center gap-4 rounded-xl px-3 py-5 transition-colors hover:bg-accent/60 sm:gap-5 sm:px-4"
    >
      {/* ---- 封面图缩略图 ---- */}
      <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg border border-border sm:h-20 sm:w-20">
        {post.cover_image ? (
          <img
            src={post.cover_image}
            alt={post.title}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
            loading="lazy"
          />
        ) : (
          <CoverPlaceholder title={post.title} />
        )}
      </div>

      {/* ---- 文字区域 ---- */}
      <div className="min-w-0 flex-1">
        {/* 日期 */}
        <time
          dateTime={post.published_at ?? post.created_at}
          className="text-xs text-muted-foreground"
        >
          {post.published_at
            ? formatPostDate(post.published_at)
            : formatPostDate(post.created_at)}
        </time>

        {/* 标题 */}
        <h2 className="mt-1 text-base font-medium leading-snug text-foreground transition-colors group-hover:text-primary">
          {post.title}
        </h2>

        {/* 摘要 */}
        {post.excerpt && (
          <p className="mt-1 line-clamp-1 text-sm text-muted-foreground">
            {post.excerpt}
          </p>
        )}
      </div>
    </Link>
  );
}
