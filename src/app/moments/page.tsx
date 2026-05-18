// ============================================================
// 说说列表页（C 端）
// Server Component — 直连 Supabase 获取已发布说说
//
// 布局：「内容廊道」设计
//   · 全宽背景层（波点纹理）
//   · 廊道容器 max-w-6xl，柔化竖边界 + 淡底色，与导航栏等宽
//   · 呼吸光球在廊道内右侧点缀
//   · 卡片在廊道内水平居中
// ============================================================

import type { Metadata } from "next";
import { PublicHeader } from "@/components/layout/public-header";
import { PublicFooter } from "@/components/layout/public-footer";
import { MomentCard } from "@/components/moments/moment-card";
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

      {/* ===== 页面外层 — 全宽背景（波点纹理） ===== */}
      <main className="relative flex-1 overflow-hidden bg-background bg-dot-texture py-10 sm:py-14">

        {/* ===== 廊道容器 — 与导航栏等宽，柔化竖边界 + 淡底色 ===== */}
        <div className="relative mx-auto max-w-6xl border-x border-border/10 bg-muted/15 px-4 sm:px-6 min-h-full">

          {/* ===== 廊道内光球装饰 — 右侧呼吸光晕 ===== */}
          <div
            className="orb-glow orb-glow--sky hidden sm:block"
            style={{ top: "8%", right: "8%" }}
          />
          <div
            className="orb-glow orb-glow--sakura hidden sm:block"
            style={{ top: "50%", right: "16%" }}
          />

          {/* ===== 卡片列 — 廊道内居中 ===== */}
          <div className="relative z-10 mx-auto flex max-w-2xl flex-col gap-6 py-10">
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
        </div>
      </main>

      <PublicFooter />
    </>
  );
}
