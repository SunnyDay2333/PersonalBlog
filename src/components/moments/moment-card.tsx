"use client";

// ============================================================
// 说说卡片组件
//   · Header  — 头像 + 昵称 + 相对时间
//   · Content — 正文
//   · Media   — 九宫格图片
//   · Footer  — 评论展开按钮
//   · Waline 评论（可折叠）
// ============================================================

import { useState } from "react";
import { MessageCircle } from "lucide-react";
import type { MomentWithImages } from "@/types/moment";
import { MomentGrid } from "@/components/moments/moment-grid";
import { WalineComment } from "@/components/comments/waline";
import { formatRelativeDate } from "@/lib/utils/date";

const AVATAR_URL = "https://avatars.githubusercontent.com/u/144646414?v=4";
const DISPLAY_NAME = "自然晴";

interface MomentCardProps {
  moment: MomentWithImages;
}

export function MomentCard({ moment }: MomentCardProps) {
  const [showComments, setShowComments] = useState(false);

  return (
    <div className="moment-card rounded-xl border border-border bg-card p-5 shadow-sm">
      {/* ============ Header ============ */}
      <header className="flex items-center gap-3">
        <img
          src={AVATAR_URL}
          alt={DISPLAY_NAME}
          className="h-9 w-9 rounded-full ring-2 ring-border/50 object-cover"
        />
        <div className="flex flex-1 items-baseline gap-2 min-w-0">
          <span className="text-sm font-medium text-foreground">
            {DISPLAY_NAME}
          </span>
          <span className="text-xs text-muted-foreground shrink-0">
            · {formatRelativeDate(moment.created_at)}
          </span>
        </div>
      </header>

      {/* ============ Content ============ */}
      <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-foreground">
        {moment.content}
      </p>

      {/* ============ Media ============ */}
      {moment.images.length > 0 && (
        <div className="mt-3">
          <MomentGrid images={moment.images} />
        </div>
      )}

      {/* ============ Footer ============ */}
      <div className="mt-4 flex items-center border-t border-border/40 pt-3">
        <button
          type="button"
          onClick={() => setShowComments(!showComments)}
          className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          <MessageCircle className="h-4 w-4" />
          评论
        </button>
      </div>

      {/* ============ Waline 评论（可折叠） ============ */}
      {showComments && (
        <div className="mt-2">
          <WalineComment path={`/moments/${moment.id}`} compact />
        </div>
      )}
    </div>
  );
}
