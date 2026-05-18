"use client";

// ============================================================
// 博主状态卡 — 说说页左侧栏
// 展示头像、昵称、个人签名、说说总数
// ============================================================

interface AuthorStatusCardProps {
  momentCount: number;
}

const AVATAR_URL = "https://avatars.githubusercontent.com/u/144646414?v=4";
const DISPLAY_NAME = "自然晴";
const BIO = "用代码和文字记录生活的点滴";

export function AuthorStatusCard({ momentCount }: AuthorStatusCardProps) {
  return (
    <div className="rounded-2xl border border-border/40 bg-card/70 backdrop-blur-sm p-4 text-center">
      {/* 头像 */}
      <img
        src={AVATAR_URL}
        alt={DISPLAY_NAME}
        className="mx-auto h-14 w-14 rounded-full object-cover ring-2 ring-border/30"
      />

      {/* 昵称 */}
      <p className="mt-2.5 text-sm font-semibold text-foreground">
        {DISPLAY_NAME}
      </p>

      {/* 签名 */}
      <p className="mt-1 text-[11px] text-muted-foreground leading-relaxed">
        {BIO}
      </p>

      {/* 分割 + 数据 */}
      <div className="mt-3.5 border-t border-border/30 pt-3">
        <p className="text-[10px] uppercase tracking-widest text-muted-foreground">
          碎碎念
        </p>
        <p className="mt-0.5 text-lg font-bold text-foreground">
          {momentCount}
        </p>
      </div>
    </div>
  );
}
