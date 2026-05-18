// ============================================================
// 公共端（C 端）页脚
// 三列布局：品牌 / 导航 / 社交 + 底部版权栏
// ============================================================

import Link from "next/link";
import { GithubIcon } from "@/components/icons/github-icon";
import { SITE_NAME } from "@/lib/constants";

const navLinks = [
  { href: "/", label: "主页" },
  { href: "/posts", label: "文章" },
  { href: "/moments", label: "说说" },
  { href: "/about", label: "关于" },
];

export function PublicFooter() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-border bg-background">
      {/* 主体 */}
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-3">

          {/* 品牌 */}
          <div>
            <span
              className="text-xl font-semibold tracking-wide"
              style={{ fontFamily: "var(--font-caveat)" }}
            >
              {SITE_NAME}
            </span>
            <p className="mt-2 max-w-[200px] text-[13px] leading-relaxed text-muted-foreground">
              用代码和文字记录生活的点滴
            </p>
          </div>

          {/* 导航 */}
          <div>
            <p className="mb-3 text-[11px] font-medium uppercase tracking-[0.08em] text-muted-foreground">
              导航
            </p>
            <nav className="flex flex-col gap-2">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="w-fit text-[13px] text-muted-foreground transition-colors hover:text-foreground"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>

          {/* 社交 */}
          <div>
            <p className="mb-3 text-[11px] font-medium uppercase tracking-[0.08em] text-muted-foreground">
              社交
            </p>
            <div className="flex flex-col gap-2">
              <a
                href="https://github.com/SunnyDay2333"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex w-fit items-center gap-2 text-[13px] text-muted-foreground transition-colors hover:text-foreground"
              >
                <GithubIcon className="h-4 w-4" />
                GitHub
              </a>
              <Link
                href="/admin"
                className="w-fit text-[13px] text-muted-foreground transition-colors hover:text-foreground"
              >
                管理后台
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* 版权栏 */}
      <div className="border-t border-border/60">
        <div className="mx-auto flex h-12 max-w-6xl items-center justify-between px-4 text-[12px] text-muted-foreground sm:px-6">
          <span>
            &copy; {currentYear} {SITE_NAME}
          </span>
          <span className="text-muted-foreground/60">
            Powered by Next.js &amp; Supabase
          </span>
        </div>
      </div>
    </footer>
  );
}
