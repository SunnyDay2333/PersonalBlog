"use client";

// ============================================================
// 首页文章列表 — 卡片网格版
//   首篇以全宽 Featured 大卡片展示（含封面图）
//   其余以 2 列网格卡片展示
//   移动端自动降级为单列
// ============================================================

import { motion } from "framer-motion";
import { PostCard } from "@/components/posts/post-card";
import type { Post } from "@/types/post";

interface PostTimelineEnhancedProps {
  posts: Post[];
}

const staggerDelay = 0.06;

export function PostTimelineEnhanced({ posts }: PostTimelineEnhancedProps) {
  if (posts.length === 0) return null;

  const [first, ...rest] = posts;

  return (
    <div className="flex flex-col gap-6">
      {/* 首篇 — 全宽大卡片 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-60px" }}
        transition={{ duration: 0.5, ease: [0.22, 0.94, 0.35, 1] }}
      >
        <PostCard post={first} variant="featured" />
      </motion.div>

      {/* 其余 — 2 列网格 */}
      {rest.length > 0 && (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {rest.map((post, index) => (
            <motion.div
              key={post.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{
                duration: 0.45,
                delay: index * staggerDelay,
                ease: [0.22, 0.94, 0.35, 1],
              }}
            >
              <PostCard post={post} variant="card" />
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
