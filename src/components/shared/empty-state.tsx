// ============================================================
// 空状态占位组件
// 当列表 / 数据为空时展示友好提示
// ============================================================

import type { ReactNode } from "react";

interface EmptyStateProps {
  /** 主标题 */
  title: string;
  /** 辅助描述 */
  description?: string;
  /** 可选的操作按钮 */
  action?: ReactNode;
}

export function EmptyState({ title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="text-4xl mb-4 select-none opacity-40">📝</div>
      <h3 className="text-base font-medium text-foreground">{title}</h3>
      {description && (
        <p className="mt-1 max-w-xs text-sm text-muted-foreground">
          {description}
        </p>
      )}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
