// ============================================================
// 说说迷你卡片 — 首页横向滚动条用
// 紧凑布局：时间 + 正文(3行) + 最多3张缩略图
// ============================================================

import Link from "next/link";
import { formatRelativeDate } from "@/lib/utils/date";
import type { MomentWithImages } from "@/types/moment";

interface MomentMiniCardProps {
  moment: MomentWithImages;
}

export function MomentMiniCard({ moment }: MomentMiniCardProps) {
  const previewImages = moment.images.slice(0, 3);
  const extraCount = moment.images.length - 3;

  return (
    <Link
      href="/moments"
      className="flex w-[280px] shrink-0 snap-start flex-col rounded-2xl border border-border/60 bg-card p-[18px] shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-[#425AEF]/20 hover:shadow-[0_6px_20px_rgba(0,0,0,0.06)] max-[640px]:w-[240px]"
    >
      {/* 时间 */}
      <time className="text-[11px] text-muted-foreground">
        {formatRelativeDate(moment.created_at)}
      </time>

      {/* 正文 — 最多 3 行 */}
      <p className="mt-2 line-clamp-3 text-[14px] leading-relaxed text-foreground">
        {moment.content}
      </p>

      {/* 缩略图 — 最多 3 张 */}
      {previewImages.length > 0 && (
        <div className="mt-2.5 flex gap-1">
          {previewImages.map((img) => (
            <div key={img.id} className="h-[60px] w-[60px] shrink-0 overflow-hidden rounded-md">
              <img
                src={img.url}
                alt=""
                className="h-full w-full object-cover"
                loading="lazy"
              />
            </div>
          ))}
          {extraCount > 0 && (
            <div className="flex h-[60px] w-[60px] shrink-0 items-center justify-center rounded-md bg-muted/50 text-[12px] text-muted-foreground">
              +{extraCount}
            </div>
          )}
        </div>
      )}
    </Link>
  );
}
