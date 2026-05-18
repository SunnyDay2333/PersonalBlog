"use client";

// ============================================================
// 关于页 — 灵动俏皮版（恢复 + 手写字体点缀）
// 特色：
//   1. 零外部图片依赖（除 GitHub 头像外）
//   2. Hello-About 鼠标跟随三彩圆
//   3. 俏皮卡片：弹跳 emoji、手写风引号
//   4. 词条轮播 + 打字机 + 悬浮标签
//   5. Caveat 手写字体点缀（标题、说明、座右铭尾签）
// ============================================================

import { useState, useEffect, useRef, useCallback } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import { GitBranch, ExternalLink } from "lucide-react";
import { useTypewriter } from "@/hooks/use-typewriter";

// ============================================================
// 词条轮播
// ============================================================
const BUZZWORDS = [
  "大语言模型微调",
  "深度学习",
  "强化学习",
  "SpringAI 学习中",
  "VibeCoding 享受中",
];

// ============================================================
// 子组件：悬浮标签（头像两侧）
// ============================================================
function FloatTag({
  children,
  delay = 0,
  side,
}: {
  children: React.ReactNode;
  delay?: number;
  side: "left" | "right";
}) {
  return (
    <motion.span
      animate={{ y: [0, -6, 0] }}
      transition={{
        duration: 5,
        delay,
        repeat: Infinity,
        ease: "easeInOut",
      }}
      className={`inline-block rounded-full border border-border bg-card px-3 py-1 text-xs font-medium text-foreground shadow-sm ${
        side === "left" ? "mr-[-20px]" : "ml-[-20px]"
      }`}
    >
      {children}
    </motion.span>
  );
}

// ============================================================
// 子组件：Hello-About 鼠标跟随交互区
// ============================================================
function HelloAbout() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState({ x: 0.5, y: 0.5 });

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    setPos({
      x: (e.clientX - rect.left) / rect.width,
      y: (e.clientY - rect.top) / rect.height,
    });
  }, []);

  const handleMouseLeave = useCallback(() => {
    setPos({ x: 0.5, y: 0.5 });
  }, []);

  return (
    <motion.div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="relative mb-6 h-[240px] overflow-hidden rounded-3xl bg-[#2128bd] select-none sm:h-[280px]"
    >
      {/* 彩色跟随圆 */}
      {[
        { size: 550, color: "#005ffe", speed: 500, scale: 1.2 },
        { size: 370, color: "#ffb6b0", speed: 400, scale: 1.6 },
        { size: 230, color: "#ffcc57", speed: 300, scale: 2.0 },
      ].map((c, i) => (
        <div
          key={i}
          className="absolute rounded-full ease-out"
          style={{
            height: c.size,
            width: c.size,
            backgroundColor: c.color,
            left: `${pos.x * 100}%`,
            top: `${pos.y * 100}%`,
            marginLeft: `-${c.size / 2}px`,
            marginTop: `-${c.size / 2}px`,
            transition: `transform ${c.speed}ms ease-out`,
            transform: `translate(${(pos.x - 0.5) * 100 * c.scale}px, ${(pos.y - 0.5) * 80 * c.scale}px)`,
          }}
        />
      ))}

      {/* mix-blend-screen 文字层 */}
      <div className="absolute inset-0 z-10 flex flex-col justify-center bg-white mix-blend-screen dark:bg-transparent">
        <h1 className="self-start text-[clamp(3rem,11vw,9rem)] font-bold leading-none tracking-tight text-black dark:text-white">
          Hello,
        </h1>
        <h1 className="self-end text-[clamp(3rem,11vw,9rem)] font-bold leading-none tracking-tight text-black dark:text-white">
          there!
        </h1>
      </div>
    </motion.div>
  );
}

