// ============================================================
// 公共端（C 端）页脚
// 极简设计，版权信息 + GitHub 链接 + 技术栈署名
// ============================================================

import Link from "next/link";
import { GithubIcon } from "@/components/icons/github-icon";
import { SITE_NAME } from "@/lib/constants";

export function PublicFooter() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-border bg-background">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 text-xs text-muted-foreground sm:px-6">
        <div className="flex items-center gap-4">
          <span>
            &copy; {currentYear} {SITE_NAME}
          </span>
          <span className="text-muted-foreground/50">
            Powered by Next.js &amp; Supabase
          </span>
        </div>

        <a
          href="https://github.com/SunnyDay2333"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 transition-colors hover:text-foreground"
        >
          <GithubIcon className="h-3.5 w-3.5" />
          GitHub
        </a>
      </div>
    </footer>
  );
}
