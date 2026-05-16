"use client";

import { useEffect, useRef, useCallback, useState } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import CodeBlockLowlight from "@tiptap/extension-code-block-lowlight";
import { InlineMath, BlockMath } from "@tiptap/extension-mathematics";
import { mergeAttributes, InputRule } from "@tiptap/core";
import { common, createLowlight } from "lowlight";
import katex from "katex";
import "katex/dist/katex.min.css";
import {
  Bold,
  Italic,
  Strikethrough,
  Code,
  List,
  ListOrdered,
  Quote,
  Heading1,
  Heading2,
  Heading3,
  Undo,
  Redo,
  Minus,
  Table,
  Image,
  Link,
  FileText,
  Upload,
  Check,
  ChevronDown,
  Languages,
  Hash,
  Sigma,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { marked } from "marked";
import TurndownService from "turndown";

const lowlight = createLowlight(common);

const turndown = new TurndownService({ headingStyle: "atx" });

turndown.addRule("fencedCodeBlock", {
  filter: (node) => {
    return (
      node.nodeName === "PRE" &&
      node.firstChild?.nodeName === "CODE"
    );
  },
  replacement: (content, node) => {
    const codeEl = node.firstChild as HTMLElement | null;
    const langClass = codeEl?.getAttribute("class") || "";
    const langMatch = langClass.match(/language-(\S+)/);
    const lang = langMatch ? langMatch[1] : "";

    const code = codeEl?.textContent || content;

    return `\n\n\`\`\`${lang}\n${code}\n\`\`\`\n\n`;
  },
});

turndown.addRule("inlineMath", {
  filter: (node) => {
    return (
      node.nodeName === "SPAN" &&
      (node as HTMLElement).getAttribute("data-type") === "inline-math"
    );
  },
  replacement: (_content, node) => {
    const latex = (node as HTMLElement).getAttribute("data-latex") || "";
    return `$${latex}$`;
  },
});

turndown.addRule("blockMath", {
  filter: (node) => {
    return (
      node.nodeName === "DIV" &&
      (node as HTMLElement).getAttribute("data-type") === "block-math"
    );
  },
  replacement: (_content, node) => {
    const latex = (node as HTMLElement).getAttribute("data-latex") || "";
    return `\n\n$$${latex}$$\n\n`;
  },
});

// ============================================================
// 自定义数学公式节点视图（NodeView）
// 实现 Typora 风格编辑/预览切换：点击预览 → 编辑源码 → Enter/失焦 → 渲染
// ============================================================

const CustomInlineMath = InlineMath.extend({
  renderHTML({ HTMLAttributes }) {
    const latex = (HTMLAttributes as Record<string, string>)["data-latex"] || "";
    return ["span", mergeAttributes(HTMLAttributes, { "data-type": "inline-math" }), latex];
  },

  // 标准 $...$ 输入规则，替代上游的 $$...$$ 规则
  addInputRules() {
    return [
      new InputRule({
        find: /(?<!\$)(?<!\\)\$(?=[^$\s\\])([^$\n]+?)\$(?!\d|\$)/,
        handler: ({ state, range, match }) => {
          const latex = match[1];
          const { tr } = state;
          tr.replaceWith(range.from, range.to, this.type.create({ latex }));
        },
      }),
    ];
  },

  addNodeView() {
    const editor = this.editor;
    const { katexOptions } = this.options;

    return ({ node, getPos }) => {
      const wrapper = document.createElement("span");
      wrapper.className = "tiptap-mathematics-render";
      if (editor.isEditable) {
        wrapper.classList.add("tiptap-mathematics-render--editable");
      }
      wrapper.dataset.type = "inline-math";
      wrapper.setAttribute("data-latex", node.attrs.latex);

      const previewEl = document.createElement("span");
      previewEl.className = "math-preview";
      wrapper.appendChild(previewEl);

      const inputEl = document.createElement("input");
      inputEl.type = "text";
      inputEl.className = "math-edit-input";
      inputEl.style.display = "none";
      wrapper.appendChild(inputEl);

      let isEditing = false;
      let currentLatex: string = node.attrs.latex;

      const renderPreview = () => {
        try {
          katex.render(currentLatex, previewEl, {
            ...katexOptions,
            displayMode: false,
            throwOnError: false,
          });
          wrapper.classList.remove("inline-math-error");
        } catch {
          previewEl.textContent = currentLatex;
          wrapper.classList.add("inline-math-error");
        }
      };

      const enterEditMode = () => {
        if (isEditing) return;
        isEditing = true;
        inputEl.value = currentLatex;
        previewEl.style.display = "none";
        inputEl.style.display = "";
        inputEl.focus();
        inputEl.select();
      };

      const exitEditMode = () => {
        if (!isEditing) return;
        isEditing = false;
        const newLatex = inputEl.value.trim();
        inputEl.style.display = "none";
        previewEl.style.display = "";

        if (newLatex && newLatex !== currentLatex) {
          const pos = getPos();
          if (pos != null) {
            const { inlineMath: nodeType } = editor.state.schema.nodes;
            const tr = editor.state.tr;
            tr.replaceWith(pos, pos + node.nodeSize, nodeType.create({ latex: newLatex }));
            editor.view.dispatch(tr);
          }
        }
      };

      wrapper.addEventListener("mousedown", (e) => {
        if (!isEditing) {
          e.preventDefault();
          e.stopPropagation();
          enterEditMode();
        }
      });

      inputEl.addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
          e.preventDefault();
          exitEditMode();
        } else if (e.key === "Escape") {
          e.preventDefault();
          isEditing = false;
          inputEl.style.display = "none";
          previewEl.style.display = "";
        }
      });

      inputEl.addEventListener("blur", () => {
        exitEditMode();
      });

      renderPreview();

      return {
        dom: wrapper,
        update: (updatedNode) => {
          if (updatedNode.attrs.latex !== currentLatex) {
            currentLatex = updatedNode.attrs.latex;
            wrapper.setAttribute("data-latex", currentLatex);
            if (!isEditing) {
              renderPreview();
            }
          }
          return true;
        },
        stopEvent: (e) => {
          return isEditing && (e.target === inputEl || inputEl.contains(e.target as Node));
        },
        ignoreMutation: (mutation) => {
          return isEditing && (mutation.target === inputEl || inputEl.contains(mutation.target as Node));
        },
        destroy() {},
      };
    };
  },
});

