"use client";

// ============================================================
// 防抖 Hook
// 延迟 delay ms 后才更新值，避免快速输入时频繁触发重渲染
// ============================================================

import { useState, useEffect } from "react";

export function useDebounce<T>(value: T, delay = 300): T {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debounced;
}
