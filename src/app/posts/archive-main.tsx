"use client";

// ============================================================
// 归档主列表（客户端）
// 按年份分组，带大序号装饰 + 渐变动画
// ============================================================

import Link from "next/link";
import { motion } from "framer-motion";
import { Calendar } from "lucide-react";
import type { Post } from "@/types/post";
import { CoverPlaceholder } from "@/components/posts/cover-placeholder";

/** 按年份分组 */
function groupPostsByYear(posts: Post[]): Map<number, Post[]> {
  const groups = new Map<number, Post[]>();
  for (const post of posts) {
    const date = new Date(post.published_at ?? post.created_at);
    const year = date.getFullYear();
    if (!groups.has(year)) groups.set(year, []);
    groups.get(year)!.push(post);
  }
  return groups;
}

/** 格式化日期为 YYYY-MM-DD */
function fmtDate(iso: string): string {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

interface ArchiveMainProps {
  posts: Post[];
  /** 搜索无结果时的空状态提示；为空时不显示特殊空状态 */
  emptyMessage?: string;
}

export function ArchiveMain({ posts, emptyMessage }: ArchiveMainProps) {
  const grouped = groupPostsByYear(posts);
  const years = [...grouped.keys()].sort((a, b) => b - a);
  let globalIndex = 0;

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="rounded-3xl border border-border bg-card p-6 sm:p-8"
    >
      {/* 搜索空状态 */}
      {posts.length === 0 && emptyMessage && (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <p className="text-lg font-medium text-muted-foreground">
            {emptyMessage}
          </p>
          <p className="mt-2 text-sm text-muted-foreground/60">
            试试其他关键词
          </p>
        </div>
      )}

      {/* 页面标题 + 列表（仅在有文章时显示） */}
      {posts.length > 0 && (
        <>
          <div className="mb-8 flex items-baseline justify-between">
        <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
          文章总览
          <span className="ml-2 text-2xl text-muted-foreground font-normal">
            - {posts.length}
          </span>
        </h1>
        <span
          className="text-2xl text-muted-foreground/40 select-none sm:text-3xl"
          style={{ fontFamily: "var(--font-caveat)" }}
          aria-hidden
        >
          Archives
        </span>
      </div>

      {/* 按年份分组列表 */}
      <div className="flex flex-col gap-6">
        {years.map((year) => (
          <div key={year}>
            {/* 年份标签 */}
            <motion.h2
              initial={{ opacity: 0, x: -8 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="mb-3 text-xl font-bold text-muted-foreground"
            >
              {year}
            </motion.h2>

            {/* 该年度文章列表 */}
            <div className="flex flex-col">
              {grouped.get(year)!.map((post) => {
                globalIndex++;
                const idx = globalIndex;
                return (
                  <motion.div
                    key={post.id}
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-40px" }}
                    transition={{ duration: 0.4 }}
                    className="group"
                  >
                    <Link
                      href={`/posts/${post.slug}`}
                      className="relative flex items-center gap-4 rounded-2xl px-2 py-3 transition-colors hover:bg-accent/40"
                    >
                      {/* 封面缩略图 */}
                      <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl border border-border sm:h-20 sm:w-20">
                        {post.cover_image ? (
                          <img
                            src={post.cover_image}
                            alt={post.title}
                            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                            loading="lazy"
                          />
                        ) : (
                          <CoverPlaceholder title={post.title} />
                        )}
                      </div>

                      {/* 文字区域 */}
                      <div className="min-w-0 flex-1">
                        <h3 className="truncate text-base font-medium leading-snug text-foreground transition-colors group-hover:text-primary sm:text-lg">
                          {post.title}
                        </h3>
                        <div className="mt-2 flex items-center gap-1.5 text-xs text-muted-foreground">
                          <Calendar className="h-3 w-3" />
                          <time dateTime={post.published_at ?? post.created_at}>
                            {fmtDate(post.published_at ?? post.created_at)}
                          </time>
                        </div>
                      </div>

                      {/* 大序号装饰 */}
                      <span
                        className="select-none text-5xl font-bold text-muted-foreground/15 transition-colors group-hover:text-primary/30 sm:text-6xl"
                        aria-hidden
                      >
                        {idx}
                      </span>
                    </Link>
                  </motion.div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
        </>
      )}
    </motion.section>
  );
}
