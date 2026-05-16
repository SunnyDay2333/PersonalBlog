"use client";

// ============================================================
// 打字机效果 Hook
// 逐字符显示给定文本，可控速度 + 完成回调
// ============================================================

import { useEffect, useState } from "react";

interface UseTypewriterOptions {
  /** 每个字符之间的延迟（毫秒），默认 80 */
  speed?: number;
  /** 开始打字前的延迟（毫秒），默认 0 */
  startDelay?: number;
}

export function useTypewriter(text: string, options: UseTypewriterOptions = {}) {
  const { speed = 80, startDelay = 0 } = options;
  const [displayed, setDisplayed] = useState("");
  const [done, setDone] = useState(false);

  useEffect(() => {
    setDisplayed("");
    setDone(false);

    let index = 0;
    let interval: ReturnType<typeof setInterval>;

    const startTimer = setTimeout(() => {
      interval = setInterval(() => {
        if (index >= text.length) {
          clearInterval(interval);
          setDone(true);
          return;
        }
        // 按字符数切片（对中文 Unicode 友好）
        index++;
        setDisplayed(Array.from(text).slice(0, index).join(""));
      }, speed);
    }, startDelay);

    return () => {
      clearTimeout(startTimer);
      if (interval) clearInterval(interval);
    };
  }, [text, speed, startDelay]);

  return { displayed, done };
}
