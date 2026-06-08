"use client";

// ============================================================
// 管理端根布局
// 桌面端：左侧固定侧边栏 + 右侧内容
// 移动端：全宽内容 + 汉堡按钮 + 折叠侧边栏 + 遮罩
// ============================================================

import { useState, useCallback } from "react";
import type { ReactNode } from "react";
import { Menu } from "lucide-react";
import { AdminSidebar } from "@/components/layout/admin-sidebar";

interface AdminLayoutClientProps {
  children: ReactNode;
}

export function AdminLayoutClient({ children }: AdminLayoutClientProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const openSidebar = useCallback(() => setSidebarOpen(true), []);
  const closeSidebar = useCallback(() => setSidebarOpen(false), []);

  return (
    <div className="flex min-h-full">
      <AdminSidebar mobileOpen={sidebarOpen} onClose={closeSidebar} />

      {/* 主内容区域 */}
      <div className="flex flex-1 flex-col lg:pl-56">
        {/* 移动端顶部栏：汉堡按钮 */}
        <div className="flex h-12 items-center border-b border-border px-4 lg:hidden">
          <button
            onClick={openSidebar}
            className="rounded-md p-1.5 text-muted-foreground hover:bg-accent hover:text-foreground"
            aria-label="打开菜单"
          >
            <Menu className="h-5 w-5" />
          </button>
          <span className="ml-3 text-sm font-medium text-muted-foreground">
            控制台
          </span>
        </div>

        <main className="flex-1 p-4 lg:p-6">{children}</main>
      </div>

      {/* 移动端遮罩层 */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm lg:hidden"
          onClick={closeSidebar}
          aria-hidden="true"
        />
      )}
    </div>
  );
}
