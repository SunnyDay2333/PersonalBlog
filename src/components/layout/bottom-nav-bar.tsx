"use client";

// ============================================================
// 移动端底部导航栏
// 仅在 < md 时显示，固定底部，适配 iPhone 安全区
// ============================================================

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, FileText, MessageCircle, User } from "lucide-react";
import { cn } from "@/lib/utils";

const TABS = [
  { href: "/", label: "主页", icon: Home },
  { href: "/posts", label: "文章", icon: FileText },
  { href: "/moments", label: "说说", icon: MessageCircle },
  { href: "/about", label: "关于", icon: User },
];

export function BottomNavBar() {
  const pathname = usePathname();

  return (
    <nav
      className="fixed bottom-0 inset-x-0 z-40 border-t border-border/60 bg-background/80 backdrop-blur-xl md:hidden"
      style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
    >
      <div className="flex h-14 items-center justify-around px-1">
        {TABS.map((tab) => {
          const isActive =
            tab.href === "/"
              ? pathname === "/"
              : pathname.startsWith(tab.href);

          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={cn(
                "flex flex-col items-center justify-center gap-0.5 min-w-0 flex-1 py-1 transition-colors",
                isActive
                  ? "text-[#425AEF]"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              <tab.icon className="h-5 w-5" strokeWidth={isActive ? 2.5 : 2} />
              <span className="text-[10px] font-medium leading-none">
                {tab.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
