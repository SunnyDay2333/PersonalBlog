"use client";

// ============================================================
// 公共端（C 端）顶部导航栏
// 包含站点 Logo、导航链接、主题切换按钮
// ============================================================

import Link from "next/link";
import { ThemeToggle } from "@/components/theme/theme-toggle";

export function PublicHeader() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/60 bg-background/65 backdrop-blur-xl backdrop-saturate-150 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 sm:px-6">
        {/* 左侧：Logo + 导航 */}
        <nav className="flex items-center gap-6">
          <Link
            href="/"
            className="text-sm text-muted-foreground transition-colors hover:text-foreground dark:text-foreground/70 dark:hover:text-foreground"
          >
            主页
          </Link>
          <Link
            href="/posts"
            className="text-sm text-muted-foreground transition-colors hover:text-foreground dark:text-foreground/70 dark:hover:text-foreground"
          >
            文章
          </Link>
          <Link
            href="/moments"
            className="text-sm text-muted-foreground transition-colors hover:text-foreground dark:text-foreground/70 dark:hover:text-foreground"
          >
            说说
          </Link>
          <Link
            href="/about"
            className="text-sm text-muted-foreground transition-colors hover:text-foreground dark:text-foreground/70 dark:hover:text-foreground"
          >
            关于
          </Link>
        </nav>

        {/* 右侧：主题切换 */}
        <ThemeToggle />
      </div>
    </header>
  );
}
