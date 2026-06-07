"use client";

// ============================================================
// 文章页底部几何装饰背景
// 参考旧博客的 hello-about 形状，固定在页面底部作为装饰
// ============================================================

import { motion } from "framer-motion";

export function GeometricBackground() {
  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-0 -z-10 h-[500px] overflow-hidden">
      {/* 彩色浮动几何形状 */}
      <motion.div
        animate={{
          y: [0, -30, 0],
          x: [0, 20, 0],
          rotate: [0, 10, 0],
        }}
        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
        className="absolute bottom-20 left-[10%] h-32 w-32 rounded-full bg-gradient-to-br from-[#425AEF]/20 to-cyan-400/20 blur-xl"
      />

      <motion.div
        animate={{
          y: [0, 40, 0],
          x: [0, -25, 0],
          rotate: [0, -15, 0],
        }}
        transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
        className="absolute bottom-40 right-[12%] h-40 w-40 rounded-3xl bg-gradient-to-br from-pink-400/20 to-orange-400/20 blur-xl"
      />

      <motion.div
        animate={{
          y: [0, -20, 0],
          scale: [1, 1.2, 1],
        }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        className="absolute bottom-10 left-1/2 h-24 w-24 -translate-x-1/2 rounded-full bg-gradient-to-br from-violet-500/20 to-fuchsia-400/20 blur-xl"
      />

      {/* 底部淡渐变线 */}
      <div className="absolute bottom-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-border to-transparent" />

    </div>
  );
}
