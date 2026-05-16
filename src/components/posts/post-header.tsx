"use client";

// ============================================================
// 文章头部（极简优雅版）
// · 左对齐布局，与 TOC 右侧栏和谐共存
// · 渐变小标签（回到文章列表）
// · 巨大标题 + 摘要
// · 元信息条（日期 / 字数 / 阅读时长）
// · 入场动画：错位交错淡入
// ============================================================

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeft, Calendar, Clock, FileText, History } from "lucide-react";
import { formatDetailDate } from "@/lib/utils/date";
import type { Post } from "@/types/post";

/** 估算阅读时长（中文 300 字/分钟） */
function estimateReadingTime(content: string): number {
  const chars = content.replace(/\s+/g, "").length;
  return Math.max(1, Math.ceil(chars / 300));
}

interface PostHeaderProps {
  post: Post;
}

export function PostHeader({ post }: PostHeaderProps) {
  const wordCount = post.content.replace(/\s+/g, "").length;
  const readingTime = estimateReadingTime(post.content);
  const publishedAt = post.published_at ?? post.created_at;
  const isUpdated =
    post.updated_at &&
    post.updated_at !== post.created_at &&
    new Date(post.updated_at).getTime() -
      new Date(publishedAt).getTime() >
      60000;

  return (
    <motion.header
      initial="hidden"
      animate="visible"
      variants={{
        hidden: {},
        visible: {
          transition: { staggerChildren: 0.08 },
        },
      }}
    >
      {/* 返回链接 */}
      <motion.div
        variants={{
          hidden: { opacity: 0, x: -8 },
          visible: {
            opacity: 1,
            x: 0,
            transition: { duration: 0.4 },
          },
        }}
      >
        <Link
          href="/posts"
          className="group inline-flex items-center gap-1.5 text-xs text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-3 w-3 transition-transform group-hover:-translate-x-0.5" />
          <span>所有文章</span>
        </Link>
      </motion.div>

      {/* 标题 — 超大字重，渐变色 */}
      <motion.h1
        variants={{
          hidden: { opacity: 0, y: 16 },
          visible: {
            opacity: 1,
            y: 0,
            transition: { duration: 0.5 },
          },
        }}
        className="mt-5 text-4xl font-bold leading-[1.15] tracking-tight sm:text-5xl"
      >
        <span className="bg-gradient-to-br from-foreground via-foreground to-[#425AEF] bg-clip-text text-transparent">
          {post.title}
        </span>
      </motion.h1>

      {/* 摘要 */}
      {post.excerpt && (
        <motion.p
          variants={{
            hidden: { opacity: 0, y: 12 },
            visible: {
              opacity: 1,
              y: 0,
              transition: { duration: 0.5 },
            },
          }}
          className="mt-5 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg"
        >
          {post.excerpt}
        </motion.p>
      )}

      {/* 元信息条 */}
      <motion.div
        variants={{
          hidden: { opacity: 0, y: 8 },
          visible: {
            opacity: 1,
            y: 0,
            transition: { duration: 0.5 },
          },
        }}
        className="mt-7 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-muted-foreground [&_svg]:text-muted-foreground/70"
      >
        <span className="inline-flex items-center gap-1.5">
          <Calendar className="h-3.5 w-3.5" />
          <time dateTime={publishedAt} className="font-medium">
            {formatDetailDate(publishedAt)}
          </time>
        </span>

        {isUpdated && (
          <span className="inline-flex items-center gap-1.5">
            <History className="h-3.5 w-3.5" />
            <span className="opacity-70">更新于</span>
            <time dateTime={post.updated_at}>
              {formatDetailDate(post.updated_at)}
            </time>
          </span>
        )}

        <span className="inline-flex items-center gap-1.5">
          <FileText className="h-3.5 w-3.5" />
          <span className="font-medium">
            {wordCount.toLocaleString()}
          </span>
          <span className="opacity-70">字</span>
        </span>

        <span className="inline-flex items-center gap-1.5">
          <Clock className="h-3.5 w-3.5" />
          <span className="font-medium">约 {readingTime}</span>
          <span className="opacity-70">分钟</span>
        </span>
      </motion.div>

      {/* 分割线 */}
      <motion.div
        variants={{
          hidden: { opacity: 0, scaleX: 0 },
          visible: {
            opacity: 1,
            scaleX: 1,
            transition: { duration: 0.6 },
          },
        }}
        className="mt-8 h-px origin-left bg-gradient-to-r from-border via-border to-transparent"
      />
    </motion.header>
  );
}
