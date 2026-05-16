"use client";

// ============================================================
// 新建文章 — 选择入口
//   方式一：从空白开始 → 填写基本信息 → 跳转编辑器
//   方式二：上传 MD 文档 → 自动提取标题 → 跳转编辑器
// ============================================================

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { CoverImagePicker } from "@/components/admin/cover-image-picker";
import { toast } from "sonner";
import { generateSlug } from "@/lib/utils/slug";
import {
  ArrowRight,
  Loader2,
  FileText,
  Upload,
  X,
  Check,
  ChevronRight,
} from "lucide-react";

type Step = "choose" | "form" | "upload-preview";

function extractTitleFromMd(md: string): string {
  const lines = md.split("\n");
  for (const line of lines) {
    const trimmed = line.trim();
    const h1Match = trimmed.match(/^#\s+(.+)/);
    if (h1Match) return h1Match[1].trim();
    const h2Match = trimmed.match(/^##\s+(.+)/);
    if (h2Match) return h2Match[1].trim();
  }
  return "";
}

export function NewPostForm() {
  const router = useRouter();
  const supabase = createClient();

  // ---- Step: choose → form | upload-preview ----
  const [step, setStep] = useState<Step>("choose");

  // ---- Form mode state ----
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [coverImage, setCoverImage] = useState("");
  const [creating, setCreating] = useState(false);
  const autoSlug = { current: true };

  // ---- Upload mode state ----
  const [uploading, setUploading] = useState(false);
  const [previewMd, setPreviewMd] = useState("");
  const [previewFileName, setPreviewFileName] = useState("");
  const [previewTitle, setPreviewTitle] = useState("");
  const [previewSlug, setPreviewSlug] = useState("");
  const [previewCover, setPreviewCover] = useState("");
  const [previewExcerpt, setPreviewExcerpt] = useState("");
  const mdFileInputRef = useRef<HTMLInputElement>(null);

  const handleTitleChange = (v: string) => {
    setTitle(v);
    if (autoSlug.current) setSlug(generateSlug(v));
  };

  // ---- Create post from form (write from scratch) ----
  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      toast.error("标题不能为空");
      return;
    }
    if (!slug.trim()) {
      toast.error("Slug 不能为空");
      return;
    }

    setCreating(true);

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("未登录");

      const { data, error } = await supabase
        .from("posts")
        .insert({
          title: title.trim(),
          slug: slug.trim(),
          excerpt: excerpt.trim() || null,
          cover_image: coverImage.trim() || null,
          content: "",
          status: "draft",
          author_id: user.id,
        })
        .select("id")
        .single();

      if (error) throw error;

      toast.success("草稿已创建，进入编辑器");
      router.push(`/admin/posts/${data.id}/edit`);
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "创建失败",
      );
    } finally {
      setCreating(false);
    }
  };

  // ---- Select MD file ----
  const handleMdFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith(".md")) {
      toast.error("请上传 .md 文件");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      setPreviewMd(content);
      setPreviewFileName(file.name.replace(/\.md$/i, ""));

      const extracted = extractTitleFromMd(content);
      if (extracted) {
        setPreviewTitle(extracted);
        setPreviewSlug(generateSlug(extracted));
      } else {
        const name = file.name.replace(/\.md$/i, "");
        setPreviewTitle(name);
        setPreviewSlug(generateSlug(name));
      }
      setStep("upload-preview");
    };
    reader.onerror = () => toast.error("文件读取失败");
    reader.readAsText(file);

    e.target.value = "";
  };

  // ---- Upload preview: edit metadata then create ----
  const handleUploadCreate = async () => {
    if (!previewTitle.trim()) {
      toast.error("标题不能为空");
      return;
    }
    if (!previewSlug.trim()) {
      toast.error("Slug 不能为空");
      return;
    }

    setUploading(true);

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("未登录");

      const { data, error } = await supabase
        .from("posts")
        .insert({
          title: previewTitle.trim(),
          slug: previewSlug.trim(),
          excerpt: previewExcerpt.trim() || null,
          cover_image: previewCover.trim() || null,
          content: previewMd,
          status: "draft",
          author_id: user.id,
        })
        .select("id")
        .single();

      if (error) throw error;

      toast.success("文档已导入，进入编辑器");
      router.push(`/admin/posts/${data.id}/edit`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "导入失败");
    } finally {
      setUploading(false);
    }
  };

  // ---- Step: Choose ----
  if (step === "choose") {
    return (
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="grid gap-4 sm:grid-cols-2"
      >
        {/* Option 1: Write from scratch */}
        <button
          type="button"
          onClick={() => setStep("form")}
          className="group flex flex-col items-start rounded-2xl border border-border bg-card p-6 text-left transition-all hover:border-[#425AEF]/40 hover:shadow-md"
        >
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-[#425AEF]/10 text-[#425AEF]">
            <FileText className="h-6 w-6" />
          </div>
          <h3 className="text-base font-semibold">从空白开始</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            从零撰写文章，自动生成标题、摘要和 Slug
          </p>
          <div className="mt-4 flex items-center gap-1 text-sm font-medium text-[#425AEF]">
            <span>开始撰写</span>
            <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </div>
        </button>

        {/* Option 2: Upload MD */}
        <button
          type="button"
          onClick={() => mdFileInputRef.current?.click()}
          className="group flex flex-col items-start rounded-2xl border border-border bg-card p-6 text-left transition-all hover:border-[#425AEF]/40 hover:shadow-md"
        >
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600">
            <Upload className="h-6 w-6" />
          </div>
          <h3 className="text-base font-semibold">上传 MD 文档</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            直接上传本地写好的 Markdown 文件，自动提取标题并导入正文
          </p>
          <div className="mt-4 flex items-center gap-1 text-sm font-medium text-emerald-600">
            <span>选择文件</span>
            <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </div>
        </button>

        <input
          ref={mdFileInputRef}
          type="file"
          accept=".md,text/markdown"
          onChange={handleMdFileSelect}
          className="hidden"
        />
      </motion.div>
    );
  }

  // ---- Step: Form (write from scratch) ----
  if (step === "form") {
    return (
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
      >
        {/* Back button */}
        <button
          type="button"
          onClick={() => setStep("choose")}
          className="mb-4 flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <X className="h-4 w-4" />
          返回选择
        </button>

        <form
          onSubmit={handleFormSubmit}
          className="max-w-xl rounded-2xl border border-border bg-card p-6 sm:p-8"
        >
          <div className="flex flex-col gap-5">
            {/* Title */}
            <div className="flex flex-col gap-2">
              <Label htmlFor="title">标题 *</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => handleTitleChange(e.target.value)}
                placeholder="输入文章标题"
                className="text-lg font-medium"
                autoFocus
              />
            </div>

            {/* Slug */}
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="slug">Slug *</Label>
                <button
                  type="button"
                  onClick={() => {
                    autoSlug.current = !autoSlug.current;
                    if (autoSlug.current) setSlug(generateSlug(title));
                  }}
                  className="text-[10px] text-muted-foreground hover:text-foreground"
                >
                  {autoSlug.current ? "自动生成" : "手动编辑"}
                </button>
              </div>
              <Input
                id="slug"
                value={slug}
                onChange={(e) => {
                  autoSlug.current = false;
                  setSlug(e.target.value);
                }}
                placeholder="article-slug"
              />
            </div>

            {/* Cover */}
            <div className="flex flex-col gap-2">
              <Label>封面图</Label>
              <CoverImagePicker value={coverImage} onChange={setCoverImage} />
              <Input
                value={coverImage}
                onChange={(e) => setCoverImage(e.target.value)}
                placeholder="或者粘贴图片 URL..."
                className="mt-1"
              />
            </div>

            {/* Excerpt */}
            <div className="flex flex-col gap-2">
              <Label htmlFor="excerpt">摘要</Label>
              <Textarea
                id="excerpt"
                value={excerpt}
                onChange={(e) => setExcerpt(e.target.value)}
                placeholder="简要介绍文章内容..."
                rows={3}
              />
            </div>

            {/* Submit */}
            <Button
              type="submit"
              disabled={creating}
              className="w-full bg-[#425AEF] hover:bg-[#425AEF]/90"
            >
              {creating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  创建中...
                </>
              ) : (
                <>
                  开始撰写正文
                  <ArrowRight className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
          </div>
        </form>
      </motion.div>
    );
  }

  // ---- Step: Upload preview ----
  if (step === "upload-preview") {
    const wordCount = previewMd
      ? previewMd.replace(/[#*`_\[\]()]/g, "").trim().split(/\s+/).length
      : 0;
    const lineCount = previewMd ? previewMd.split("\n").length : 0;

    return (
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="grid gap-4 lg:grid-cols-2"
      >
        {/* Left: Edit metadata */}
        <div className="flex flex-col gap-4">
          {/* Back + title */}
          <div>
            <button
              type="button"
              onClick={() => setStep("choose")}
              className="mb-3 flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              <X className="h-4 w-4" />
              重新选择
            </button>

            <div className="rounded-2xl border border-border bg-card p-6">
              <div className="mb-1 flex items-center gap-2 text-sm font-medium text-emerald-600">
                <Upload className="h-4 w-4" />
                上传 MD 文档
              </div>
              <p className="mb-5 text-sm text-muted-foreground">
                已导入「{previewFileName}.md」，可编辑基本信息后进入编辑器
              </p>

              <div className="flex flex-col gap-4">
                {/* Title */}
                <div className="flex flex-col gap-2">
                  <Label htmlFor="preview-title">标题 *</Label>
                  <Input
                    id="preview-title"
                    value={previewTitle}
                    onChange={(e) => {
                      setPreviewTitle(e.target.value);
                      setPreviewSlug(generateSlug(e.target.value));
                    }}
                    placeholder="文章标题"
                    className="text-lg font-medium"
                  />
                </div>

                {/* Slug */}
                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="preview-slug">Slug *</Label>
                    <button
                      type="button"
                      onClick={() => setPreviewSlug(generateSlug(previewTitle))}
                      className="text-[10px] text-muted-foreground hover:text-foreground"
                    >
                      重新生成
                    </button>
                  </div>
                  <Input
                    id="preview-slug"
                    value={previewSlug}
                    onChange={(e) => setPreviewSlug(e.target.value)}
                    placeholder="article-slug"
                  />
                </div>

                {/* Cover */}
                <div className="flex flex-col gap-2">
                  <Label>封面图</Label>
                  <CoverImagePicker value={previewCover} onChange={setPreviewCover} />
                  <Input
                    value={previewCover}
                    onChange={(e) => setPreviewCover(e.target.value)}
                    placeholder="或者粘贴图片 URL..."
                    className="mt-1"
                  />
                </div>

                {/* Excerpt */}
                <div className="flex flex-col gap-2">
                  <Label htmlFor="preview-excerpt">摘要</Label>
                  <Textarea
                    id="preview-excerpt"
                    value={previewExcerpt}
                    onChange={(e) => setPreviewExcerpt(e.target.value)}
                    placeholder="简要介绍文章内容..."
                    rows={3}
                  />
                </div>

                {/* Create button */}
                <Button
                  onClick={handleUploadCreate}
                  disabled={uploading}
                  className="w-full bg-emerald-600 hover:bg-emerald-600/90"
                >
                  {uploading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      导入中...
                    </>
                  ) : (
                    <>
                      <Check className="mr-2 h-4 w-4" />
                      确认并进入编辑器
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Right: MD content preview */}
        <div className="rounded-2xl border border-border bg-card p-4">
          <div className="mb-3 flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm font-medium">
              <FileText className="h-4 w-4 text-muted-foreground" />
              内容预览
            </div>
            <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
              <span>{lineCount} 行</span>
              <span>约 {wordCount} 字</span>
            </div>
          </div>
          <div className="h-[500px] overflow-y-auto rounded-lg border border-border bg-muted/30 p-4">
            <pre className="whitespace-pre-wrap break-words font-mono text-xs leading-relaxed text-muted-foreground">
              {previewMd}
            </pre>
          </div>
        </div>
      </motion.div>
    );
  }

  return null;
}