const CustomBlockMath = BlockMath.extend({
  renderHTML({ HTMLAttributes }) {
    const latex = (HTMLAttributes as Record<string, string>)["data-latex"] || "";
    return ["div", mergeAttributes(HTMLAttributes, { "data-type": "block-math" }), latex];
  },

  // 标准 $$...$$ 输入规则，替代上游的 $$$...$$$ 规则
  addInputRules() {
    return [
      new InputRule({
        find: /\$\$([^$]+)\$\$/,
        handler: ({ state, range, match }) => {
          const latex = match[1];
          const { tr } = state;
          const node = this.type.create({ latex });
          tr.replaceWith(range.from, range.to, node);
        },
      }),
    ];
  },

  addNodeView() {
    const editor = this.editor;
    const { katexOptions } = this.options;

    return ({ node, getPos }) => {
      const wrapper = document.createElement("div");
      wrapper.className = "tiptap-mathematics-render";
      if (editor.isEditable) {
        wrapper.classList.add("tiptap-mathematics-render--editable");
      }
      wrapper.dataset.type = "block-math";
      wrapper.setAttribute("data-latex", node.attrs.latex);

      const previewEl = document.createElement("div");
      previewEl.className = "math-preview";
      wrapper.appendChild(previewEl);

      const textareaEl = document.createElement("textarea");
      textareaEl.className = "math-edit-textarea";
      textareaEl.rows = 3;
      textareaEl.style.display = "none";
      wrapper.appendChild(textareaEl);

      let isEditing = false;
      let currentLatex: string = node.attrs.latex;

      const renderPreview = () => {
        try {
          katex.render(currentLatex, previewEl, {
            ...katexOptions,
            displayMode: true,
            throwOnError: false,
          });
          wrapper.classList.remove("block-math-error");
        } catch {
          previewEl.textContent = currentLatex;
          wrapper.classList.add("block-math-error");
        }
      };

      const enterEditMode = () => {
        if (isEditing) return;
        isEditing = true;
        textareaEl.value = currentLatex;
        previewEl.style.display = "none";
        textareaEl.style.display = "";
        textareaEl.focus();
        textareaEl.select();
      };

      const exitEditMode = () => {
        if (!isEditing) return;
        isEditing = false;
        const newLatex = textareaEl.value.trim();
        textareaEl.style.display = "none";
        previewEl.style.display = "";

        if (newLatex && newLatex !== currentLatex) {
          const pos = getPos();
          if (pos != null) {
            const { blockMath: nodeType } = editor.state.schema.nodes;
            const tr = editor.state.tr;
            tr.replaceWith(pos, pos + node.nodeSize, nodeType.create({ latex: newLatex }));
            editor.view.dispatch(tr);
          }
        }
      };

      wrapper.addEventListener("mousedown", (e) => {
        if (!isEditing) {
          e.preventDefault();
          e.stopPropagation();
          enterEditMode();
        }
      });

      textareaEl.addEventListener("keydown", (e) => {
        if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
          e.preventDefault();
          exitEditMode();
        }
      });

      textareaEl.addEventListener("blur", () => {
        exitEditMode();
      });

      renderPreview();

      return {
        dom: wrapper,
        update: (updatedNode) => {
          if (updatedNode.attrs.latex !== currentLatex) {
            currentLatex = updatedNode.attrs.latex;
            wrapper.setAttribute("data-latex", currentLatex);
            if (!isEditing) {
              renderPreview();
            }
          }
          return true;
        },
        stopEvent: (e) => {
          return isEditing && (e.target === textareaEl || textareaEl.contains(e.target as Node));
        },
        ignoreMutation: (mutation) => {
          return isEditing && (mutation.target === textareaEl || textareaEl.contains(mutation.target as Node));
        },
        destroy() {},
      };
    };
  },
});

