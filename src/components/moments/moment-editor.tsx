"use client";

// ============================================================
// 说说编辑器（B 端）
//   · 文本输入（500 字限制）
//   · 多图上传（不限张数，Supabase Storage）
//   · 图片预览 + 移除
//   · 发布按钮
// ============================================================

import { useState, useRef, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Plus, X, Loader2 } from "lucide-react";

interface MomentEditorProps {
  onSuccess?: () => void;
}

export function MomentEditor({ onSuccess }: MomentEditorProps) {
  const supabase = createClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [content, setContent] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);

  // 清理预览 URL
  useEffect(() => {
    return () => {
      previews.forEach(URL.revokeObjectURL);
    };
    // 仅在组件卸载时清理
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleFilesChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const selected = e.target.files;
      if (!selected || selected.length === 0) return;
      const newFiles: File[] = [];
      const newPreviews: string[] = [];
      for (let i = 0; i < selected.length; i++) {
        const f = selected[i];
        if (!f.type.startsWith("image/")) continue;
        if (f.size > 5 * 1024 * 1024) continue;
        newFiles.push(f);
        newPreviews.push(URL.createObjectURL(f));
      }
      setFiles((prev) => [...prev, ...newFiles]);
      setPreviews((prev) => [...prev, ...newPreviews]);
      // 重置 input 值，允许重复选择同一文件
      e.target.value = "";
    },
    [],
  );

  const handleRemove = useCallback(
    (index: number) => {
      URL.revokeObjectURL(previews[index]);
      setFiles((prev) => prev.filter((_, i) => i !== index));
      setPreviews((prev) => prev.filter((_, i) => i !== index));
    },
    [previews],
  );

  const handleSubmit = async () => {
    if (content.trim().length === 0 || content.length > 500) return;
    setUploading(true);

    try {
      // 获取当前用户
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        toast.error("请先登录");
        setUploading(false);
        return;
      }

      // 上传图片到 Storage
      const imageInputs: {
        url: string;
        width: number | null;
        height: number | null;
        sort_order: number;
      }[] = [];

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const ext = file.name.split(".").pop() ?? "png";
        const fileName = `${Date.now()}-${i}-${Math.random().toString(36).slice(2, 8)}.${ext}`;

        const { error: uploadErr } = await supabase.storage
          .from("moment-images")
          .upload(fileName, file);

        if (uploadErr) {
          toast.error(`图片 ${i + 1} 上传失败: ${uploadErr.message}`);
          continue;
        }

        const publicUrl = supabase.storage
          .from("moment-images")
          .getPublicUrl(fileName).data.publicUrl;

        // 获取图片尺寸
        const size = await new Promise<{ w: number; h: number }>((resolve) => {
          const img = new Image();
          img.onload = () => resolve({ w: img.naturalWidth, h: img.naturalHeight });
          img.onerror = () => resolve({ w: 0, h: 0 });
          img.src = publicUrl;
        });

        imageInputs.push({
          url: publicUrl,
          width: size.w || null,
          height: size.h || null,
          sort_order: i,
        });
      }

      // 调用服务层创建说说
      const { createMoment } = await import(
        "@/lib/services/moment-service"
      );
      await createMoment(supabase, {
        content: content.trim(),
        images: imageInputs,
        author_id: user.id,
      });

      toast.success("说说已发布");
      setContent("");
      setFiles([]);
      previews.forEach(URL.revokeObjectURL);
      setPreviews([]);
      onSuccess?.();
    } catch (err) {
      toast.error("发布失败: " + (err instanceof Error ? err.message : "未知错误"));
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      {/* 文本区 */}
      <div className="space-y-2">
        <textarea
          rows={6}
          placeholder="分享这一刻的想法..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
          maxLength={500}
          className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm placeholder:text-muted-foreground/60 focus:border-[#425AEF]/40 focus:outline-none focus:ring-2 focus:ring-[#425AEF]/20"
        />
        <div
          className={`text-right text-xs ${
            content.length > 500 ? "text-red-500" : "text-muted-foreground"
          }`}
        >
          {content.length} / 500
        </div>
      </div>

      {/* 图片预览网格 */}
      {previews.length > 0 && (
        <div className="grid grid-cols-3 gap-2">
          {previews.map((url, i) => (
            <div
              key={i}
              className="relative aspect-square overflow-hidden rounded-lg border border-border"
            >
              <img
                src={url}
                alt={`预览 ${i + 1}`}
                className="h-full w-full object-cover"
              />
              <button
                type="button"
                onClick={() => handleRemove(i)}
                className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-black/60 text-white hover:bg-black"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* 添加图片按钮 */}
      <button
        type="button"
        onClick={() => fileInputRef.current?.click()}
        className="flex h-20 w-full items-center justify-center rounded-xl border-2 border-dashed border-border text-muted-foreground hover:border-[#425AEF]/40 hover:text-[#425AEF] transition-colors"
      >
        <Plus className="h-5 w-5 mr-2" />
        添加图片
      </button>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={handleFilesChange}
        className="hidden"
      />

      {/* 发布按钮 */}
      <Button
        onClick={handleSubmit}
        disabled={uploading || content.trim().length === 0 || content.length > 500}
        className="w-full"
      >
        {uploading ? (
          <>
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            发布中...
          </>
        ) : (
          "发布说说"
        )}
      </Button>
    </div>
  );
}
