"use client";

// ============================================================
// 管理端（B 端）侧边栏
// 桌面端：固定左侧 224px
// 移动端：隐藏，通过汉堡按钮触发滑入 + 遮罩
// ============================================================

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  FileText,
  Settings,
  LogOut,
  PlusCircle,
  MessageCircle,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

const NAV_ITEMS = [
  { label: "仪表盘", href: "/admin", icon: LayoutDashboard },
  { label: "文章管理", href: "/admin/posts", icon: FileText },
  { label: "新建文章", href: "/admin/posts/new", icon: PlusCircle },
  { label: "说说管理", href: "/admin/moments", icon: MessageCircle },
  { label: "新建说说", href: "/admin/moments/new", icon: PlusCircle },
  { label: "设置", href: "/admin/settings", icon: Settings },
];

interface AdminSidebarProps {
  mobileOpen: boolean;
  onClose: () => void;
}

export function AdminSidebar({ mobileOpen, onClose }: AdminSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/admin/login");
    router.refresh();
  };

  const handleNav = () => {
    onClose();
  };

  const sidebarContent = (
    <>
      {/* Logo */}
      <div className="flex h-14 items-center justify-between border-b border-border px-4">
        <Link
          href="/admin"
          onClick={handleNav}
          className="text-base font-semibold tracking-tight text-foreground"
        >
          控制台
        </Link>
        {/* 移动端关闭按钮 */}
        <button
          onClick={onClose}
          className="rounded-md p-1 text-muted-foreground hover:bg-accent hover:text-foreground lg:hidden"
          aria-label="关闭菜单"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* 导航 */}
      <nav className="flex flex-1 flex-col gap-1 p-3">
        {NAV_ITEMS.map((item) => {
          const isActive =
            item.href === "/admin"
              ? pathname === "/admin"
              : pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={handleNav}
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

      {/* 退出 */}
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
    </>
  );

  return (
    <>
      {/* 桌面端：固定侧边栏 */}
      <aside className="fixed left-0 top-0 z-40 hidden h-full w-56 flex-col border-r border-border bg-card lg:flex">
        {sidebarContent}
      </aside>

      {/* 移动端：滑入覆盖层 */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-border bg-card shadow-2xl transition-transform duration-300 ease-in-out lg:hidden",
          mobileOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        {sidebarContent}
      </aside>
    </>
  );
}
