"use client";

// ============================================================
// 文章搜索框
// ============================================================

import { Search, X } from "lucide-react";

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
}

export function SearchBar({ value, onChange }: SearchBarProps) {
  return (
    <div className="relative">
      {/* 放大镜图标 */}
      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground/60 pointer-events-none" />

      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="搜索文章..."
        className="w-full rounded-xl border border-border bg-card py-2.5 pl-10 pr-9 text-sm text-foreground placeholder:text-muted-foreground/50 outline-none transition-all duration-200 focus:border-[#425AEF]/40 focus:ring-2 focus:ring-[#425AEF]/15"
      />

      {/* 清除按钮 */}
      {value && (
        <button
          onClick={() => onChange("")}
          className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1 text-muted-foreground/50 hover:text-muted-foreground transition-colors"
          aria-label="清除搜索"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      )}
    </div>
  );
}
