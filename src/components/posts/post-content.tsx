// ============================================================
// Markdown 文章渲染器（Server Component）
// 支持：GFM 表格/任务列表、LaTeX 公式（KaTeX 预渲染）、中文标题锚点、
//       PDF 嵌入、Shiki 语法高亮（rehype-pretty-code）
//
// 架构说明：
//   · LaTeX 公式在传入 Markdown 解析器前通过 KaTeX 直接预渲染为 HTML
//   · 避免 remark-math 管道中反斜杠被 markdown 解析器二次处理的问题
//   · rehype-pretty-code / Shiki 在服务端完成语法高亮
// ============================================================

import { Children, isValidElement } from "react";
import { MarkdownAsync } from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeSlug from "rehype-slug";
import rehypeRaw from "rehype-raw";
import rehypePrettyCode from "rehype-pretty-code";
import katex from "katex";
import type { ComponentProps, ReactNode } from "react";
import { PDFEmbed, CustomImage, CopyButton, CodeThemeSync } from "./post-content-client";

// ============================================================
// Shiki 配置
// 使用单主题，亮/暗模式样式通过 CSS 变量切换
// ============================================================
const prettyCodeOptions = {
  theme: "github-light",
  keepBackground: false,
  defaultLang: "plaintext",
};

// ============================================================
// 工具函数
// ============================================================

/** 标准化从数据库取出的 LaTeX：反转 markdown 编辑器的二次转义 */
function normalizeLatex(latex: string): string {
  return (
    latex
      // \\ + 字母 → \ + 字母（修复 \frac, \begin, \int, \cdots 等命令）
      .replace(/\\\\([a-zA-Z]+)/g, "\\$1")
      // \_ → _（修复下标 a\_{11} → a_{11}）
      .replace(/\\([_])/g, "$1")
  );
}

