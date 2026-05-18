"use client";

// ============================================================
// 公共端（C 端）顶部导航栏
// 包含站点 Logo、导航链接、主题切换按钮
// ============================================================

import Link from "next/link";
import { Home, FileText, MessageCircle, User } from "lucide-react";
import { ThemeToggle } from "@/components/theme/theme-toggle";

const AVATAR_URL = "https://avatars.githubusercontent.com/u/144646414?v=4";
const HANDLE_NAME = "SunnyDay2333";

export function PublicHeader() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/60 bg-background/65 backdrop-blur-xl backdrop-saturate-150 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 sm:px-6">
        {/* 左侧：Logo + 导航 */}
        <div className="flex items-center gap-6">
          {/* 手写体用户名 + 头像 */}
          <Link
            href="/"
            className="flex items-center gap-2.5 shrink-0"
          >
            <img
              src={AVATAR_URL}
              alt={HANDLE_NAME}
              className="h-7 w-7 rounded-full object-cover"
            />
            <span
              className="text-base font-semibold tracking-wide"
              style={{ fontFamily: "var(--font-caveat)" }}
            >
              {HANDLE_NAME}
            </span>
          </Link>

          {/* 分割线 */}
          <span className="h-5 w-px bg-border/60" />

          {/* 导航链接 */}
          <nav className="flex items-center gap-6">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground dark:text-foreground/70 dark:hover:text-foreground"
            >
              <Home className="h-3.5 w-3.5" />
              主页
            </Link>
            <Link
              href="/posts"
              className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground dark:text-foreground/70 dark:hover:text-foreground"
            >
              <FileText className="h-3.5 w-3.5" />
              文章
            </Link>
            <Link
              href="/moments"
              className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground dark:text-foreground/70 dark:hover:text-foreground"
            >
              <MessageCircle className="h-3.5 w-3.5" />
              说说
            </Link>
            <Link
              href="/about"
              className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground dark:text-foreground/70 dark:hover:text-foreground"
            >
              <User className="h-3.5 w-3.5" />
              关于
            </Link>
          </nav>
        </div>

        {/* 右侧：主题切换 */}
        <ThemeToggle />
      </div>
    </header>
  );
}
