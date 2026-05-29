"use client";

// ============================================================
// Markdown 渲染器的交互组件（Client Component）
// 这些组件需要浏览器 API（clipboard 等），必须在客户端运行
// ============================================================

import { useState, useCallback } from "react";
import type { ComponentProps } from "react";
import { Check, Copy } from "lucide-react";

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

export { CopyButton, PDFEmbed, CustomImage };
