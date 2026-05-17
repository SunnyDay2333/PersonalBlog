// ============================================================
// 互动占位按钮（Footer 区用）
// 极简风格：icon + label，hover 变色，无背景无边框
// ============================================================

import type { LucideIcon } from "lucide-react";

interface ActionButtonProps {
  icon: LucideIcon;
  label: string;
}

export function ActionButton({ icon: Icon, label }: ActionButtonProps) {
  return (
    <button
      type="button"
      className="inline-flex items-center gap-1.5 px-1 py-0.5 text-xs text-muted-foreground/70 hover:text-foreground transition-colors cursor-pointer"
    >
      <Icon className="h-4 w-4" />
      <span>{label}</span>
    </button>
  );
}
