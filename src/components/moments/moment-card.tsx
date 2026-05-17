// ============================================================
// 说说卡片组件（Server Component）
// 参考 post-card.tsx 卡片风格
// ============================================================

import { format } from "date-fns";
import { zhCN } from "date-fns/locale";
import type { MomentWithImages } from "@/types/moment";
import { MomentGrid } from "@/components/moments/moment-grid";

interface MomentCardProps {
  moment: MomentWithImages;
}

export function MomentCard({ moment }: MomentCardProps) {
  return (
    <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
      {/* 日期 */}
      <time className="text-xs text-muted-foreground">
        {format(new Date(moment.created_at), "yyyy年MM月dd日 HH:mm", {
          locale: zhCN,
        })}
      </time>

      {/* 正文 */}
      <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-foreground">
        {moment.content}
      </p>

      {/* 九宫格图片 */}
      {moment.images.length > 0 && (
        <div className="mt-3">
          <MomentGrid images={moment.images} />
        </div>
      )}
    </div>
  );
}
