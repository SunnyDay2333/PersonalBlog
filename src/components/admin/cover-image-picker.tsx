"use client";

// ============================================================
// 文章封面上传 + 暂存选择组件
//   · 支持拖拽 / 点击上传本地图片
//   · 上传至 Supabase Storage (article-covers)
//   · 已上传图片列表可点击直接选用
//   · 预览区 + 移除按钮
// ============================================================

import { useEffect, useRef, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { Upload, X, ImageIcon, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface CoverImagePickerProps {
  value: string;
  onChange: (url: string) => void;
}

export function CoverImagePicker({ value, onChange }: CoverImagePickerProps) {
  const supabase = createClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [storedImages, setStoredImages] = useState<
    { name: string; url: string }[]
  >([]);

  // 加载已上传图片列表
  const loadStoredImages = useCallback(async () => {
    const { data, error } = await supabase.storage
      .from("article-covers")
      .list("", { sortBy: { column: "created_at", order: "desc" } });

    if (error || !data) return;

    const images = data
      .filter((f) => f.name !== ".emptyFolderPlaceholder")
      .map((f) => ({
        name: f.name,
        url: supabase.storage.from("article-covers").getPublicUrl(f.name)
          .data.publicUrl,
      }));

    setStoredImages(images);
  }, [supabase]);

  useEffect(() => {
    loadStoredImages();
  }, [loadStoredImages]);

  // 上传文件
  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // 校验类型与大小
    if (!file.type.startsWith("image/")) return;
    if (file.size > 5 * 1024 * 1024) return;

    setUploading(true);

    const ext = file.name.split(".").pop() ?? "png";
    const fileName = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;

    const { error } = await supabase.storage
      .from("article-covers")
      .upload(fileName, file, { upsert: true });

    if (error) {
      console.error("上传失败:", error.message);
      setUploading(false);
      return;
    }

    const publicUrl = supabase.storage
      .from("article-covers")
      .getPublicUrl(fileName).data.publicUrl;

    onChange(publicUrl);
    setUploading(false);
    loadStoredImages();
  };

  const handleRemove = () => {
    onChange("");
  };

  return (
    <div className="flex flex-col gap-3">
      {/* 当前预览 / 上传按钮 */}
      <div className="flex items-start gap-3">
        {/* 预览区 */}
        {value ? (
          <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl border border-border">
            <img
              src={value}
              alt="封面预览"
              className="h-full w-full object-cover"
            />
            <button
              type="button"
              onClick={handleRemove}
              className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-foreground/70 text-background transition-colors hover:bg-foreground"
            >
              <X className="h-3 w-3" />
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="flex h-20 w-20 shrink-0 items-center justify-center rounded-xl border-2 border-dashed border-border text-muted-foreground transition-colors hover:border-[#425AEF]/40 hover:text-[#425AEF]"
          >
            {uploading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <ImageIcon className="h-5 w-5" />
            )}
          </button>
        )}

        {/* 上传提示 */}
        <div className="flex flex-col justify-center gap-1 text-xs text-muted-foreground">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="inline-flex items-center gap-1.5 text-[#425AEF] hover:underline"
          >
            <Upload className="h-3 w-3" />
            {uploading ? "上传中..." : "选择本地图片"}
          </button>
          <span>支持 PNG / JPG / WebP，不超过 5MB</span>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleUpload}
          className="hidden"
        />
      </div>

      {/* 已上传图片库 — 点击直接选用 */}
      {storedImages.length > 0 && (
        <div>
          <p className="mb-2 text-[10px] text-muted-foreground">已上传的封面</p>
          <div className="flex flex-wrap gap-2">
            {storedImages.map((img) => (
              <button
                key={img.name}
                type="button"
                onClick={() => onChange(img.url)}
                className={cn(
                  "relative h-14 w-14 overflow-hidden rounded-lg border-2 transition-all",
                  value === img.url
                    ? "border-[#425AEF] ring-2 ring-[#425AEF]/30"
                    : "border-border hover:border-foreground/20",
                )}
              >
                <img
                  src={img.url}
                  alt={img.name}
                  className="h-full w-full object-cover"
                />
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
