"use client";

// ============================================================
// 客户端挂载检测 Hook
// 用于防止 SSR 水合不匹配（hydration mismatch）
// 典型场景：主题图标、依赖于浏览器 API 的组件
// ============================================================

import { useState, useEffect } from "react";

export function useMounted(): boolean {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return mounted;
}
