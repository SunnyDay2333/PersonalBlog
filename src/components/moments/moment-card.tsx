// ============================================================
// 说说卡片组件
//   · Header  — 头像 + 昵称 + 相对时间
//   · Content — 正文（15px，relaxed 行高）
//   · Media   — 九宫格图片
//   · Footer  — 互动占位 + 设备小尾巴（预留）
// ============================================================

import { Heart, MessageCircle } from "lucide-react";
import type { MomentWithAuthor } from "@/types/moment";
import { MomentGrid } from "@/components/moments/moment-grid";
import { ActionButton } from "@/components/moments/action-button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { formatRelativeDate } from "@/lib/utils/date";

interface MomentCardProps {
  moment: MomentWithAuthor;
}

export function MomentCard({ moment }: MomentCardProps) {
  const { author } = moment;
  const displayName = author.display_name || "匿名用户";
  const initial = displayName[0] ?? "我";

  return (
    <article className="rounded-2xl border border-border/50 bg-card p-5 shadow-sm hover:shadow-md hover:border-border transition-all duration-300">
      {/* ============ Header 区 ============ */}
      <header className="flex items-center gap-3">
        <Avatar className="h-9 w-9 ring-2 ring-border/50">
          {author.avatar_url ? (
            <AvatarImage src={author.avatar_url} alt={displayName} />
          ) : null}
          <AvatarFallback>{initial}</AvatarFallback>
        </Avatar>
        <div className="flex flex-1 items-baseline gap-2 min-w-0">
          <span className="text-sm font-medium text-foreground truncate">
            {displayName}
          </span>
          <span className="text-xs text-muted-foreground shrink-0">
            · {formatRelativeDate(moment.created_at)}
          </span>
        </div>
      </header>

      {/* ============ Content 区 ============ */}
      <div className="mt-4">
        <p className="text-[15px] leading-relaxed text-foreground/90 whitespace-pre-wrap break-words">
          {moment.content}
        </p>
      </div>

      {/* ============ Media 区 ============ */}
      {moment.images.length > 0 && (
        <div className="mt-4">
          <MomentGrid images={moment.images} />
        </div>
      )}

      {/* ============ Footer 区 ============ */}
      <footer className="mt-5 flex items-center justify-between border-t border-border/40 pt-3">
        <div className="flex items-center gap-5">
          <ActionButton icon={Heart} label="点赞" />
          <ActionButton icon={MessageCircle} label="评论" />
        </div>
        <span className="text-[11px] text-muted-foreground/60">
          网页版
        </span>
      </footer>
    </article>
  );
}
