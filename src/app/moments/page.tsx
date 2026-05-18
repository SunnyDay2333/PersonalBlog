// ============================================================
// 说说列表页（C 端）
// Server Component — 直连 Supabase 获取已发布说说
// 布局：与导航栏共享 max-w-6xl 基准线，卡片左对齐
//       右侧留白以呼吸光球 + 波点纹理装饰
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

      {/* ===== 主内容区 — 与导航栏共享 max-w-6xl 基准线 ===== */}
      <main className="relative mx-auto w-full max-w-6xl flex-1 overflow-hidden px-4 py-10 sm:px-6 sm:py-14 bg-background bg-dot-texture">

        {/* ===== 装饰光球（右侧留白区域，毛玻璃呼吸动画） ===== */}
        {/* 天蓝色光球 — 右上方 */}
        <div
          className="orb-glow orb-glow--sky hidden sm:block"
          style={{ top: "10%", right: "5%" }}
        />
        {/* 樱花粉色光球 — 右下方，错开位置 */}
        <div
          className="orb-glow orb-glow--sakura hidden sm:block"
          style={{ top: "55%", right: "14%" }}
        />

        {/* ===== 卡片流 — max-w-2xl 左对齐，与导航栏“主页”左侧基准线一致 ===== */}
        <div className="relative z-10 flex flex-col gap-6 max-w-2xl">
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
      </main>

      <PublicFooter />
    </>
  );
}
