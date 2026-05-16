// ============================================================
// 管理端根布局
// 所有 /admin 子路由共享此布局
// 包含：侧边栏导航 + 鉴权守卫
// ============================================================

import type { Metadata } from "next";
import type { ReactNode } from "react";
import { AdminSidebar } from "@/components/layout/admin-sidebar";
import { SITE_NAME } from "@/lib/constants";

export const metadata: Metadata = {
  title: {
    default: `控制台 | ${SITE_NAME}`,
    template: `%s | ${SITE_NAME}`,
  },
  // 管理端不索引
  robots: { index: false, follow: false },
};

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-full">
      {/* 侧边栏 — 固定宽高，桌面端可见 */}
      <AdminSidebar />

      {/* 主内容区域 — sidebar 宽度留白 */}
      <div className="flex flex-1 flex-col pl-56">
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}
