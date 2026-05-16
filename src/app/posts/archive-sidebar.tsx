"use client";

// ============================================================
// 归档侧栏
// 包含：顶部装饰 Banner、月度归档统计、总数/建站天数信息
// ============================================================

import { motion } from "framer-motion";
import { FileText, Clock } from "lucide-react";
import type { Post } from "@/types/post";

/** 统计每个年月的文章数 */
function groupPostsByMonth(posts: Post[]): Map<string, number> {
  const groups = new Map<string, number>();
  for (const post of posts) {
    const date = new Date(post.published_at ?? post.created_at);
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
    groups.set(key, (groups.get(key) ?? 0) + 1);
  }
  return groups;
}

/** 中文月份名 */
const MONTH_NAMES = [
  "一月", "二月", "三月", "四月", "五月", "六月",
  "七月", "八月", "九月", "十月", "十一月", "十二月",
];

/** 站点建站日期 */
const SITE_START_DATE = new Date("2026-05-09");

interface ArchiveSidebarProps {
  posts: Post[];
}

export function ArchiveSidebar({ posts }: ArchiveSidebarProps) {
  const monthGroups = groupPostsByMonth(posts);
  const sortedMonths = [...monthGroups.entries()].sort((a, b) =>
    a[0] < b[0] ? 1 : -1,
  );

  // 建站天数
  const daysSince = Math.max(
    1,
    Math.floor((Date.now() - SITE_START_DATE.getTime()) / (1000 * 60 * 60 * 24)),
  );

  return (
    <aside className="flex flex-col gap-4 lg:sticky lg:top-20 lg:h-fit">
      {/* ---- 顶部装饰 Banner ---- */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="relative overflow-hidden rounded-3xl p-6 text-white"
        style={{
          background: "linear-gradient(135deg, #4F50FF 0%, #425AEF 100%)",
        }}
      >
        {/* 旋转光环装饰 */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
          className="absolute -top-12 -right-12 h-40 w-40 rounded-full border-[3px] border-white/20"
        />
        <motion.div
          animate={{ rotate: -360 }}
          transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
          className="absolute -bottom-8 -left-8 h-28 w-28 rounded-full border-[3px] border-white/15"
        />

        <div className="relative z-10">
          <p className="text-[11px] tracking-wider opacity-70 uppercase">
            集中精力
          </p>
          <p className="mt-1 text-lg font-bold leading-tight">
            攻克难关
          </p>
          <motion.div
            animate={{ y: [0, -8, 0], rotate: [0, 12, -12, 0] }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="mt-4 inline-block text-4xl"
          >
            🚀
          </motion.div>
        </div>
      </motion.div>

      {/* ---- 月度归档统计 ---- */}
      {sortedMonths.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="rounded-3xl border border-border bg-card p-5"
        >
          <p className="mb-4 text-[11px] tracking-wider text-muted-foreground uppercase">
            月度归档
          </p>

          <div className="grid grid-cols-2 gap-2">
            {sortedMonths.map(([key, count]) => {
              const [year, month] = key.split("-");
              return (
                <div
                  key={key}
                  className="group relative overflow-hidden rounded-xl border border-border bg-muted/30 p-3 transition-colors hover:bg-accent/40"
                >
                  <p className="text-[11px] text-muted-foreground">
                    {MONTH_NAMES[parseInt(month) - 1]} {year}
                  </p>
                  <p className="mt-0.5 text-base font-semibold text-foreground">
                    {count} 篇
                  </p>
                </div>
              );
            })}
          </div>
        </motion.div>
      )}

      {/* ---- 站点信息 ---- */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="rounded-3xl border border-border bg-card p-5"
      >
        <div className="flex items-center justify-between border-b border-border pb-3 mb-3">
          <span className="inline-flex items-center gap-2 text-xs text-muted-foreground">
            <FileText className="h-3.5 w-3.5" />
            文章总数
          </span>
          <span className="text-base font-semibold text-foreground">
            {posts.length}
          </span>
        </div>

        <div className="flex items-center justify-between">
          <span className="inline-flex items-center gap-2 text-xs text-muted-foreground">
            <Clock className="h-3.5 w-3.5" />
            建站天数
          </span>
          <span className="text-base font-semibold text-foreground">
            {daysSince} 天
          </span>
        </div>
      </motion.div>
    </aside>
  );
}
