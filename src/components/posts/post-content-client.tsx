"use client";

// ============================================================
// Markdown 渲染器的交互组件（Client Component）
// 这些组件需要浏览器 API（clipboard 等），必须在客户端运行
// ============================================================

import { useState, useCallback, useEffect } from "react";
import type { ComponentProps } from "react";
import { Check, Copy } from "lucide-react";

// ============================================================
// Shiki token 颜色 — 亮/暗模式映射表
// github-dark-dimmed 的 RGB 值
// ============================================================
// github-dark-dimmed 的主要 RGB 值
const DARK_TOKEN_COLORS = [
  "#79c0ff", "#ff7b72", "#a5d6ff", "#d2a8ff",
  "#ffa657", "#7ee787", "#c9d1d9", "#8b949e",
  "#388bfd",
];

// github-light 的对应 RGB 值
const LIGHT_TOKEN_COLORS = [
  "#005cc5", "#d73a49", "#032f62", "#6f42c1",
  "#e36209", "#22863a", "#24292e", "#6a737d",
  "#005cc5",
];

function applyCodeTokenColors(isDark: boolean) {
  if (typeof document === "undefined") return;
  const tokens = document.querySelectorAll<HTMLElement>(
    "[data-rehype-pretty-code-figure] [style*='color:'] span"
  );
  const darkColors = isDark ? DARK_TOKEN_COLORS : LIGHT_TOKEN_COLORS;
  tokens.forEach((span) => {
    const style = span.getAttribute("style") ?? "";
    darkColors.forEach((color) => {
      if (style.includes(color)) {
        span.style.color = color;
      }
    });
  });
}

// ============================================================
// 代码块主题同步器（Client Component）
// 监听 html[data-theme] 变化，动态替换 Shiki inline token 颜色
// ============================================================
function CodeThemeSync() {
  useEffect(() => {
    const observer = new MutationObserver(() => {
      const isDark = document.documentElement.dataset.theme === "dark";
      applyCodeTokenColors(isDark);
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme"],
    });

    // 初始化：当前主题色
    const isDark = document.documentElement.dataset.theme === "dark";
    applyCodeTokenColors(isDark);

    return () => observer.disconnect();
  }, []);

  return null;
}

// ============================================================
// 复制按钮
// ============================================================
function CopyButton({ code }: { code: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // ignore
    }
  }, [code]);

  return (
    <button
      type="button"
      onClick={handleCopy}
      className="codeblock__copy"
      aria-label={copied ? "已复制" : "复制代码"}
      title={copied ? "已复制" : "复制代码"}
    >
      {copied ? (
        <Check className="h-3.5 w-3.5" strokeWidth={2.25} />
      ) : (
        <Copy className="h-3.5 w-3.5" strokeWidth={1.75} />
      )}
    </button>
  );
}

// ============================================================
// PDF 嵌入
// ============================================================
function PDFEmbed({ href }: { href: string }) {
  return (
    <figure className="group relative my-8 overflow-hidden rounded-xl border border-border/50 shadow-sm transition-shadow hover:shadow-md">
      <iframe
        src={href}
        className="h-[600px] w-full"
        title="PDF 文档预览"
        allow="fullscreen"
      />
      <figcaption className="flex items-center justify-between border-t border-border/50 bg-muted/50 px-4 py-2.5 text-xs text-muted-foreground backdrop-blur-sm">
        <span>PDF 文档预览</span>
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 font-medium text-primary/70 transition-colors hover:text-primary"
        >
          在新窗口打开
        </a>
      </figcaption>
    </figure>
  );
}

// ============================================================
// 图片
// ============================================================
function CustomImage(props: ComponentProps<"img">) {
  const { src, alt } = props;
  if (!src) return null;
  return (
    <span className="my-8 block group">
      <span className="block relative overflow-hidden rounded-xl border border-border/50 shadow-sm transition-all duration-300 group-hover:shadow-md">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={src}
          alt={alt ?? ""}
          className="block w-full object-cover transition-transform duration-500 group-hover:scale-[1.02]"
          loading="lazy"
        />
      </span>
      {alt && (
        <span className="mt-2 block text-center text-xs text-muted-foreground/70">
          {alt}
        </span>
      )}
    </span>
  );
}

export { CopyButton, PDFEmbed, CustomImage, CodeThemeSync };
