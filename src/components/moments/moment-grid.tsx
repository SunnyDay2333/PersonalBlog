"use client";

// ============================================================
// 说说九宫格图片组件
//   · 1-9 张：按实际数量自适应布局
//   · > 9 张：3×3 九宫格，第 9 格覆盖 +N 遮罩
//   · 点击任意图片进入 Lightbox，支持键盘导航
// ============================================================

import { useState, useEffect, useCallback } from "react";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import type { MomentImage } from "@/types/moment";

interface MomentGridProps {
  images: MomentImage[];
}

export function MomentGrid({ images }: MomentGridProps) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const total = images.length;

  const goPrev = useCallback(() => {
    setSelectedIndex((prev) => (prev !== null && prev > 0 ? prev - 1 : prev));
  }, []);

  const goNext = useCallback(() => {
    setSelectedIndex((prev) =>
      prev !== null && prev < total - 1 ? prev + 1 : prev,
    );
  }, [total]);

  const close = useCallback(() => setSelectedIndex(null), []);

  // 键盘支持
  useEffect(() => {
    if (selectedIndex === null) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case "ArrowLeft":
          goPrev();
          break;
        case "ArrowRight":
          goNext();
          break;
        case "Escape":
          close();
          break;
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedIndex, goPrev, goNext, close]);

  if (total === 0) return null;

  // 确定列数
  let gridCols = "grid-cols-3";
  if (total === 1) gridCols = "grid-cols-1";
  else if (total === 2) gridCols = "grid-cols-2";
  else if (total === 4) gridCols = "grid-cols-2";
  // 3, 5, 6, 7, 8, 9, >9 都用 grid-cols-3

  // 单张图宽度限制
  const isSingle = total === 1;

  // 显示的图片（最多 9 张用于九宫格）
  const displayImages = total > 9 ? images.slice(0, 9) : images;

  return (
    <>
      <div className={`grid ${gridCols} gap-2`}>
        {displayImages.map((img, i) => {
          const isLast = total > 9 && i === 8;
          return (
            <button
              key={img.id}
              type="button"
              onClick={() => setSelectedIndex(i)}
              className={`relative overflow-hidden rounded-xl cursor-pointer ${
                isSingle ? "aspect-square max-w-[60%]" : "aspect-square"
              }`}
            >
              <img
                src={img.url}
                alt={`图片 ${i + 1}`}
                className="h-full w-full object-cover transition-all duration-300 hover:scale-[1.03] hover:brightness-105"
                loading="lazy"
              />
              {isLast && (
                <div className="absolute inset-0 flex items-center justify-center rounded-xl bg-black/50">
                  <span className="text-white text-xl font-bold">
                    +{total - 9}
                  </span>
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Lightbox */}
      {selectedIndex !== null && (
        <div
          className="fixed inset-0 z-50 bg-black/95 flex flex-col items-center justify-center"
          onClick={close}
        >
          {/* 关闭按钮 */}
          <button
            onClick={close}
            className="absolute top-4 right-4 z-10 text-white/70 hover:text-white"
          >
            <X className="h-8 w-8" />
          </button>

          {/* 当前大图 */}
          <img
            src={images[selectedIndex].url}
            alt={`图片 ${selectedIndex + 1}`}
            className="max-h-[85vh] max-w-[90vw] object-contain"
            onClick={(e) => e.stopPropagation()}
          />

          {/* 左箭头 */}
          {selectedIndex > 0 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                goPrev();
              }}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-white/70 hover:text-white"
            >
              <ChevronLeft className="h-10 w-10" />
            </button>
          )}

          {/* 右箭头 */}
          {selectedIndex < total - 1 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                goNext();
              }}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-white/70 hover:text-white"
            >
              <ChevronRight className="h-10 w-10" />
            </button>
          )}

          {/* 底部圆点指示器 */}
          <div className="absolute bottom-6 flex items-center gap-2">
            {images.map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedIndex(i);
                }}
                className={`h-2 w-2 rounded-full transition-all ${
                  i === selectedIndex ? "bg-white w-4" : "bg-white/40"
                }`}
              />
            ))}
          </div>
        </div>
      )}
    </>
  );
}
