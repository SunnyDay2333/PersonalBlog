"use client";

// ============================================================
// 文章时间轴 — 动画增强（仅客户端交错入场）
//   数据通过 props 传入（服务端获取），此处只负责动效
// ============================================================

import { motion } from "framer-motion";
import { PostCard } from "@/components/posts/post-card";
import type { Post } from "@/types/post";

interface PostTimelineEnhancedProps {
  posts: Post[];
}

export function PostTimelineEnhanced({ posts }: PostTimelineEnhancedProps) {
  return (
    <div className="flex flex-col divide-y divide-border">
      {posts.map((post, index) => (
        <motion.div
          key={post.id}
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{
            duration: 0.45,
            delay: index * 0.05,
            ease: [0.22, 0.94, 0.35, 1],
          }}
        >
          <PostCard post={post} />
        </motion.div>
      ))}
    </div>
  );
}
