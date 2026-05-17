// ============================================================
// 说说管理列表页（B 端）
// 展示全部说说（含草稿），支持删除
// ============================================================

import { AuthGuard } from "@/components/admin/auth-guard";
import { Badge } from "@/components/ui/badge";
import { formatDetailDate } from "@/lib/utils/date";
import { DeleteMomentButton } from "./delete-button";
import type { MomentWithAuthor } from "@/types/moment";

async function getMoments(): Promise<MomentWithAuthor[]> {
  const { createAdminClient } = await import("@/lib/supabase/admin");
  const supabase = createAdminClient();
  const { getAllMoments } = await import("@/lib/services/moment-service");
  return getAllMoments(supabase);
}

export const dynamic = "force-dynamic";

const STATUS_CONFIG: Record<string, { variant: "default" | "secondary" | "outline"; label: string }> = {
  published: { variant: "default", label: "已发布" },
  draft: { variant: "secondary", label: "草稿" },
  archived: { variant: "outline", label: "已归档" },
};

export default async function AdminMomentsPage() {
  const moments = await getMoments();

  return (
    <AuthGuard>
      <div className="flex flex-col gap-6">
        {/* 标题栏 */}
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">说说管理</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            共 {moments.length} 条说说
          </p>
        </div>

        {moments.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <p className="text-sm text-muted-foreground">
              还没有说说，去「新建说说」发布第一条
            </p>
          </div>
        ) : (
          <div className="overflow-hidden rounded-lg border border-border">
            <table className="w-full">
              <thead className="border-b border-border bg-muted/50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">
                    内容
                  </th>
                  <th className="hidden px-4 py-3 text-left text-xs font-medium text-muted-foreground sm:table-cell">
                    状态
                  </th>
                  <th className="hidden px-4 py-3 text-left text-xs font-medium text-muted-foreground md:table-cell">
                    图片
                  </th>
                  <th className="hidden px-4 py-3 text-left text-xs font-medium text-muted-foreground lg:table-cell">
                    创建时间
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground">
                    操作
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {moments.map((moment) => {
                  const status =
                    STATUS_CONFIG[moment.status] ?? STATUS_CONFIG.draft;
                  return (
                    <tr
                      key={moment.id}
                      className="transition-colors hover:bg-muted/30"
                    >
                      <td className="px-4 py-3">
                        <span className="text-sm text-foreground line-clamp-2">
                          {moment.content.slice(0, 200)}
                          {moment.content.length > 200 && "…"}
                        </span>
                      </td>
                      <td className="hidden px-4 py-3 sm:table-cell">
                        <Badge variant={status.variant}>{status.label}</Badge>
                      </td>
                      <td className="hidden px-4 py-3 md:table-cell">
                        <span className="text-xs text-muted-foreground">
                          {moment.images.length} 张
                        </span>
                      </td>
                      <td className="hidden px-4 py-3 lg:table-cell">
                        <span className="text-xs text-muted-foreground">
                          {formatDetailDate(moment.created_at)}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <DeleteMomentButton momentId={moment.id} />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AuthGuard>
  );
}
