"use client";

// ============================================================
// 说说删除按钮（客户端组件）
// 点击后调用 deleteMoment 并刷新页面
// ============================================================

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2, Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";

interface DeleteMomentButtonProps {
  momentId: string;
}

export function DeleteMomentButton({ momentId }: DeleteMomentButtonProps) {
  const [deleting, setDeleting] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const handleDelete = async () => {
    if (!confirm("确定删除这条说说？")) return;
    setDeleting(true);
    try {
      const { deleteMoment } = await import(
        "@/lib/services/moment-service"
      );
      await deleteMoment(supabase, momentId);
      toast.success("说说已删除");
      router.refresh();
    } catch (err) {
      toast.error(
        "删除失败: " + (err instanceof Error ? err.message : "未知错误"),
      );
      setDeleting(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleDelete}
      disabled={deleting}
      className="inline-flex items-center gap-1 rounded-md px-2 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
    >
      {deleting ? (
        <Loader2 className="h-3.5 w-3.5 animate-spin" />
      ) : (
        <Trash2 className="h-3.5 w-3.5" />
      )}
      <span className="hidden sm:inline">删除</span>
    </button>
  );
}
