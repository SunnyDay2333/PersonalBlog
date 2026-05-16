"use client";

// ============================================================
// 亮 / 暗主题切换按钮
// 点击在 light ↔ dark 之间切换，同时支持跟随系统的 system 模式
// ============================================================

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { Sun, Moon } from "lucide-react";
import { Button } from "@/components/ui/button";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  // 防止 SSR 水合不匹配 —— 仅在客户端挂载后渲染真实图标
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    // 占位按钮：宽高与真实按钮一致，避免布局抖动
    return (
      <Button variant="ghost" size="icon" disabled>
        <span className="h-4 w-4" />
      </Button>
    );
  }

  const isDark = theme === "dark";

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      aria-label={isDark ? "切换到亮色模式" : "切换到暗色模式"}
    >
      {isDark ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
    </Button>
  );
}