/** 用 KaTeX 预渲染 Markdown 中的数学公式，替换为 HTML */
function renderLatexInMarkdown(markdown: string): string {
  // 保护代码块，避免处理其中的 $ 符号
  const codeBlocks: string[] = [];
  let protected_ = markdown.replace(
    /(```[\s\S]*?```|`[^`\n]+`)/g,
    (match) => {
      codeBlocks.push(match);
      return `%%CODEBLOCK_${codeBlocks.length - 1}%%`;
    },
  );

  // 1. 渲染 $$...$$ 块级公式
  protected_ = protected_.replace(
    /\$\$([\s\S]*?)\$\$/g,
    (_: string, latex: string) => {
      try {
        const normalized = normalizeLatex(latex.trim());
        const html = katex.renderToString(normalized, {
          displayMode: true,
          throwOnError: false,
          strict: false,
        });
        return `<div class="katex-display-wrapper">${html}</div>`;
      } catch {
        return `<pre class="katex-error-fallback">${latex}</pre>`;
      }
    },
  );

  // 2. 渲染 $...$ 行内公式
  protected_ = protected_.replace(
    /(?<!\$)\$(?!\$)([^$\n]+?)\$(?!\$)/g,
    (_: string, latex: string) => {
      try {
        const normalized = normalizeLatex(latex.trim());
        const html = katex.renderToString(normalized, {
          displayMode: false,
          throwOnError: false,
          strict: false,
        });
        return `<span class="katex-inline-wrapper">${html}</span>`;
      } catch {
        return `<code class="katex-error-fallback">${latex}</code>`;
      }
    },
  );

  // 3. 还原代码块
  protected_ = protected_.replace(
    /%%CODEBLOCK_(\d+)%%/g,
    (_, i: string) => codeBlocks[Number(i)],
  );

  return protected_;
}

function containsPDFLink(children: ReactNode): boolean {
  return Children.toArray(children).some((child) => {
    if (isValidElement(child)) {
      const props = child.props as Record<string, unknown> | undefined;
      const href = props?.href;
      if (typeof href === "string") {
        return href.endsWith(".pdf") || href.includes(".pdf?");
      }
      if (props?.children) {
        return containsPDFLink(props.children as ReactNode);
      }
    }
    return false;
  });
}

function extractCode(children: ReactNode): string {
  return Children.toArray(children)
    .map((child) => {
      if (typeof child === "string") return child;
      if (isValidElement(child)) {
        return extractCode(
          (child.props as { children?: ReactNode }).children,
        );
      }
      return "";
    })
    .join("");
}

/** 统计 rehype-pretty-code 输出树中 [data-line] 节点的数量 */
function countDataLines(children: ReactNode): number {
  let n = 0;
  Children.forEach(children, (child) => {
    if (!isValidElement(child)) return;
    const props = child.props as Record<string, unknown> | undefined;
    if (props && "data-line" in props) {
      n += 1;
    }
    if (props?.children) {
      n += countDataLines(props.children as ReactNode);
    }
  });
  return n;
}

// ============================================================
// 自定义组件
// ============================================================

function CustomAnchor(props: ComponentProps<"a">) {
  const { href, children } = props;
  if (!href) return <span {...props}>{children}</span>;

  if (href.endsWith(".pdf") || href.includes(".pdf?")) {
    return <PDFEmbed href={href} />;
  }

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="font-medium text-primary underline underline-offset-4 decoration-primary/30 decoration-dashed transition-all hover:decoration-solid"
    >
      {children}
    </a>
  );
}

function CustomCodeBlock(props: ComponentProps<"pre">) {
  const { children, ...rest } = props;
  const code = extractCode(children);
  const lang =
    ((rest as Record<string, unknown>)["data-language"] as string) ||
    "plaintext";

  // 行数：优先用 rehype-pretty-code 拆出的 [data-line] 节点数；
  // 兜底用换行计数（plaintext / 未被 Shiki 处理的情况）
  const dataLines = countDataLines(children);
  const lineCount =
    dataLines > 0
      ? dataLines
      : Math.max(1, code.replace(/\n$/, "").split("\n").length);

  return (
    <figure className="codeblock group/code" data-lang={lang}>
      {/* ① Mac 风格顶部栏 */}
      <header className="codeblock__bar">
        <div className="codeblock__traffic" aria-hidden="true">
          <span className="codeblock__dot codeblock__dot--red" />
          <span className="codeblock__dot codeblock__dot--yellow" />
          <span className="codeblock__dot codeblock__dot--green" />
        </div>
        <span className="codeblock__lang">{lang}</span>
        <CopyButton code={code} />
      </header>

      {/* ② Body：双栏 flex */}
      <div className="codeblock__body">
        <div className="codeblock__gutter" aria-hidden="true">
          {Array.from({ length: lineCount }, (_, i) => (
            <span key={i} className="codeblock__lineno">
              {i + 1}
            </span>
          ))}
        </div>
        <div className="codeblock__code-col">
          <pre {...rest}>{children}</pre>
        </div>
      </div>
    </figure>
  );
}

function CustomTableHead(props: ComponentProps<"thead">) {
  const { children } = props;
  return <thead className="bg-muted/50">{children}</thead>;
}

function CustomTh(props: ComponentProps<"th">) {
  const { children } = props;
  return (
    <th className="whitespace-nowrap border-b border-border/50 px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
      {children}
    </th>
  );
}

function CustomTd(props: ComponentProps<"td">) {
  const { children } = props;
  return (
    <td className="border-b border-border/30 px-4 py-3 text-sm">
      {children}
    </td>
  );
}

function CustomTable(props: ComponentProps<"table">) {
  const { children } = props;
  return (
    <div className="my-6 overflow-x-auto rounded-xl border border-border/50 shadow-sm">
      <table className="w-full border-collapse">{children}</table>
    </div>
  );
}

function CustomBlockquote(props: ComponentProps<"blockquote">) {
  const { children } = props;
  return (
    <blockquote className="relative my-6 border-l-0 bg-gradient-to-r from-primary/5 via-primary/10 to-transparent py-4 pl-6 pr-4 italic text-muted-foreground/90">
      <svg
        className="absolute left-2 top-3 h-5 w-5 text-primary/30"
        fill="currentColor"
        viewBox="0 0 24 24"
      >
        <path d="M6 17h3l2-4V7H5v6h3l-2 4zm8 0h3l2-4V7h-6v6h3l-2 4z" />
      </svg>
      {children}
    </blockquote>
  );
}

function CustomHr(props: ComponentProps<"hr">) {
  return (
    <hr
      {...props}
      className="my-10 border-0 text-center before:inline-block before:h-px before:w-full before:bg-gradient-to-r before:from-transparent before:via-border/50 before:to-transparent before:align-middle"
    />
  );
}

// ============================================================
// 主组件（Server Component）
// ============================================================
interface PostContentProps {
  content: string;
}

export function PostContent({ content }: PostContentProps) {
  const processed = renderLatexInMarkdown(content);

  return (
    <div className="prose-custom">
      <CodeThemeSync />
      <MarkdownAsync
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[
          rehypeSlug,
          rehypeRaw,
          [rehypePrettyCode, prettyCodeOptions],
        ]}
        components={{
          p({ children, ...props }) {
            if (containsPDFLink(children)) {
              return <>{children}</>;
            }
            return <p {...props}>{children}</p>;
          },

          a: CustomAnchor,
          img: CustomImage,
          pre: CustomCodeBlock,

          li({ children, ...props }) {
            const arr = Children.toArray(children);
            const hasCheck = arr.some(
              (c) =>
                isValidElement(c) &&
                (((c.props as { type?: string })?.type === "checkbox" ||
                  (
                    (c.props as { className?: string })?.className ?? ""
                  ).includes("task-list-item"))),
            );
            if (hasCheck) {
              return (
                <li {...props} className="list-none">
                  {children}
                </li>
              );
            }
            return <li {...props}>{children}</li>;
          },

          table: CustomTable,
          thead: CustomTableHead,
          th: CustomTh,
          td: CustomTd,
          blockquote: CustomBlockquote,
          hr: CustomHr,

          h1(props) {
            const { children, id } = props;
            return (
              <h1 id={id} className="group relative scroll-mt-24">
                <a
                  href={`#${id}`}
                  className="absolute -left-5 top-1/2 hidden -translate-y-1/2 text-primary/30 opacity-0 transition-opacity hover:text-primary group-hover:opacity-100 lg:block"
                  aria-hidden="true"
                >
                  #
                </a>
                {children}
              </h1>
            );
          },
          h2(props) {
            const { children, id } = props;
            return (
              <h2 id={id} className="group relative scroll-mt-24">
                <a
                  href={`#${id}`}
                  className="absolute -left-5 top-1/2 hidden -translate-y-1/2 text-primary/30 opacity-0 transition-opacity hover:text-primary group-hover:opacity-100 lg:block"
                  aria-hidden="true"
                >
                  #
                </a>
                {children}
              </h2>
            );
          },
          h3(props) {
            const { children, id } = props;
            return (
              <h3 id={id} className="group relative scroll-mt-24">
                <a
                  href={`#${id}`}
                  className="absolute -left-5 top-1/2 hidden -translate-y-1/2 text-primary/30 opacity-0 transition-opacity hover:text-primary group-hover:opacity-100 lg:block"
                  aria-hidden="true"
                >
                  #
                </a>
                {children}
              </h3>
            );
          },
        }}
      >
        {processed}
      </MarkdownAsync>
    </div>
  );
}
