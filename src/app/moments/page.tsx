// ============================================================
// 说说列表页（C 端）
// Server Component — 直连 Supabase 获取已发布说说
// ============================================================

import type { Metadata } from "next";
import { PublicHeader } from "@/components/layout/public-header";
import { PublicFooter } from "@/components/layout/public-footer";
import { MomentCard } from "@/components/moments/moment-card";
import { EmptyState } from "@/components/shared/empty-state";
import { SITE_NAME } from "@/lib/constants";
import type { MomentWithAuthor } from "@/types/moment";

export const metadata: Metadata = {
  title: `说说 | ${SITE_NAME}`,
  description: "碎片化日常分享",
};

export const revalidate = 60;

async function getPublishedMoments(): Promise<MomentWithAuthor[]> {
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
      <main className="mx-auto w-full max-w-xl flex-1 px-4 py-10 sm:px-6 sm:py-14 bg-muted/30">
        {moments.length === 0 ? (
          <EmptyState
            title="还没有说说"
            description="博主正在记录生活，敬请期待。"
          />
        ) : (
          <div className="flex flex-col gap-5">
            {moments.map((m) => (
              <MomentCard key={m.id} moment={m} />
            ))}
          </div>
        )}
      </main>
      <PublicFooter />
    </>
  );
}