/**
 * 修复 Turndown 对 LaTeX 反斜杠的双重转义：
 * Turndown 会将 \f、\n 等转成 \\f、\\n（markdown 转义），
 * 导致 KaTeX 收到 \\frac 而非 \frac，反斜杠被“吞噬”。
 *
 * 仅在 $...$ 和 $$...$$ 区域内进行归一化，不影响代码块。
 */
function normalizeLatexInMarkdown(md: string): string {
  const codeBlocks: string[] = [];
  let result = md.replace(/(```[\s\S]*?```|`[^`\n]+`)/g, (match) => {
    codeBlocks.push(match);
    return `\x00CODE${codeBlocks.length - 1}\x00`;
  });

  result = result.replace(
    /\$\$([^$]+)\$\$/g,
    (_: string, latex: string) => `$$${normalizeLatex(latex)}$$`,
  );
  result = result.replace(
    /\$([^$\n]+)\$/g,
    (_: string, latex: string) => `$${normalizeLatex(latex)}$`,
  );

  result = result.replace(
    /\x00CODE(\d+)\x00/g,
    (_, i: string) => codeBlocks[Number(i)],
  );

  return result;
}

function normalizeLatex(latex: string): string {
  return (
    latex
      .replace(/\\\\([a-zA-Z]+)/g, "\\$1")
      .replace(/\\([_])/g, "$1")
  );
}

const LANG_LABELS: Record<string, string> = {
  plaintext: "纯文本",
  javascript: "JavaScript",
  typescript: "TypeScript",
  python: "Python",
  java: "Java",
  cpp: "C++",
  c: "C",
  csharp: "C#",
  go: "Go",
  rust: "Rust",
  ruby: "Ruby",
  php: "PHP",
  swift: "Swift",
  kotlin: "Kotlin",
  sql: "SQL",
  html: "HTML",
  css: "CSS",
  scss: "SCSS",
  json: "JSON",
  yaml: "YAML",
  xml: "XML",
  markdown: "Markdown",
  bash: "Bash",
  shell: "Shell",
  powershell: "PowerShell",
  dockerfile: "Dockerfile",
  graphql: "GraphQL",
  latex: "LaTeX",
  diff: "Diff",
  apache: "Apache",
  nginx: "Nginx",
};

const LANG_OPTIONS = Object.keys(LANG_LABELS).map((k) => ({
  value: k,
  label: LANG_LABELS[k] ?? k,
}));

const SUPPORTED_LANGS = new Set(LANG_OPTIONS.map((o) => o.value));

/**
 * 将 Markdown 中的 $...$ / $$...$$ 数学公式预转换为
 * TipTap Mathematics 扩展能够识别的 HTML 元素（parseHTML）
 * 保留代码块中的 $ 符号不受影响
 */
function preprocessMathInMarkdown(md: string): string {
  const codeBlocks: string[] = [];
  let result = md.replace(/(```[\s\S]*?```|`[^`\n]+`)/g, (match) => {
    codeBlocks.push(match);
    return `\x00CODE${codeBlocks.length - 1}\x00`;
  });

  result = result.replace(
    /\$\$([^$]+)\$\$/g,
    (_, latex: string) =>
      `<div data-type="block-math" data-latex="${normalizeLatex(latex.trim())}"></div>`,
  );
  result = result.replace(
    /\$([^$\n]+)\$/g,
    (_, latex: string) =>
      `<span data-type="inline-math" data-latex="${normalizeLatex(latex.trim())}"></span>`,
  );

  result = result.replace(
    /\x00CODE(\d+)\x00/g,
    (_, i: string) => codeBlocks[Number(i)],
  );

  return result;
}