// ============================================================
// 子组件：弹跳 emoji
// ============================================================
function BounceEmoji({
  children,
  delay = 0,
  className = "",
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) {
  return (
    <motion.span
      animate={{
        y: [0, -12, 0],
        rotate: [0, -8, 8, 0],
      }}
      transition={{
        duration: 3,
        delay,
        repeat: Infinity,
        ease: "easeInOut",
      }}
      className={`inline-block ${className}`}
    >
      {children}
    </motion.span>
  );
}

// ============================================================
// 主组件
// ============================================================
export function AboutContent() {
  const { displayed, done } = useTypewriter(
    "醉后不知天在水，满船清梦压星河",
    { speed: 90, startDelay: 400 },
  );

  const [buzzIdx, setBuzzIdx] = useState(0);
  useEffect(() => {
    const timer = setInterval(() => {
      setBuzzIdx((prev) => (prev + 1) % BUZZWORDS.length);
    }, 2200);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="relative mx-auto max-w-3xl px-4 py-8 sm:px-6 sm:py-12">
      {/* 背景光晕 */}
      <div className="pointer-events-none absolute inset-0 -z-10 select-none overflow-hidden">
        <div className="absolute -top-20 right-0 h-[260px] w-[260px] rounded-full bg-[#425AEF]/5 blur-3xl" />
        <div className="absolute bottom-10 left-0 h-[220px] w-[220px] rounded-full bg-pink-500/5 blur-3xl" />
      </div>

      {/* ============================================================ */}
      {/* 1. Hello-About 鼠标跟随 */}
      {/* ============================================================ */}
      <HelloAbout />

      {/* ============================================================ */}
      {/* 2. 头像 + 悬浮标签 + 名字 + 打字机 */}
      {/* ============================================================ */}
      <motion.section
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="mb-10 flex flex-col items-center"
      >
        <div className="flex items-center gap-6 sm:gap-10">
          <div className="hidden sm:flex flex-col items-end gap-2">
            <FloatTag side="left" delay={0}>☕ Coffee</FloatTag>
            <FloatTag side="left" delay={0.4}>🧠 LLM</FloatTag>
            <FloatTag side="left" delay={0.8}>❤️ LuoTianyi</FloatTag>
          </div>

          {/* 头像 */}
          <motion.div
            className="relative h-28 w-28 shrink-0 sm:h-36 sm:w-36"
            whileHover={{ scale: 1.08, rotate: [0, -3, 3, 0] }}
            transition={{ duration: 0.4, ease: "easeInOut" }}
          >
            <div className="absolute -inset-1.5 rounded-full bg-gradient-to-br from-[#425AEF] via-violet-500 to-pink-400 opacity-40 blur-md animate-pulse" />
            <Image
              src="https://avatars.githubusercontent.com/u/144646414?v=4"
              alt="头像"
              width={144}
              height={144}
              priority
              unoptimized
              className="relative rounded-full border-2 border-background object-cover"
            />
            <motion.div
              animate={{ scale: [1, 1.15, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="absolute -right-1 -bottom-1 h-7 w-7 rounded-full border-[3px] border-background bg-emerald-400"
            />
          </motion.div>

          <div className="hidden sm:flex flex-col items-start gap-2">
            <FloatTag side="right" delay={0.2}>🎮 Gaming</FloatTag>
            <FloatTag side="right" delay={0.6}>🎵 Music</FloatTag>
            <FloatTag side="right" delay={1}>💗 YueZhengling</FloatTag>
          </div>
        </div>

        <div className="mt-6 text-center">
          {/* 手写小问候 */}
          <p className="font-[family-name:var(--font-caveat)] text-2xl text-muted-foreground sm:text-3xl">
            Hi, my name is
          </p>
          <h1 className="mt-1 text-3xl font-bold tracking-tight sm:text-4xl">
            <span className="bg-gradient-to-br from-foreground via-[#425AEF] to-pink-500 bg-clip-text text-transparent">
              自然晴
            </span>
          </h1>
          <p className="mt-1 text-xs text-muted-foreground">@SunnyDay2333</p>

          <p className="mt-4 text-base leading-relaxed text-muted-foreground sm:text-lg">
            {displayed}
            <span
              className={`ml-0.5 inline-block h-4 w-0.5 translate-y-0.5 bg-foreground sm:h-5 ${
                done ? "animate-pulse" : ""
              }`}
            />
          </p>
        </div>
      </motion.section>

      {/* ============================================================ */}
      {/* 3. 两栏：自我介绍渐变卡 + 研究方向词条切换 */}
      {/* ============================================================ */}
      <div className="grid gap-4 sm:grid-cols-[60fr_40fr] mb-4">
        {/* 自我介绍渐变卡 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.6 }}
          className="relative overflow-hidden rounded-3xl p-7 text-white sm:p-8"
          style={{
            background:
              "linear-gradient(120deg, #5b27ff 0%, #00d4ff 100%)",
            backgroundSize: "200% 200%",
            animation: "gradient-shift 15s ease infinite",
          }}
        >
          {/* 浮动装饰形状 */}
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            className="absolute -top-10 -right-10 h-32 w-32 rounded-full border-[3px] border-white/20"
          />
          <motion.div
            animate={{ rotate: -360 }}
            transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
            className="absolute -bottom-8 -left-8 h-24 w-24 rounded-full border-[3px] border-white/15"
          />

          <div className="relative z-10 flex flex-col justify-center min-h-[200px]">
            <p className="text-xs opacity-80">
              你好，很高兴认识你{" "}
              <BounceEmoji delay={0.3}>👋</BounceEmoji>
            </p>
            <p className="mt-2 text-3xl font-bold leading-tight sm:text-4xl">
              我叫 <span className="whitespace-nowrap">自然晴</span>
            </p>
            <p className="mt-3 text-sm leading-relaxed opacity-90">
              这是我的个人博客，
              <br />
              记录一些学习经验和生活分享。
            </p>
            {/* 手写小尾签 */}
            <p className="mt-3 font-[family-name:var(--font-caveat)] text-2xl opacity-80">
              nice to meet you ~
            </p>
          </div>
        </motion.div>

        {/* 研究方向词条切换卡 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="relative flex flex-col justify-center overflow-hidden rounded-3xl border border-border bg-card p-6 sm:p-8"
        >
          {/* 右上角装饰小圆 */}
          <div className="absolute top-4 right-4 flex gap-1.5">
            <span className="h-2 w-2 rounded-full bg-red-400" />
            <span className="h-2 w-2 rounded-full bg-yellow-400" />
            <span className="h-2 w-2 rounded-full bg-green-400" />
          </div>

          <p className="text-[11px] tracking-wider text-muted-foreground uppercase">
            在折腾什么
          </p>
          <h2 className="mt-1 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            研究方向
          </h2>

          <div className="relative mt-4 h-9 overflow-hidden">
            <motion.span
              key={buzzIdx}
              initial={{ y: "100%", opacity: 0 }}
              animate={{ y: "0%", opacity: 1 }}
              exit={{ y: "-100%", opacity: 0 }}
              transition={{ duration: 0.4, ease: "easeInOut" }}
              className="absolute inset-0 bg-gradient-to-r from-[#425AEF] to-pink-500 bg-clip-text text-2xl font-semibold text-transparent"
            >
              {BUZZWORDS[buzzIdx]}
            </motion.span>
          </div>

          {/* 手写小尾签 */}
          <p className="mt-3 font-[family-name:var(--font-caveat)] text-xl text-muted-foreground">
            currently exploring...
          </p>
        </motion.div>
      </div>

      {/* ============================================================ */}
      {/* 4. 三栏研究方向卡片（俏皮图标） */}
      {/* ============================================================ */}
      <div className="grid gap-4 sm:grid-cols-3 mb-4">
        {[
          {
            emoji: "🧠",
            title: "LLM 研究",
            desc: "大语言模型微调与应用探索",
            grad: "from-[#425AEF] to-cyan-400",
            bg: "from-[#425AEF]/10 to-cyan-400/10",
          },
          {
            emoji: "🔬",
            title: "深度学习",
            desc: "CNN / RNN / Transformer",
            grad: "from-emerald-500 to-teal-400",
            bg: "from-emerald-500/10 to-teal-400/10",
          },
          {
            emoji: "🤖",
            title: "强化学习",
            desc: "UAV 自主导航、边缘计算卸载",
            grad: "from-orange-500 to-rose-500",
            bg: "from-orange-500/10 to-rose-500/10",
          },
        ].map((card, i) => (
          <motion.div
            key={card.title}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.5, delay: i * 0.08 }}
            whileHover={{ y: -6, rotate: -1 }}
            className={`group relative overflow-hidden rounded-2xl border border-border bg-gradient-to-br ${card.bg} p-5 backdrop-blur-sm`}
          >
            <BounceEmoji delay={i * 0.3} className="text-3xl">
              {card.emoji}
            </BounceEmoji>
            <div
              className={`mt-3 h-1 w-10 rounded-full bg-gradient-to-r ${card.grad}`}
            />
            <h3 className="mt-3 text-base font-semibold text-foreground">
              {card.title}
            </h3>
            <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
              {card.desc}
            </p>
          </motion.div>
        ))}
      </div>

      {/* ============================================================ */}
      {/* 5. 爱好宫格（4 个渐变卡片） */}
      {/* ============================================================ */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-60px" }}
        transition={{ duration: 0.6 }}
        className="mb-4 rounded-3xl border border-border bg-card p-6 sm:p-8"
      >
        <div className="flex items-center justify-between mb-5">
          <div>
            <p className="text-[11px] tracking-wider text-muted-foreground uppercase">
              闲着做什么
            </p>
            <h2 className="mt-1 text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              兴趣爱好
            </h2>
            {/* 手写副标题 */}
            <p className="mt-1 font-[family-name:var(--font-caveat)] text-xl text-muted-foreground">
              what i love
            </p>
          </div>
          <BounceEmoji delay={0.5} className="text-3xl">
            🎈
          </BounceEmoji>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            { emoji: "🎮", label: "CS2/DeltaForce", sub: "不来一局？", grad: "from-violet-500/20 to-indigo-500/20" },
            { emoji: "⭐", label: "崩坏：星穹铁道", sub: "今天也是三月七～", grad: "from-amber-400/20 to-orange-500/20" },
            { emoji: "📺", label: "佛系追番", sub: "有时间会看一点", grad: "from-pink-400/20 to-rose-500/20" },
            { emoji: "🎵", label: "VOCALOID", sub: "中V十年老粉", grad: "from-cyan-400/20 to-blue-500/20" },
          ].map((h, i) => (
            <motion.div
              key={h.label}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              whileHover={{ y: -4, rotate: [0, -3, 3, 0] }}
              transition={{ duration: 0.3, delay: i * 0.07, ease: "easeInOut" }}
              className={`relative flex flex-col items-center gap-1 rounded-2xl border border-border bg-gradient-to-br ${h.grad} p-4 text-center cursor-default overflow-hidden`}
            >
              <span className="text-3xl">{h.emoji}</span>
              <span className="text-sm font-semibold text-foreground">
                {h.label}
              </span>
              <span className="text-[10px] text-muted-foreground">{h.sub}</span>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* ============================================================ */}
      {/* 6. 生涯 + 座右铭（两栏） */}
      {/* ============================================================ */}
      <div className="grid gap-4 sm:grid-cols-2 mb-4">
        {/* 生涯 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.6 }}
          className="relative overflow-hidden rounded-2xl border border-border bg-card p-6 sm:p-8"
        >
          <p className="text-[11px] tracking-wider text-muted-foreground uppercase">
            生涯
          </p>
          <h2 className="mt-1 text-3xl font-bold tracking-tight text-foreground">
            无限进步
          </h2>
          {/* 手写副标题 */}
          <p className="mt-1 font-[family-name:var(--font-caveat)] text-xl text-muted-foreground">
            keep moving forward
          </p>

          <div className="mt-5 flex items-center gap-3">
            <span className="inline-block h-2.5 w-2.5 rounded-full bg-[#357ef5] animate-pulse" />
            <span className="text-sm text-foreground">
              海南大学 · 计算机科学与技术 · 本科
            </span>
          </div>
          <div className="mt-5 flex items-center gap-3">
            <span className="inline-block h-2.5 w-2.5 rounded-full bg-[#357ef5] animate-pulse" />
            <span className="text-sm text-foreground">
              电子科技大学 · 计算机科学与技术 · 硕士
            </span>
          </div>

         
         
        </motion.div>

        {/* 座右铭 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="relative flex flex-col justify-center overflow-hidden rounded-2xl border border-border bg-gradient-to-br from-pink-500/10 via-purple-500/10 to-cyan-500/10 p-6 sm:p-8"
        >
          {/* 大引号装饰 */}
          <span className="absolute top-2 left-4 text-6xl text-muted-foreground/20 font-serif leading-none">
            &ldquo;
          </span>

          <p className="text-[11px] tracking-wider text-muted-foreground uppercase">
            座右铭
          </p>
          <p className="mt-3 text-2xl font-bold leading-tight text-foreground sm:text-3xl">
            关心亲人，
            <br />
            关爱自己。
          </p>
          {/* 手写小尾签 */}
          <p className="mt-3 font-[family-name:var(--font-caveat)] text-xl text-muted-foreground">
            be kind, always.
          </p>

          <span className="absolute bottom-2 right-4 text-6xl text-muted-foreground/20 font-serif leading-none rotate-180">
            &ldquo;
          </span>
        </motion.div>
      </div>

      {/* ============================================================ */}
      {/* 7. 找到我 */}
      {/* ============================================================ */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-60px" }}
        transition={{ duration: 0.6 }}
        className="rounded-2xl border border-border bg-card p-6 sm:p-8"
      >
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-[11px] tracking-wider text-muted-foreground uppercase">
              联系
            </p>
            <h2 className="mt-1 text-2xl font-bold tracking-tight text-foreground">
              找到我
            </h2>
            {/* 手写副标题 */}
            <p className="mt-1 font-[family-name:var(--font-caveat)] text-xl text-muted-foreground">
              say hi anytime
            </p>
          </div>
          <BounceEmoji delay={0.6} className="text-3xl">
            📬
          </BounceEmoji>
        </div>

        <div className="flex flex-wrap gap-2">
          <a
            href="https://github.com/SunnyDay2333"
            target="_blank"
            rel="noopener noreferrer"
            className="group inline-flex items-center gap-2 rounded-full border border-border bg-background px-5 py-2.5 text-sm transition-all hover:bg-accent hover:shadow-md active:scale-95"
          >
            <GitBranch className="h-4 w-4 text-muted-foreground group-hover:text-foreground" />
            <span className="font-medium text-foreground">SunnyDay2333</span>
            <ExternalLink className="h-3 w-3 text-muted-foreground/50" />
          </a>
        </div>
      </motion.div>

      {/* 渐变动画 keyframes */}
      <style jsx>{`
        @keyframes gradient-shift {
          0% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
          100% {
            background-position: 0% 50%;
          }
        }
      `}</style>
    </div>
  );
}
