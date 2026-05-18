// ============================================================
// 说说列表页（C 端）
// Server Component — 直连 Supabase 获取已发布说说
//
// 布局设计：
//   · 全宽背景层（dot 纹理，透明底以透出 canvas 动效）
//   · 玻璃廊道（max-w-6xl，backdrop-blur 柔和区分内外）
//   · 三列：左状态卡 / 中卡片流 / 右光球装饰
// ============================================================

import type { Metadata } from "next";
import { PublicHeader } from "@/components/layout/public-header";
import { PublicFooter } from "@/components/layout/public-footer";
import { MomentCard } from "@/components/moments/moment-card";
import { AuthorStatusCard } from "@/components/moments/author-status-card";
import { EmptyState } from "@/components/shared/empty-state";
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

  return (
    <>
      <PublicHeader />

      {/* ===== 全宽背景层 — 仅 dot 纹理，透明底透出 canvas 动效 ===== */}
      <main className="relative flex-1 overflow-hidden bg-dot-texture py-10 sm:py-14">

        {/* ===== 玻璃廊道 — 与导航栏等宽 ===== */}
        <div className="relative mx-auto max-w-6xl border-x border-border/25 bg-card/60 backdrop-blur-md px-4 sm:px-6">

          {/* ===== 廊道内光球装饰 — 右侧呼吸光晕 ===== */}
          <div
            className="orb-glow orb-glow--sky hidden sm:block"
            style={{ top: "8%", right: "6%" }}
          />
          <div
            className="orb-glow orb-glow--sakura hidden sm:block"
            style={{ top: "48%", right: "12%" }}
          />

          {/* ===== 三列布局 ===== */}
          <div className="flex justify-center gap-4 lg:gap-6 py-10">

            {/* 左列 — 博主状态卡（桌面端 sticky） */}
            <aside className="hidden lg:block w-[172px] shrink-0">
              <div className="sticky top-20">
                <AuthorStatusCard momentCount={moments.length} />
              </div>
            </aside>

            {/* 中列 — 说说卡片流 */}
            <div className="relative z-10 w-full max-w-2xl flex flex-col gap-6">
              {moments.length === 0 ? (
                <EmptyState
                  title="还没有说说"
                  description="博主正在记录生活，敬请期待。"
                />
              ) : (
                moments.map((m) => (
                  <MomentCard key={m.id} moment={m} />
                ))
              )}
            </div>

            {/* 右列 — 留空给光球呼吸 ===== */}
            <div className="hidden lg:block w-[172px] shrink-0" />

          </div>
        </div>
      </main>

      <PublicFooter />
    </>
  );
}
