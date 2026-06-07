"use client";

// ============================================================
// 文章目录（TOC）— 雾化聚焦版
// 设计亮点：
//   · 非当前章节 blur + 低透明度，形成"雾化"效果
//   · 鼠标移入整个 TOC → 全部清晰
//   · 当前章节永远清晰，左侧渐变色指示条
//   · 平滑过渡，不突兀
// ============================================================

import { useEffect, useMemo, useState, useRef } from "react";
import { motion } from "framer-motion";
import { List } from "lucide-react";

interface TocItem {
  level: number;
  text: string;
  id: string;
}

/** slug 生成 —— 与 rehype-slug 对齐 */
function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[\s　]+/g, "-")
    .replace(/[^\p{L}\p{N}一-龥-]/gu, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

/** 从 Markdown 提取 h1~h4 */
function extractToc(markdown: string): TocItem[] {
  const items: TocItem[] = [];
  const lines = markdown.split("\n");
  let inCodeBlock = false;

  for (const line of lines) {
    if (line.trim().startsWith("```")) {
      inCodeBlock = !inCodeBlock;
      continue;
    }
    if (inCodeBlock) continue;

    const match = /^(#{1,4})\s+(.+?)\s*#*\s*$/.exec(line);
    if (match) {
      items.push({
        level: match[1].length,
        text: match[2].replace(/`/g, "").trim(),
        id: slugify(match[2].replace(/`/g, "").trim()),
      });
    }
  }
  return items;
}

interface PostTocProps {
  content: string;
}

export function PostToc({ content }: PostTocProps) {
  const items = useMemo(() => extractToc(content), [content]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [hovered, setHovered] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);

  // 滚动监听：高亮当前章节
  useEffect(() => {
    if (items.length === 0) return;

    const handleScroll = () => {
      const headings = items
        .map((item) => document.getElementById(item.id))
        .filter((el): el is HTMLElement => el !== null);
      if (headings.length === 0) return;

      // 视口顶部往下 120px 作为激活线
      const activationLine = 120;
      let currentId: string | null = null;

      for (const h of headings) {
        const rect = h.getBoundingClientRect();
        if (rect.top <= activationLine) {
          currentId = h.id;
        } else {
          break;
        }
      }

      if (!currentId && window.scrollY > 0) {
        currentId = headings[0].id;
      }
      setActiveId(currentId);
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [items]);

  // TOC 列表自动滚动保持激活项可见
  useEffect(() => {
    if (!activeId || !listRef.current) return;
    const activeEl = listRef.current.querySelector(
      `[data-toc-id="${activeId}"]`,
    );
    if (activeEl) {
      activeEl.scrollIntoView({ block: "nearest", behavior: "smooth" });
    }
  }, [activeId]);

  const handleClick = (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    const el = document.getElementById(id);
    if (el) {
      const top = el.getBoundingClientRect().top + window.scrollY - 80;
      window.scrollTo({ top, behavior: "smooth" });
    }
  };

  if (items.length === 0) return null;

  // 当前激活项的索引
  const activeIdx = items.findIndex((it) => it.id === activeId);

  return (
    <motion.aside
      initial={{ opacity: 0, x: 10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="h-fit"
    >
      {/* 头部 */}
      <div className="mb-4 flex items-center gap-2 px-1">
        <List className="h-3.5 w-3.5 text-[#425AEF]" />
        <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          目录
        </span>
        <span className="ml-auto text-[10px] text-muted-foreground/60">
          {items.length} 节
        </span>
      </div>

      {/* 列表 */}
      <div
        ref={listRef}
        className="relative pr-1"
        style={{ scrollbarWidth: "thin" }}
      >
        <nav className="relative flex flex-col gap-0.5 pl-4">
          {/* 左侧连接线 */}
          <span
            className="absolute left-0 top-1 bottom-1 w-px bg-border"
            aria-hidden
          />

          {items.map((item, idx) => {
            const isActive = activeId === item.id;
            // 与激活项的距离（绝对值）
            const distance =
              activeIdx >= 0 ? Math.abs(idx - activeIdx) : 99;

            // 雾化程度：激活项 → 清晰；距离越远越模糊
            let blurAmount = 0;
            let opacity = 1;

            if (!hovered && activeIdx >= 0) {
              if (distance === 0) {
                blurAmount = 0;
                opacity = 1;
              } else if (distance === 1) {
                blurAmount = 0.3;
                opacity = 0.75;
              } else if (distance === 2) {
                blurAmount = 0.6;
                opacity = 0.55;
              } else {
                blurAmount = 1;
                opacity = 0.35;
              }
            }

            const indent =
              item.level === 1
                ? "pl-0 font-medium"
                : item.level === 2
                  ? "pl-2"
                  : item.level === 3
                    ? "pl-6"
                    : "pl-10";

            return (
              <a
                key={item.id}
                href={`#${item.id}`}
                onClick={(e) => handleClick(e, item.id)}
                data-toc-id={item.id}
                className={`group relative block rounded-md py-1.5 pr-2 text-xs leading-relaxed transition-all duration-300 ease-out ${indent}`}
                style={{
                  filter: `blur(${blurAmount}px)`,
                  opacity,
                }}
              >
                {/* 激活左侧指示条 */}
                {isActive && (
                  <motion.span
                    layoutId="toc-active-indicator"
                    className="absolute -left-[2px] top-1/2 h-4 w-[3px] -translate-y-1/2 rounded-full bg-gradient-to-b from-[#425AEF] to-violet-500"
                    transition={{
                      type: "spring",
                      stiffness: 400,
                      damping: 35,
                    }}
                  />
                )}

                <span
                  className={`block truncate transition-colors ${
                    isActive
                      ? "font-semibold text-foreground"
                      : "text-muted-foreground group-hover:text-foreground"
                  }`}
                >
                  {item.text}
                </span>
              </a>
            );
          })}
        </nav>
      </div>
    </motion.aside>
  );
}
