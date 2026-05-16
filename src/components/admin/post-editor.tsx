"use client";

// ============================================================
// 文章编辑器 — 标签页 + 自动草稿保存
//   Tab 1：基本信息（标题 / 封面 / 摘要 / slug / 状态）
//   Tab 2：正文编辑（分栏 Markdown 编辑器）
//   自动保存：每次修改后 3s 防抖存为草稿
// ============================================================

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { CoverImagePicker } from "@/components/admin/cover-image-picker";
import { MarkdownEditor } from "@/components/admin/markdown-editor";
import { toast } from "sonner";
import { generateSlug } from "@/lib/utils/slug";
import {
  Settings,
  FileText,
  Save,
  Send,
  Check,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { Post, PostStatus } from "@/types/post";

// ============================================================
// Tab 定义
// ============================================================
const TABS = [
  { key: "meta", icon: Settings, label: "基本信息" },
  { key: "content", icon: FileText, label: "正文编辑" },
] as const;

type TabKey = (typeof TABS)[number]["key"];

interface PostEditorProps {
  post: Post;
}

export function PostEditor({ post }: PostEditorProps) {
  const router = useRouter();
  const supabase = createClient();

  // ---- 表单状态 ----
  const [title, setTitle] = useState(post.title);
  const [slug, setSlug] = useState(post.slug);
  const [excerpt, setExcerpt] = useState(post.excerpt ?? "");
  const [coverImage, setCoverImage] = useState(post.cover_image ?? "");
  const [content, setContent] = useState(post.content);
  const [status, setStatus] = useState<PostStatus>(post.status);
  const [activeTab, setActiveTab] = useState<TabKey>("content");

  // ---- 保存状态 ----
  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [dirty, setDirty] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const autoSlug = useRef(true);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  // 标记有未保存修改
  const markDirty = useCallback(() => setDirty(true), []);

  // 自动保存草稿（3s 防抖）
  const autoSave = useCallback(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      const { error } = await supabase
        .from("posts")
        .update({
          title: title.trim(),
          slug: slug.trim(),
          excerpt: excerpt.trim() || null,
          cover_image: coverImage.trim() || null,
          content,
          status,
          updated_at: new Date().toISOString(),
        })
        .eq("id", post.id);

      if (!error) {
        setLastSaved(new Date());
        setDirty(false);
      }
    }, 3000);
  }, [title, slug, excerpt, coverImage, content, status, post.id, supabase]);

  // 内容变化时触发自动保存
  useEffect(() => {
    if (!title.trim()) return;
    markDirty();
    autoSave();
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [title, slug, excerpt, coverImage, content, status, autoSave, markDirty]);

  // 手动保存（立即）
  const handleManualSave = async () => {
    setSaving(true);
    const { error } = await supabase
      .from("posts")
      .update({
        title: title.trim(),
        slug: slug.trim(),
        excerpt: excerpt.trim() || null,
        cover_image: coverImage.trim() || null,
        content,
        status,
        updated_at: new Date().toISOString(),
      })
      .eq("id", post.id);

    setSaving(false);
    if (error) {
      toast.error("保存失败: " + error.message);
    } else {
      setLastSaved(new Date());
      setDirty(false);
      toast.success("已保存");
    }
  };

  // 发布 / 更新
  const handlePublish = async () => {
    if (!title.trim()) {
      toast.error("标题不能为空");
      setActiveTab("meta");
      return;
    }

    setPublishing(true);
    const now = new Date().toISOString();

    const { error } = await supabase
      .from("posts")
      .update({
        title: title.trim(),
        slug: slug.trim(),
        excerpt: excerpt.trim() || null,
        cover_image: coverImage.trim() || null,
        content,
        status: "published" as PostStatus,
        updated_at: now,
        published_at: post.status !== "published" ? now : post.published_at,
      })
      .eq("id", post.id);

    setPublishing(false);

    if (error) {
      toast.error("发布失败: " + error.message);
    } else {
      setStatus("published");
      setDirty(false);
      toast.success("已发布！");
      router.push("/admin/posts");
      router.refresh();
    }
  };

  // 删除
  const handleDelete = async () => {
    const { error } = await supabase.from("posts").delete().eq("id", post.id);
    if (error) {
      toast.error("删除失败: " + error.message);
      return;
    }
    toast.success("已删除");
    router.push("/admin/posts");
    router.refresh();
  };

  const handleTitleChange = (v: string) => {
    setTitle(v);
    if (autoSlug.current) setSlug(generateSlug(v));
  };

  return (
    <div className="flex flex-col gap-4">
      {/* ============================================================ */}
      {/* 顶部：标签页导航 + 操作按钮 */}
      {/* ============================================================ */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1 rounded-xl border border-border bg-card p-1">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={cn(
                "inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-all",
                activeTab === tab.key
                  ? "bg-[#425AEF] text-white shadow-sm"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              <tab.icon className="h-4 w-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* 右侧：保存状态 + 操作 */}
        <div className="flex items-center gap-3">
          {/* 保存状态指示 */}
          <span className="text-[10px] text-muted-foreground">
            {dirty ? (
              <span className="inline-flex items-center gap-1 text-amber-500">
                <span className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-pulse" />
                未保存
              </span>
            ) : lastSaved ? (
              <span className="inline-flex items-center gap-1 text-emerald-500">
                <Check className="h-3 w-3" />
                已保存 {lastSaved.toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit" })}
              </span>
            ) : null}
          </span>

          <Button
            variant="outline"
            size="sm"
            onClick={handleManualSave}
            disabled={saving}
          >
            {saving ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Save className="h-3.5 w-3.5" />
            )}
            <span className="ml-1.5 hidden sm:inline">保存</span>
          </Button>

          <Button
            size="sm"
            onClick={handlePublish}
            disabled={publishing}
            className="bg-[#425AEF] hover:bg-[#425AEF]/90"
          >
            {publishing ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Send className="h-3.5 w-3.5" />
            )}
            <span className="ml-1.5 hidden sm:inline">
              {status === "published" ? "更新" : "发布"}
            </span>
          </Button>
        </div>
      </div>

      {/* ============================================================ */}
      {/* Tab 1：基本信息 */}
      {/* ============================================================ */}
      {activeTab === "meta" && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl border border-border bg-card p-6 sm:p-8"
        >
          <div className="flex flex-col gap-5">
            {/* 标题 */}
            <div className="flex flex-col gap-2">
              <Label htmlFor="title">标题</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => handleTitleChange(e.target.value)}
                placeholder="文章标题"
                className="text-lg font-medium"
              />
            </div>

            {/* slug */}
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="slug">Slug</Label>
                <button
                  onClick={() => {
                    autoSlug.current = !autoSlug.current;
                    if (autoSlug.current) setSlug(generateSlug(title));
                  }}
                  className="text-[10px] text-muted-foreground hover:text-foreground"
                >
                  {autoSlug.current ? "自动生成中" : "手动编辑"}
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

            {/* 封面 */}
            <div className="flex flex-col gap-2">
              <Label>封面图</Label>
              <CoverImagePicker value={coverImage} onChange={setCoverImage} />
              <Input
                value={coverImage}
                onChange={(e) => setCoverImage(e.target.value)}
                placeholder="或直接粘贴图片 URL..."
                className="mt-1"
              />
            </div>

            {/* 摘要 */}
            <div className="flex flex-col gap-2">
              <Label htmlFor="excerpt">摘要</Label>
              <Textarea
                id="excerpt"
                value={excerpt}
                onChange={(e) => setExcerpt(e.target.value)}
                placeholder="简要描述..."
                rows={2}
              />
            </div>

            {/* 状态 */}
            <div className="flex flex-col gap-2">
              <Label>状态</Label>
              <Select
                value={status}
                onValueChange={(v) => setStatus(v as PostStatus)}
              >
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">草稿</SelectItem>
                  <SelectItem value="published">已发布</SelectItem>
                  <SelectItem value="archived">已归档</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* 删除按钮 */}
            <div className="border-t border-border pt-4">
              <Button
                variant="destructive"
                size="sm"
                onClick={() => setShowDeleteDialog(true)}
              >
                删除文章
              </Button>
            </div>
          </div>
        </motion.div>
      )}

      {/* ============================================================ */}
      {/* Tab 2：正文编辑 */}
      {/* ============================================================ */}
      {activeTab === "content" && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-1"
        >
          <MarkdownEditor content={content} onChange={setContent} />
        </motion.div>
      )}

      {/* ============================================================ */}
      {/* 删除确认弹窗 */}
      {/* ============================================================ */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogTitle>确认删除</DialogTitle>
          <DialogDescription>
            删除后无法恢复，确定要删除「{title}」吗？
          </DialogDescription>
          <div className="flex justify-end gap-3 mt-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowDeleteDialog(false)}
            >
              取消
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={handleDelete}
            >
              确认删除
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
