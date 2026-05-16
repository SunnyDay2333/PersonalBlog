"use client";

// ============================================================
// 高性能 Intersection Observer 自定义 Hook
//
// 设计要点（确保 60fps 滚动表现）：
//   1. 使用原生 IntersectionObserver API — 浏览器在合成线程
//      上异步回调，零主线程阻塞，远优于 onscroll 事件
//   2. 一旦卡片进入视口即停止观察（observer.unobserve），
//      避免后续滚动中重复触发
//   3. 仅返回布尔状态，动画由 CSS transition 在合成层完成
//      （opacity + transform），不触发 Layout/Paint
// ============================================================

import { useEffect, useRef, useState } from "react";

interface UseIntersectionObserverOptions {
  /** 触发阈值：0.15 = 卡片 15% 可见时触发 */
  threshold?: number;
  /** 提前触发边距（"即将进入视口前 N px 就触发"） */
  rootMargin?: string;
  /** 是否只触发一次（默认 true，进入后不再观察） */
  once?: boolean;
}

export function useIntersectionObserver(
  options: UseIntersectionObserverOptions = {},
) {
  const { threshold = 0.15, rootMargin = "-40px", once = true } = options;
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          if (once) observer.unobserve(el);
        } else if (!once) {
          setIsVisible(false);
        }
      },
      { threshold, rootMargin },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [threshold, rootMargin, once]);

  return { ref, isVisible };
}
