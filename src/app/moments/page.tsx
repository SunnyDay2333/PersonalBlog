// ============================================================
// 说说列表页（C 端）
// Server Component — 直连 Supabase 获取已发布说说
//
// 布局设计：
//   · 全宽透明背景层，canvas 动效透出
//   · 内容廊道（max-w-6xl），半透明乳白底 + 柔光边界
//   · 三列：左 180px 状态卡 / 中 max-w-[600px] 卡片流 / 右 180px 光球
//   · 卡片按年份分组，年份分割线
//   · 廊道底部渐变过渡至 Footer
// ============================================================

import type { Metadata } from "next";
import { PublicHeader } from "@/components/layout/public-header";
import { PublicFooter } from "@/components/layout/public-footer";
import { MomentCard } from "@/components/moments/moment-card";
import { AuthorStatusCard } from "@/components/moments/author-status-card";
import { YearDivider } from "@/components/moments/year-divider";
import { EmptyState } from "@/components/shared/empty-state";
import { groupByYear } from "@/lib/utils/group-by-year";
import { SITE_NAME } from "@/lib/constants";
import type { MomentWithImages } from "@/types/moment";

export const metadata: Metadata = {
  title: `说说 | ${SITE_NAME}`,
  description: "碎片化日常分享",
};

export const revalidate = 60;

async function getPublishedMoments(): Promise<MomentWithImages[]> {
  const { createClient } = await import("@/lib/supabase/server");
  const { getPublishedMoments } = await import(
    "@/lib/services/moment-service"
  );
  const supabase = await createClient();
  return getPublishedMoments(supabase, 0, 20);
}

export default async function MomentsPage() {
  const moments = await getPublishedMoments();
  const yearGroups = groupByYear(moments);

  return (
    <>
      <PublicHeader />

      {/* ===== 全宽背景层 — 透明底透出 canvas 动效 ===== */}
      <main className="relative flex-1 overflow-hidden">

        {/* ===== 内容廊道 — 匹配导航栏宽度，半透明乳白底 + 柔化边界 ===== */}
        <div
          className="relative mx-auto max-w-6xl min-h-[calc(100vh-56px)] bg-white/38 dark:bg-card/55"
          style={{
            boxShadow: "inset 1px 0 0 rgba(0,0,0,0.04), inset -1px 0 0 rgba(0,0,0,0.04)",
          }}
        >
          {/* 廊道内点状纹理叠加 */}
          <div
            className="pointer-events-none absolute inset-0 z-0"
            style={{
              backgroundImage: "radial-gradient(circle, rgba(0,0,0,0.03) 1px, transparent 1px)",
              backgroundSize: "24px 24px",
            }}
          />

          {/* ===== 三列布局 ===== */}
          <div className="relative z-[1] flex justify-center gap-8 px-6 py-10 sm:py-14">

            {/* 左列 — 作者状态卡（桌面端 sticky） */}
            <aside className="hidden w-[180px] shrink-0 lg:block">
              <div className="sticky top-[72px]">
                <AuthorStatusCard momentCount={moments.length} />
              </div>
            </aside>

            {/* 中列 — 卡片流 */}
            <div className="w-full max-w-[600px] min-w-0">
              <div className="flex flex-col gap-[22px]">
                {/* 移动端紧凑作者信息条 */}
                <AuthorStatusCard momentCount={moments.length} compact />

                {yearGroups.length === 0 ? (
                  <EmptyState
                    title="还没有说说"
                    description="博主正在记录生活，敬请期待。"
                  />
                ) : (
                  yearGroups.map((group) => (
                    <div key={group.year} className="flex flex-col gap-[22px]">
                      <YearDivider year={group.year} />
                      {group.items.map((m) => (
                        <MomentCard key={m.id} moment={m} />
                      ))}
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* 右列 — 光球装饰 */}
            <div className="relative hidden w-[180px] shrink-0 lg:block">
              <div
                className="orb-glow orb-glow--sky"
                style={{ top: "60px", right: "-40px" }}
              />
              <div
                className="orb-glow orb-glow--sakura"
                style={{ top: "320px", right: "10px" }}
              />
            </div>

          </div>

          {/* 底部渐变过渡 — 从透明到 Footer 实色 */}
          <div className="pointer-events-none h-12 bg-gradient-to-b from-transparent to-background" />
        </div>
      </main>

      <PublicFooter />
    </>
  );
}
