// ============================================================
// 管理端根布局
// 包含：侧边栏导航 + 鉴权守卫
// 桌面端固定侧边栏，移动端折叠 + 汉堡菜单
// ============================================================

import type { Metadata } from "next";
import type { ReactNode } from "react";
import { AdminLayoutClient } from "@/components/layout/admin-layout-client";
import { SITE_NAME } from "@/lib/constants";

export const metadata: Metadata = {
  title: {
    default: `控制台 | ${SITE_NAME}`,
    template: `%s | ${SITE_NAME}`,
  },
  robots: { index: false, follow: false },
};

export default function AdminLayout({ children }: { children: ReactNode }) {
  return <AdminLayoutClient>{children}</AdminLayoutClient>;
}
