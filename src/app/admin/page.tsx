// ============================================================
// 管理端仪表盘首页
// 展示文章统计概览
// ============================================================

import { AuthGuard } from "@/components/admin/auth-guard";
import { DashboardStats } from "@/components/admin/dashboard-stats";
import { getPostCount } from "@/lib/services/post-service";
import { ADMIN_LOGIN_PATH } from "@/lib/constants";

async function getStats() {
  const { createAdminClient } = await import("@/lib/supabase/admin");
  const supabase = createAdminClient();

  try {
    return await getPostCount(supabase);
  } catch {
    return { total: 0, published: 0, draft: 0 };
  }
}

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const stats = await getStats();

  return (
    <AuthGuard>
      <div className="flex flex-col gap-6">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">仪表盘</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            博客数据概览
          </p>
        </div>

        <DashboardStats
          total={stats.total}
          published={stats.published}
          draft={stats.draft}
        />

        <div className="mt-4 rounded-lg border border-border p-4">
          <p className="text-sm text-muted-foreground">
            📝 前往{" "}
            <a
              href={`${ADMIN_LOGIN_PATH}/posts`}
              className="font-medium text-primary hover:underline"
            >
              文章管理
            </a>{" "}
            创建、编辑或发布文章。
          </p>
        </div>
      </div>
    </AuthGuard>
  );
}
