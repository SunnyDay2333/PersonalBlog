// ============================================================
// 公共端（C 端）页脚
// 极简设计，仅显示版权信息和社交链接
// ============================================================

import Link from "next/link";
import { SITE_NAME } from "@/lib/constants";

export function PublicFooter() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-border bg-background">
      <div className="mx-auto flex h-14 max-w-3xl items-center justify-between px-4 text-xs text-muted-foreground sm:px-6">
        <span>
          &copy; {currentYear} {SITE_NAME}. All rights reserved.
        </span>
        <nav className="flex items-center gap-4">
          <Link
            href="/admin"
            className="transition-colors hover:text-foreground"
          >
            管理
          </Link>
          <a
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            className="transition-colors hover:text-foreground"
          >
            GitHub
          </a>
        </nav>
      </div>
    </footer>
  );
}
