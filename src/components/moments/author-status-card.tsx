"use client";

// ============================================================
// 博主状态卡 — 说说页左侧栏
// 轻盈风格：半透明白底 + 极淡边框 + hover 微交互
// ============================================================

interface AuthorStatusCardProps {
  momentCount: number;
}

const AVATAR_URL = "https://avatars.githubusercontent.com/u/144646414?v=4";
const DISPLAY_NAME = "自然晴";
const BIO = "用代码和文字记录生活的点滴";

export function AuthorStatusCard({ momentCount }: AuthorStatusCardProps) {
  return (
    <div className="group flex flex-col items-center rounded-2xl border border-border/30 bg-white/55 px-3 py-5 text-center transition-shadow duration-300 hover:shadow-[0_2px_16px_rgba(0,0,0,0.04)] hover:border-border/40">
      {/* 头像 — desktop 64px，hover 蓝色光环 */}
      <img
        src={AVATAR_URL}
        alt={DISPLAY_NAME}
        className="h-16 w-16 rounded-full border-[3px] border-border/30 object-cover transition-colors duration-300 group-hover:border-[#425AEF]/20"
      />

      {/* 昵称 */}
      <p className="mt-3 text-[15px] font-semibold tracking-[-0.01em] text-foreground">
        {DISPLAY_NAME}
      </p>

      {/* 签名 */}
      <p className="mt-1.5 max-w-[140px] text-[12px] leading-relaxed text-muted-foreground">
        {BIO}
      </p>

      {/* 分割线 + 说说总数 */}
      <div className="mt-4 w-full border-t border-border/40 pt-4">
        <p className="text-[10px] uppercase tracking-[0.08em] text-muted-foreground">
          碎碎念
        </p>
        <p className="mt-0.5 text-2xl font-bold tabular-nums text-foreground">
          {momentCount}
        </p>
      </div>
    </div>
  );
}
