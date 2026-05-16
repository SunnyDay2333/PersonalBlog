"use client";

// ============================================================
// 首页 Hero — 特效增强版
//   · 光标跟随光晕 (spotlight)
//   · 标题渐变微光扫过 (shimmer)
//   · emoji 辉光 (glow pulse)
//   · 内容布局不变
// ============================================================

import { useRef, useState, useCallback } from "react";
import { motion } from "framer-motion";
import { ArrowRight, SparklesIcon, MapPinIcon } from "lucide-react";
import Link from "next/link";
import { useTypewriter } from "@/hooks/use-typewriter";

const FLOATING_EMOJIS = [
  { emoji: "✨", top: "12%", left: "8%", duration: 4 },
  { emoji: "💻", top: "20%", right: "12%", duration: 5 },
  { emoji: "🎵", bottom: "22%", left: "14%", duration: 4.5 },
  { emoji: "🚀", bottom: "15%", right: "9%", duration: 5.5 },
  { emoji: "🌙", top: "55%", right: "5%", duration: 6 },
];

export function HeroSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const [spotPos, setSpotPos] = useState({ x: 0.5, y: 0.5 });

  const { displayed, done } = useTypewriter(
    "Hope is the thing with feathers.",
    { speed: 110, startDelay: 600 },
  );

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!sectionRef.current) return;
    const rect = sectionRef.current.getBoundingClientRect();
    setSpotPos({
      x: (e.clientX - rect.left) / rect.width,
      y: (e.clientY - rect.top) / rect.height,
    });
  }, []);

  return (
    <section
      ref={sectionRef}
      onMouseMove={handleMouseMove}
      className="relative overflow-hidden border-b border-border"
    >
      {/* 背景壁纸 */}
      <div
        className="absolute inset-0 z-0"
        style={{
          backgroundImage: `url('/hero-bg.jpg')`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }}
        aria-hidden
      />

      {/* 半透明遮罩 — 亮色模式白色，暗色模式黑色，保护文字对比度 */}
      <div
        className="absolute inset-0 z-[1] bg-background/60"
        aria-hidden
      />

      {/* 光标跟随聚光灯 */}
      <div
        className="pointer-events-none absolute inset-0 z-[2] select-none"
        aria-hidden
      >
        <div
          className="absolute h-[420px] w-[420px] rounded-full bg-gradient-to-br from-[#425AEF]/12 via-violet-500/8 to-pink-500/6 blur-3xl transition-[left,top] duration-700 ease-out"
          style={{
            left: `${spotPos.x * 100}%`,
            top: `${spotPos.y * 100}%`,
            transform: "translate(-50%, -50%)",
          }}
        />
      </div>

      {/* 固定色晕底座 */}
      <div className="pointer-events-none absolute inset-0 z-[2] select-none">
        <div className="absolute -top-40 -right-32 h-[500px] w-[500px] rounded-full bg-gradient-to-br from-[#425AEF]/10 to-transparent blur-3xl" />
        <div className="absolute -bottom-40 -left-32 h-[450px] w-[450px] rounded-full bg-gradient-to-tr from-violet-500/10 to-transparent blur-3xl" />
        <div className="absolute top-1/4 left-1/3 h-[250px] w-[250px] rounded-full bg-gradient-to-br from-cyan-400/5 to-pink-400/5 blur-3xl" />
      </div>

      {/* 浮动 emoji（带辉光） */}
      <div className="pointer-events-none absolute inset-0 z-[2] hidden select-none sm:block">
        {FLOATING_EMOJIS.map((item, i) => (
          <motion.span
            key={i}
            className="absolute text-2xl"
            style={{
              top: item.top,
              left: item.left,
              right: item.right,
              bottom: item.bottom,
              filter: "drop-shadow(0 0 8px rgba(255,255,255,0.6))",
            }}
            animate={{
              y: [0, -14, 0],
              rotate: [0, 8, -4, 0],
              opacity: [0.35, 0.55, 0.35],
              scale: [1, 1.08, 1],
            }}
            transition={{
              duration: item.duration,
              repeat: Infinity,
              ease: "easeInOut",
              delay: i * 0.4,
            }}
          >
            {item.emoji}
          </motion.span>
        ))}
      </div>

      {/* 主内容 */}
      <div className="relative z-10 mx-auto max-w-6xl px-4 py-20 sm:px-6 sm:py-28">
        {/* 小标签 */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card/80 backdrop-blur-sm px-3 py-1 text-xs font-medium text-muted-foreground">
            <SparklesIcon className="h-3 w-3" />
            Hi there!
          </span>
        </motion.div>

        {/* 主标题 — 微光扫过 */}
        <motion.h1
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.15 }}
          className="relative mt-6 text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl"
        >
          <span className="inline-block bg-gradient-to-br from-foreground via-foreground to-[#425AEF] bg-clip-text text-transparent [background-size:200%_auto] animate-shimmer">
            I&apos;m 自然晴
          </span>
        </motion.h1>

        {/* 打字机 */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-5 text-lg text-muted-foreground sm:text-xl"
        >
          {displayed}
          <span
            className={`ml-0.5 inline-block h-5 w-0.5 translate-y-0.5 bg-foreground sm:h-6 ${
              done ? "animate-pulse" : ""
            }`}
          />
        </motion.p>

        {/* 位置标签 */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 2 }}
          className="mt-6 flex items-center gap-1.5 text-xs text-muted-foreground"
        >
          <MapPinIcon className="h-3.5 w-3.5" />
          Penacony, Land of the Dreams
        </motion.div>

        {/* 按钮组 */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 2.2 }}
          className="mt-8 flex items-center gap-3"
        >
          <Link
            href="/about"
            className="group relative inline-flex items-center gap-2 overflow-hidden rounded-full bg-foreground px-6 py-2.5 text-sm font-medium text-background transition-all hover:gap-3 hover:shadow-lg hover:shadow-foreground/20 active:scale-95"
          >
            <span className="relative z-10 flex items-center gap-2">
              认识我
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </span>
            {/* 按钮内部微光 */}
            <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
          </Link>
          <a
            href="https://github.com/SunnyDay2333"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-full border border-border bg-card/50 px-6 py-2.5 text-sm font-medium text-foreground backdrop-blur-sm transition-all hover:border-foreground/20 hover:bg-accent hover:shadow-md active:scale-95"
          >
            GitHub
          </a>
        </motion.div>
      </div>
    </section>
  );
}
