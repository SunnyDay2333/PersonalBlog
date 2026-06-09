// ============================================================
// 管理端设置页
// 展示当前管理员信息、站点配置、数据库统计
// ============================================================

import { AuthGuard } from "@/components/admin/auth-guard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { getPostCount } from "@/lib/services/post-service";
import { Mail, Shield, Calendar } from "lucide-react";

async function getProfile() {
  // 用 server client 读取 cookie 中的用户 session
  const { createClient } = await import("@/lib/supabase/server");
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  // 用 admin client 读取 profiles 表（bypass RLS）
  const { createAdminClient } = await import("@/lib/supabase/admin");
  const adminSupabase = createAdminClient();

  const { data: profile } = await adminSupabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  return { user, profile };
}

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

export default async function AdminSettingsPage() {
  const data = await getProfile();
  const stats = await getStats();

  const email = data?.user?.email ?? "—";
  const displayName = data?.profile?.display_name ?? "管理员";
  const createdAt = data?.user?.created_at;

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
          <CardHeader className="pb-4">
            <CardTitle className="text-base">管理员信息</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <Avatar className="h-14 w-14">
                <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-[#425AEF]/20 to-violet-500/20 text-lg font-bold text-[#425AEF]">
                  {email[0]?.toUpperCase() ?? "A"}
                </div>
              </Avatar>
              <div className="flex flex-col gap-0.5">
                <p className="text-sm font-semibold text-foreground">
                  {displayName}
                </p>
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Mail className="h-3 w-3" />
                  {email}
                </div>
                <Badge variant="outline" className="mt-0.5 w-fit text-[10px]">
                  <Shield className="mr-1 h-2.5 w-2.5" />
                  超级管理员
                </Badge>
              </div>
            </div>

            <Separator className="my-4" />

            <div className="flex flex-col gap-2 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">用户 ID</span>
                <span className="font-mono text-xs text-foreground/70">
                  {data?.user?.id?.slice(0, 12) ?? "—"}…
                </span>
              </div>
              {createdAt && (
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">注册时间</span>
                  <span className="flex items-center gap-1 text-xs text-foreground/70">
                    <Calendar className="h-3 w-3" />
                    {new Date(createdAt).toLocaleDateString("zh-CN", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* 站点信息 */}
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="text-base">站点信息</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-2.5 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">站点名称</span>
              <span className="font-medium text-foreground">
                {process.env.NEXT_PUBLIC_SITE_NAME ?? "My Blog"}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">技术框架</span>
              <span className="text-foreground">Next.js 16</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">数据库</span>
              <span className="text-foreground">Supabase PostgreSQL</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">文章总数</span>
              <span className="font-medium text-foreground">{stats.total}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">已发布</span>
              <span className="text-emerald-600">{stats.published}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">草稿</span>
              <span className="text-amber-600">{stats.draft}</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </AuthGuard>
  );
}
