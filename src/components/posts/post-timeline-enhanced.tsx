"use client";

// ============================================================
// 首页文章列表 — 垂直交替时间轴 + 滚动揭示动画
//
// 架构：
//   Timeline    — 父容器，渲染中轴线（Stem）
//   TimelineMonth — 按月份分组，整组交替左右
//   TimelineItem — 单篇文章卡片，IntersectionObserver 触发滑入
//
// 性能策略：
//   · IntersectionObserver（浏览器合成线程回调）替代 onscroll
//   · CSS transition 动画（opacity + transform），GPU 合成层
//   · 进入视口后 unobserve，零后续开销
// ============================================================

import { Calendar, ArrowRight } from "lucide-react";
import Link from "next/link";
import type { Post } from "@/types/post";
import { useIntersectionObserver } from "@/hooks/use-intersection-observer";
import { formatPostDate } from "@/lib/utils/date";
import { CoverPlaceholder } from "@/components/posts/cover-placeholder";

// ---- 工具函数 ----

/** 按月份分组，key: "2026-05" */
function groupPostsByMonth(posts: Post[]): Map<string, Post[]> {
  const groups = new Map<string, Post[]>();
  for (const post of posts) {
    const date = new Date(post.published_at ?? post.created_at);
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key)!.push(post);
  }
  return groups;
}

const MONTH_NAMES = [
  "一月", "二月", "三月", "四月", "五月", "六月",
  "七月", "八月", "九月", "十月", "十一月", "十二月",
];

// ---- 组件 ----

interface PostTimelineEnhancedProps {
  posts: Post[];
}

export function PostTimelineEnhanced({ posts }: PostTimelineEnhancedProps) {
  const grouped = groupPostsByMonth(posts);
  // 按时间倒序排列月份
  const months = [...grouped.keys()].sort((a, b) => (a > b ? -1 : 1));

  return (
    <div className="relative">
      {/* 中轴线（Stem）— 桌面端显示 */}
      <div
        className="absolute left-1/2 top-0 bottom-0 -translate-x-1/2 border-l-2 border-dashed border-border/60 hidden md:block"
        aria-hidden
      />

      <div className="flex flex-col">
        {months.map((monthKey, monthIdx) => {
          const monthPosts = grouped.get(monthKey)!;
          const side: "left" | "right" = monthIdx % 2 === 0 ? "left" : "right";
          const [year, month] = monthKey.split("-");

          return (
            <TimelineMonth
              key={monthKey}
              posts={monthPosts}
              year={parseInt(year)}
              month={parseInt(month)}
              side={side}
            />
          );
        })}
      </div>
    </div>
  );
}

// ============================================================
// TimelineMonth — 一个月份组
// ============================================================
function TimelineMonth({
  posts,
  year,
  month,
  side,
}: {
  posts: Post[];
  year: number;
  month: number;
  side: "left" | "right";
}) {
  const { ref, isVisible } = useIntersectionObserver({ threshold: 0.1 });

  return (
    <div
      ref={ref}
      className={`timeline-month relative mb-10 transition-all duration-700 ease-out ${
        isVisible
          ? "opacity-100 translate-x-0"
          : side === "left"
            ? "opacity-0 -translate-x-12"
            : "opacity-0 translate-x-12"
      }`}
      style={{ willChange: isVisible ? "auto" : "opacity, transform" }}
    >
      {/* 月份标签 */}
      <div className="flex justify-center mb-6">
        <span className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-1.5 text-xs font-medium text-muted-foreground shadow-sm">
          <span className="h-2 w-2 rounded-full bg-[#425AEF]" />
          {year} 年 {MONTH_NAMES[month - 1]} · {posts.length} 篇
        </span>
      </div>

      {/* 文章卡片 — 桌面端交替，移动端堆叠 */}
      <div className="flex flex-col gap-5">
        {posts.map((post) => (
          <TimelineItem key={post.id} post={post} side={side} />
        ))}
      </div>
    </div>
  );
}

// ============================================================
// TimelineItem — 单篇文章卡片
// ============================================================
function TimelineItem({
  post,
  side,
}: {
  post: Post;
  side: "left" | "right";
}) {
  const { ref, isVisible } = useIntersectionObserver({ threshold: 0.15 });

  return (
    <div
      ref={ref}
      className={`timeline-item relative flex items-center ${
        side === "left"
          ? "md:flex-row md:pr-[calc(50%+2rem)]"
          : "md:flex-row-reverse md:pl-[calc(50%+2rem)]"
      }`}
    >
      {/* 连接节点圆圈（中轴线上） */}
      <div
        className="absolute left-1/2 -translate-x-1/2 z-10 hidden md:flex"
        aria-hidden
      >
        <span
          className={`block h-4 w-4 rounded-full border-2 border-[#425AEF]/40 bg-card shadow-sm transition-all duration-500 ${
            isVisible ? "scale-100 border-[#425AEF]" : "scale-0"
          }`}
        />
      </div>

      {/* 卡片本体 */}
      <Link
        href={`/posts/${post.slug}`}
        className={`group timeline-card w-full rounded-2xl border border-border/60 bg-card p-5 shadow-sm transition-all duration-500 ease-out hover:-translate-y-1 hover:border-[#425AEF]/30 hover:shadow-lg hover:shadow-[#425AEF]/5 ${
          isVisible
            ? "opacity-100 translate-x-0"
            : side === "left"
              ? "opacity-0 -translate-x-10"
              : "opacity-0 translate-x-10"
        }`}
        style={{
          transitionDelay: isVisible ? "0ms" : "0ms",
          willChange: isVisible ? "auto" : "opacity, transform",
        }}
      >
        <article className="flex gap-4">
          {/* 封面缩略图 */}
          <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl border border-border">
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
            <h3 className="text-base font-semibold leading-snug text-foreground transition-colors group-hover:text-[#425AEF]">
              {post.title}
            </h3>
            {post.excerpt && (
              <p className="mt-1 line-clamp-2 text-sm leading-relaxed text-muted-foreground">
                {post.excerpt}
              </p>
            )}
            <div className="mt-2 flex items-center gap-2">
              <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                <Calendar className="h-3 w-3" />
                {post.published_at
                  ? formatPostDate(post.published_at)
                  : formatPostDate(post.created_at)}
              </span>
              <span className="inline-flex items-center gap-1 text-xs font-medium text-[#425AEF] opacity-0 transition-opacity group-hover:opacity-100">
                阅读
                <ArrowRight className="h-3 w-3" />
              </span>
            </div>
          </div>
        </article>
      </Link>
    </div>
  );
}
