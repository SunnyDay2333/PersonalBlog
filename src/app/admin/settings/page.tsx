// ============================================================
// 管理端设置页
// 展示当前管理员信息和基础设置
// ============================================================

import { AuthGuard } from "@/components/admin/auth-guard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";

async function getProfile() {
  const { createAdminClient } = await import("@/lib/supabase/admin");
  const supabase = createAdminClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  return { user, profile };
}

export const dynamic = "force-dynamic";

export default async function AdminSettingsPage() {
  const data = await getProfile();

  return (
    <AuthGuard>
      <div className="flex flex-col gap-6">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">设置</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            管理员账户与站点配置
          </p>
        </div>

        {/* 管理员信息 */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">管理员信息</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center gap-4">
            <Avatar className="h-14 w-14">
              <div className="flex h-full w-full items-center justify-center bg-muted text-lg font-medium text-foreground">
                {data?.user?.email?.[0]?.toUpperCase() ?? "A"}
              </div>
            </Avatar>
            <div>
              <p className="text-sm font-medium text-foreground">
                {data?.profile?.display_name ?? "管理员"}
              </p>
              <p className="text-xs text-muted-foreground">
                {data?.user?.email ?? "加载中..."}
              </p>
              <Badge variant="outline" className="mt-1 text-[10px]">
                超级管理员
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* 站点信息 */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">站点信息</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">站点名称</span>
              <span className="text-foreground">
                {process.env.NEXT_PUBLIC_SITE_NAME ?? "My Blog"}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">数据库</span>
              <span className="text-foreground">Supabase PostgreSQL</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">部署平台</span>
              <span className="text-foreground">Vercel</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">框架</span>
              <span className="text-foreground">Next.js 16</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </AuthGuard>
  );
}
