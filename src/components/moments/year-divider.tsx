// ============================================================
// 年份分割线 — 左右渐变线 + 居中年份标签
// ============================================================

interface YearDividerProps {
  year: number;
}

export function YearDivider({ year }: YearDividerProps) {
  return (
    <div className="flex items-center gap-[14px] py-1">
      <span className="h-px flex-1 bg-gradient-to-r from-transparent via-border/30 to-transparent dark:via-white/15" />
      <span className="text-[12px] font-semibold text-muted-foreground tracking-[0.05em] select-none dark:text-white/60">
        {year}
      </span>
      <span className="h-px flex-1 bg-gradient-to-r from-transparent via-border/30 to-transparent dark:via-white/15" />
    </div>
  );
}
