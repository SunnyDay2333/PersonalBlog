"use client";

// ============================================================
// 管理端（B 端）侧边栏
// 提供后台导航：仪表盘、文章管理、设置等
// ============================================================

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  FileText,
  Settings,
  LogOut,
  PlusCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

/** 侧边栏导航项定义 */
const NAV_ITEMS = [
  {
    label: "仪表盘",
    href: "/admin",
    icon: LayoutDashboard,
  },
  {
    label: "文章管理",
    href: "/admin/posts",
    icon: FileText,
  },
  {
    label: "新建文章",
    href: "/admin/posts/new",
    icon: PlusCircle,
  },
  {
    label: "设置",
    href: "/admin/settings",
    icon: Settings,
  },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();

  /** 退出登录 */
  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/admin/login");
    router.refresh();
  };

  return (
    <aside className="fixed left-0 top-0 z-40 flex h-full w-56 flex-col border-r border-border bg-card">
      {/* Logo 区域 */}
      <div className="flex h-14 items-center gap-2 border-b border-border px-4">
        <Link
          href="/admin"
          className="text-base font-semibold tracking-tight text-foreground"
        >
          控制台
        </Link>
      </div>

      {/* 导航菜单 */}
      <nav className="flex flex-1 flex-col gap-1 p-3">
        {NAV_ITEMS.map((item) => {
          const isActive =
            item.href === "/admin"
              ? pathname === "/admin" // 仪表盘仅精确匹配
              : pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-accent text-accent-foreground"
                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
              )}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <Separator />

      {/* 底部：退出按钮 */}
      <div className="p-3">
        <Button
          variant="ghost"
          className="w-full justify-start gap-3 text-sm text-muted-foreground hover:text-foreground"
          onClick={handleSignOut}
        >
          <LogOut className="h-4 w-4" />
          退出登录
        </Button>
      </div>
    </aside>
  );
}