interface MarkdownEditorProps {
  content: string;
  onChange: (markdown: string) => void;
}

export function MarkdownEditor({ content, onChange }: MarkdownEditorProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const tableDialogRef = useRef<HTMLDivElement>(null);
  const editorWrapRef = useRef<HTMLDivElement>(null);
  const internalChangeRef = useRef(false);
  const [showTableDialog, setShowTableDialog] = useState(false);
  const [tableRows, setTableRows] = useState(3);
  const [tableCols, setTableCols] = useState(3);
  const [langDropdownOpen, setLangDropdownOpen] = useState(false);
  const langDropdownRef = useRef<HTMLDivElement>(null);
  const langDropdownBtnRef = useRef<HTMLButtonElement>(null);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3, 4, 5, 6] },
        code: false,
      }),
      Placeholder.configure({
        placeholder: "开始撰写内容... 支持 LaTeX 公式（$inline$ 和 $$block$$）",
      }),
      CodeBlockLowlight.configure({
        lowlight,
        defaultLanguage: "plaintext",
        HTMLAttributes: {
          class: "code-block",
        },
      }),
      CustomInlineMath.configure({
        katexOptions: {
          displayMode: false,
          throwOnError: false,
          strict: false,
        },
      }),
      CustomBlockMath.configure({
        katexOptions: {
          displayMode: true,
          throwOnError: false,
          strict: false,
        },
      }),
    ],
    editorProps: {
      attributes: {
        class:
          "tiptap max-w-none min-h-[520px] px-6 py-4 focus:outline-none text-foreground",
      },
    },
    onUpdate: ({ editor }) => {
      internalChangeRef.current = true;
      const html = editor.getHTML();
      let md = turndown.turndown(html);
      md = normalizeLatexInMarkdown(md);
      onChange(md);
    },
  });

  useEffect(() => {
    if (!editor) return;
    if (internalChangeRef.current) {
      internalChangeRef.current = false;
      return;
    }
    const currentMd = turndown.turndown(editor.getHTML());
    if (content !== currentMd) {
      try {
        const preprocessed = preprocessMathInMarkdown(content);
        const html = marked.parse(preprocessed, { async: false }) as string;
        editor.commands.setContent(html, { emitUpdate: false });
      } catch {
        editor.commands.setContent(`<p>${content}</p>`, { emitUpdate: false });
      }
    }
  }, [content, editor]);

  useEffect(() => {
    if (!editor) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (!editor) return;
      if (e.ctrlKey || e.metaKey) {
        if (e.shiftKey) return;

        switch (e.key) {
          case "1":
          case "2":
          case "3":
          case "4":
          case "5":
          case "6":
            e.preventDefault();
            editor
              .chain()
              .focus()
              .toggleHeading({ level: parseInt(e.key) as 1 | 2 | 3 | 4 | 5 | 6 })
              .run();
            break;
          case "7":
            e.preventDefault();
            editor.chain().focus().setParagraph().run();
            toast.info("已切换为正文（Ctrl+7 取消标题格式）");
            break;
          case "k":
            e.preventDefault();
            editor.chain().focus().toggleCodeBlock().run();
            break;
          case "b":
            e.preventDefault();
            editor.chain().focus().toggleBold().run();
            break;
          case "i":
            e.preventDefault();
            editor.chain().focus().toggleItalic().run();
            break;
          case "z":
            e.preventDefault();
            editor.chain().focus().undo().run();
            break;
          case "y":
            e.preventDefault();
            editor.chain().focus().redo().run();
            break;
        }
      }
    };

    const editorElement = editor.view.dom;
    editorElement.addEventListener("keydown", handleKeyDown);
    return () => editorElement.removeEventListener("keydown", handleKeyDown);
  }, [editor]);

  // ============================================================
  // 粘贴处理器：图片上传 + 数学公式标准化
  // ============================================================
  useEffect(() => {
    if (!editor) return;

    const supabase = createClient();

    const handlePaste = async (e: ClipboardEvent) => {
      if (!editor) return;

      const html = e.clipboardData?.getData("text/html") || "";
      const plain = e.clipboardData?.getData("text/plain") || "";
      const items = e.clipboardData?.items;

      // 检查是否包含本地图片（HTML 中的 <img> 或 Markdown 中的 ![...](...)）
      const hasLocalImages =
        (html && /<img[^>]+src="(?!https?:\/\/|data:)[^"]+"/i.test(html)) ||
        (plain && /!\[.*?\]\((?!https?:\/\/|data:)[^)]+\)/.test(plain));

      // 检查是否需要预处理数学公式
      const hasMathFormulas = /\$(?=[^$\s\\])[^$\n]+?\$(?!\d|\$)/.test(plain);

      if (!hasLocalImages && !hasMathFormulas) return; // 无需处理，走默认粘贴

      e.preventDefault();
      e.stopPropagation();

      let processedHtml = html;
      let processedPlain = plain;

      // ---- 图片处理：上传到 Supabase Storage ----
      if (hasLocalImages && items && items.length > 0) {
        const imageItems: { blob: Blob; ext: string }[] = [];
        for (let i = 0; i < items.length; i++) {
          const item = items[i];
          if (item.type.startsWith("image/")) {
            const ext = item.type.split("/")[1] || "png";
            const blob = item.getAsFile();
            if (blob) imageItems.push({ blob, ext });
          }
        }

        if (imageItems.length > 0) {
          const uploadedUrls: string[] = [];

          for (const { blob, ext } of imageItems) {
            try {
              const fileName = `paste-${Date.now()}-${Math.random().toString(36).slice(2, 10)}.${ext}`;
              const { data, error } = await supabase.storage
                .from("article-images")
                .upload(fileName, blob, {
                  contentType: `image/${ext}`,
                  upsert: true,
                });

              if (error) throw error;

              const publicUrl = supabase.storage
                .from("article-images")
                .getPublicUrl(data.path).data.publicUrl;

              uploadedUrls.push(publicUrl);
            } catch {
              // 上传失败时降级为 Base64
              const reader = new FileReader();
              const base64 = await new Promise<string>((resolve) => {
                reader.onload = () => resolve(reader.result as string);
                reader.readAsDataURL(blob);
              });
              uploadedUrls.push(base64);
            }
          }

          // 替换 HTML 中本地 src
          let imgIndex = 0;
          processedHtml = processedHtml.replace(
            /<img[^>]*src="(?!https?:\/\/|data:)([^"]*)"[^>]*>/gi,
            (fullMatch) => {
              const url = uploadedUrls[imgIndex] || uploadedUrls[uploadedUrls.length - 1];
              imgIndex++;
              return fullMatch.replace(
                /src="(?!https?:\/\/|data:)[^"]*"/i,
                `src="${url}"`,
              );
            },
          );

          // 替换纯文本中 Markdown 图片语法本地路径
          let mdImgIndex = 0;
          processedPlain = processedPlain.replace(
            /!\[([^\]]*)\]\((?!https?:\/\/|data:)([^)]+)\)/g,
            (fullMatch, alt) => {
              const url = uploadedUrls[mdImgIndex] || uploadedUrls[uploadedUrls.length - 1];
              mdImgIndex++;
              return `![${alt}](${url})`;
            },
          );
        }
      }

      // ---- 数学公式处理：将 $...$ / $$...$$ 转为 math 节点 HTML ----
      if (hasMathFormulas) {
        processedPlain = preprocessMathInMarkdown(processedPlain);
      }

      // ---- 插入处理后的内容 ----
      if (processedHtml) {
        // 先解析 HTML（可能已含数学节点 HTML），再插入
        const md = turndown.turndown(processedHtml);
        const rePreprocessed = preprocessMathInMarkdown(md);
        const finalHtml = marked.parse(rePreprocessed, { async: false }) as string;
        editor.commands.insertContent(finalHtml);
      } else if (processedPlain) {
        const finalHtml = marked.parse(processedPlain, { async: false }) as string;
        editor.commands.insertContent(finalHtml);
      }
    };

    const dom = editor.view.dom;
    dom.addEventListener("paste", handlePaste);
    return () => dom.removeEventListener("paste", handlePaste);
  }, [editor]);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (
        langDropdownRef.current &&
        !langDropdownRef.current.contains(e.target as Node) &&
        !langDropdownBtnRef.current?.contains(e.target as Node)
      ) {
        setLangDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (
        tableDialogRef.current &&
        !tableDialogRef.current.contains(e.target as Node)
      ) {
        setShowTableDialog(false);
      }
    };
    if (showTableDialog) {
      document.addEventListener("mousedown", handleClick);
    }
    return () => document.removeEventListener("mousedown", handleClick);
  }, [showTableDialog]);

  const insertTable = useCallback(() => {
    if (!editor) return;
    const rows = Math.max(1, Math.min(10, tableRows));
    const cols = Math.max(1, Math.min(10, tableCols));

    let tableMd = "|";
    for (let i = 0; i < cols; i++) {
      tableMd += " 表头 " + (i < cols - 1 ? " | " : " |\n");
    }
    tableMd += "|";
    for (let i = 0; i < cols; i++) {
      tableMd += " --- " + (i < cols - 1 ? " | " : " |\n");
    }
    for (let r = 1; r < rows; r++) {
      tableMd += "|";
      for (let c = 0; c < cols; c++) {
        tableMd += ` 单元格${r}-${c + 1} ` + (c < cols - 1 ? " | " : " |\n");
      }
    }

    const html = `<p>${tableMd}</p>`;
    editor.chain().focus().insertContent(html).run();
    setShowTableDialog(false);
    toast.success("表格已插入");
  }, [editor, tableRows, tableCols]);

  const handleMdFileUpload = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      if (!file.name.endsWith(".md")) {
        toast.error("请上传 .md 文件");
        return;
      }

      const reader = new FileReader();
      reader.onload = (event) => {
        const mdContent = event.target?.result as string;
        if (editor) {
          editor.commands.setContent("");
          const preprocessed = preprocessMathInMarkdown(mdContent);
          const html = marked.parse(preprocessed, { async: false }) as string;
          editor.commands.setContent(html);
          toast.success(`已导入：${file.name}`);
        } else {
          onChange(mdContent);
          toast.success(`已导入：${file.name}`);
        }
      };
      reader.onerror = () => toast.error("文件读取失败");
      reader.readAsText(file);

      e.target.value = "";
    },
    [editor, onChange]
  );

  const handleImageUpload = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (event) => {
        const base64 = event.target?.result as string;
        if (editor) {
          editor
            .chain()
            .focus()
            .insertContent(`![${file.name}](${base64})`)
            .run();
          toast.success("图片已插入");
        }
      };
      reader.onerror = () => toast.error("图片读取失败");
      reader.readAsDataURL(file);

      e.target.value = "";
    },
    [editor]
  );

  const applyLanguageToBlock = useCallback(
    (lang: string) => {
      if (!editor) return;
      if (editor.isActive("codeBlock")) {
        editor.chain().focus().updateAttributes("codeBlock", { language: lang }).run();
      } else {
        editor.chain().focus().toggleCodeBlock({ language: lang }).run();
      }
      setLangDropdownOpen(false);
    },
    [editor]
  );

  const currentLang = editor?.getAttributes("codeBlock").language as string | undefined;

  const ToolbarButton = ({
    onClick,
    active = false,
    children,
    title,
  }: {
    onClick: () => void;
    active?: boolean;
    children: React.ReactNode;
    title: string;
  }) => (
    <button
      type="button"
      onClick={onClick}
      title={title}
      className={cn(
        "rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground",
        active && "bg-[#425AEF]/10 text-[#425AEF]",
      )}
    >
      {children}
    </button>
  );

  if (!editor) {
    return (
      <div className="flex h-[560px] items-center justify-center rounded-2xl border border-border bg-card">
        <span className="text-sm text-muted-foreground">加载编辑器...</span>
      </div>
    );
  }

  return (
    <div className="w-full overflow-hidden rounded-2xl border border-border bg-card">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-0.5 border-b border-border px-3 py-2">
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBold().run()}
          active={editor.isActive("bold")}
          title="加粗 (Ctrl+B)"
        >
          <Bold className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleItalic().run()}
          active={editor.isActive("italic")}
          title="斜体 (Ctrl+I)"
        >
          <Italic className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleStrike().run()}
          active={editor.isActive("strike")}
          title="删除线"
        >
          <Strikethrough className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleCode().run()}
          active={editor.isActive("code")}
          title="行内代码 (Ctrl+`)"
        >
          <Code className="h-4 w-4" />
        </ToolbarButton>

        <span className="mx-1 h-5 w-px bg-border" />

        {/* Headings 1-3 */}
        <ToolbarButton
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 1 }).run()
          }
          active={editor.isActive("heading", { level: 1 })}
          title="一级标题 (Ctrl+1)"
        >
          <span className="flex h-4 items-center text-xs font-bold">H1</span>
        </ToolbarButton>
        <ToolbarButton
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 2 }).run()
          }
          active={editor.isActive("heading", { level: 2 })}
          title="二级标题 (Ctrl+2)"
        >
          <span className="flex h-4 items-center text-xs font-bold">H2</span>
        </ToolbarButton>
        <ToolbarButton
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 3 }).run()
          }
          active={editor.isActive("heading", { level: 3 })}
          title="三级标题 (Ctrl+3)"
        >
          <span className="flex h-4 items-center text-xs font-bold">H3</span>
        </ToolbarButton>

        {/* More headings dropdown */}
        <div className="relative">
          <ToolbarButton
            onClick={() => {
              const el = document.getElementById("h456-menu");
              if (el) el.classList.toggle("hidden");
            }}
            active={editor.isActive("heading", { level: 4 }) || editor.isActive("heading", { level: 5 }) || editor.isActive("heading", { level: 6 })}
            title="更多标题"
          >
            <ChevronDown className="h-4 w-4" />
          </ToolbarButton>
          <div
            id="h456-menu"
            className="absolute left-0 top-full z-50 mt-1 hidden rounded-lg border border-border bg-popover p-1 shadow-lg"
          >
            {[4, 5, 6].map((level) => (
              <button
                key={level}
                onClick={() => {
                  editor.chain().focus().toggleHeading({ level: level as 4 | 5 | 6 }).run();
                  document.getElementById("h456-menu")?.classList.add("hidden");
                }}
                className={cn(
                  "flex w-full items-center gap-2 rounded-md px-3 py-1.5 text-sm hover:bg-accent",
                  editor.isActive("heading", { level }) && "bg-[#425AEF]/10 text-[#425AEF]",
                )}
              >
                <span className="flex h-4 items-center text-xs font-bold">H{level}</span>
                <span className="text-muted-foreground">
                  {level === 4 ? "四级标题" : level === 5 ? "五级标题" : "六级标题"}
                </span>
              </button>
            ))}
          </div>
        </div>

        <span className="mx-1 h-5 w-px bg-border" />

        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          active={editor.isActive("bulletList")}
          title="无序列表"
        >
          <List className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          active={editor.isActive("orderedList")}
          title="有序列表"
        >
          <ListOrdered className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          active={editor.isActive("blockquote")}
          title="引用"
        >
          <Quote className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().setHorizontalRule().run()}
          title="分割线"
        >
          <Minus className="h-4 w-4" />
        </ToolbarButton>

        <span className="mx-1 h-5 w-px bg-border" />

        {/* Code block with language selector */}
        <div className="relative flex items-center gap-0.5">
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleCodeBlock().run()}
            active={editor.isActive("codeBlock")}
            title="代码块 (Ctrl+K)"
          >
            <FileText className="h-4 w-4" />
          </ToolbarButton>

          <div className="relative" ref={langDropdownRef}>
            <button
              ref={langDropdownBtnRef}
              type="button"
              onClick={() => setLangDropdownOpen(!langDropdownOpen)}
              title="选择代码语言"
              className={cn(
                "flex h-7 items-center gap-0.5 rounded-md px-1.5 text-xs transition-colors hover:bg-accent",
                editor.isActive("codeBlock")
                  ? "bg-[#425AEF]/10 text-[#425AEF]"
                  : "text-muted-foreground",
              )}
            >
              <Languages className="h-3.5 w-3.5" />
              <span className="max-w-[60px] truncate">
                {currentLang && SUPPORTED_LANGS.has(currentLang)
                  ? LANG_LABELS[currentLang] ?? currentLang
                  : "语言"}
              </span>
              <ChevronDown className="h-3 w-3" />
            </button>

            {langDropdownOpen && (
              <div className="absolute left-0 top-full z-50 mt-1 flex flex-col rounded-lg border border-border bg-popover p-1 shadow-lg"
                style={{ width: "200px", maxHeight: "280px", overflowY: "auto" }}>
                <div className="mb-1 px-2 py-1 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                  选择语言
                </div>
                {LANG_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => applyLanguageToBlock(opt.value)}
                    className={cn(
                      "flex items-center gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-accent",
                      currentLang === opt.value && "bg-[#425AEF]/10 text-[#425AEF]",
                    )}
                  >
                    <Hash className="h-3 w-3 shrink-0 text-muted-foreground" />
                    <span className="truncate">{opt.label}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Table */}
        <div className="relative">
          <ToolbarButton
            onClick={() => setShowTableDialog(!showTableDialog)}
            active={false}
            title="插入表格"
          >
            <Table className="h-4 w-4" />
          </ToolbarButton>

          {showTableDialog && (
            <div
              ref={tableDialogRef}
              className="absolute left-0 top-full z-50 mt-1 rounded-lg border border-border bg-popover p-3 shadow-lg"
            >
              <div className="mb-2 text-xs font-medium text-muted-foreground">插入表格</div>
              <div className="mb-3 flex items-center gap-2">
                <div className="flex flex-col gap-1">
                  <label className="text-xs text-muted-foreground">行数</label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={tableRows}
                    onChange={(e) => setTableRows(parseInt(e.target.value) || 3)}
                    className="h-7 w-16 rounded border border-input bg-background px-2 text-sm"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs text-muted-foreground">列数</label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={tableCols}
                    onChange={(e) => setTableCols(parseInt(e.target.value) || 3)}
                    className="h-7 w-16 rounded border border-input bg-background px-2 text-sm"
                  />
                </div>
              </div>
              <button
                onClick={insertTable}
                className="flex w-full items-center justify-center gap-1 rounded bg-primary px-3 py-1.5 text-xs text-primary-foreground hover:bg-primary/90"
              >
                <Check className="h-3 w-3" />
                插入
              </button>
            </div>
          )}
        </div>

        {/* Image */}
        <ToolbarButton
          onClick={() => imageInputRef.current?.click()}
          active={false}
          title="上传图片"
        >
          <Image className="h-4 w-4" />
        </ToolbarButton>

        <span className="mx-1 h-5 w-px bg-border" />

        {/* Import MD file */}
        <ToolbarButton
          onClick={() => fileInputRef.current?.click()}
          active={false}
          title="导入本地 MD 文件"
        >
          <Upload className="h-4 w-4" />
        </ToolbarButton>

        <span className="mx-1 h-5 w-px bg-border" />

        <ToolbarButton
          onClick={() => editor.chain().focus().undo().run()}
          title="撤销 (Ctrl+Z)"
        >
          <Undo className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().redo().run()}
          title="重做 (Ctrl+Y)"
        >
          <Redo className="h-4 w-4" />
        </ToolbarButton>
      </div>

      {/* Shortcuts hint bar */}
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 border-b border-border bg-muted/30 px-4 py-1.5 text-[11px] text-muted-foreground">
        <span>
          <kbd className="rounded bg-muted px-1 py-0.5 font-mono text-[10px]">Ctrl+1~6</kbd>{" "}
          标题
        </span>
        <span>
          <kbd className="rounded bg-muted px-1 py-0.5 font-mono text-[10px]">Ctrl+K</kbd>{" "}
          代码块
        </span>
        <span>
          <kbd className="rounded bg-muted px-1 py-0.5 font-mono text-[10px]">Ctrl+B/I</kbd>{" "}
          加粗/斜体
        </span>
        <span>
          <kbd className="rounded bg-muted px-1 py-0.5 font-mono text-[10px]">$...$</kbd>{" "}
          行内公式
        </span>
        <span>
          <kbd className="rounded bg-muted px-1 py-0.5 font-mono text-[10px]">$$...$$</kbd>{" "}
          块级公式
        </span>
        <span className="ml-auto">
          <kbd className="rounded bg-muted px-1 py-0.5 font-mono text-[10px]">$E=mc^2$</kbd>{" "}
          输入即渲染
        </span>
      </div>

      {/* Hidden file inputs */}
      <input
        type="file"
        ref={fileInputRef}
        accept=".md,text/markdown"
        onChange={handleMdFileUpload}
        className="hidden"
      />
      <input
        type="file"
        ref={imageInputRef}
        accept="image/*"
        onChange={handleImageUpload}
        className="hidden"
      />

      {/* Editor area */}
      <EditorContent editor={editor} />
    </div>
  );
}
