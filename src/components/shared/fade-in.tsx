"use client";

// ============================================================
// Framer Motion 渐显包装器
// 为子元素添加平滑的淡入 + 上移入场动画
// ============================================================

import { motion, type Variants } from "framer-motion";
import type { ReactNode } from "react";

interface FadeInProps {
  children: ReactNode;
  /** 动画延迟（秒），默认 0 */
  delay?: number;
  /** 动画持续时间（秒），默认 0.4 */
  duration?: number;
}

const variants: Variants = {
  hidden: {
    opacity: 0,
    y: 12,
  },
  visible: {
    opacity: 1,
    y: 0,
  },
};

export function FadeIn({ children, delay = 0, duration = 0.4 }: FadeInProps) {
  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={variants}
      transition={{
        duration,
        delay,
        ease: [0.25, 0.46, 0.45, 0.94], // easeOutQuad
      }}
    >
      {children}
    </motion.div>
  );
}
