"use client";

// ============================================================
// 文章发布/编辑表单组件
// 用于新建和编辑文章的共用表单
// 支持标题、摘要、Markdown 正文、状态、slug 配置
// 支持富文本编辑、代码高亮、LaTeX 公式、上传 MD 文件
// ============================================================

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { generateSlug } from "@/lib/utils/slug";
import { CoverImagePicker } from "@/components/admin/cover-image-picker";
import { MarkdownEditor } from "@/components/admin/markdown-editor";
import type { Post, PostStatus } from "@/types/post";

interface PostFormProps {
  /** 编辑模式时传入已有文章数据 */
  post?: Post;
}

export function PostForm({ post }: PostFormProps) {
  const router = useRouter();
  const supabase = createClient();
  const isEdit = !!post;

  // ---- 表单状态 ----
  const [title, setTitle] = useState(post?.title ?? "");
  const [slug, setSlug] = useState(post?.slug ?? "");
  const [excerpt, setExcerpt] = useState(post?.excerpt ?? "");
  const [coverImage, setCoverImage] = useState(post?.cover_image ?? "");
  const [content, setContent] = useState(post?.content ?? "");
  const [status, setStatus] = useState<PostStatus>(post?.status ?? "draft");
  const [saving, setSaving] = useState(false);

  /** 从标题自动生成 slug（仅在用户未手动修改 slug 时） */
  const [autoSlug, setAutoSlug] = useState(!isEdit);

  useEffect(() => {
    if (autoSlug) {
      setSlug(generateSlug(title));
    }
  }, [title, autoSlug]);

  /** 提交表单 */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      toast.error("标题不能为空");
      return;
    }
    if (!slug.trim()) {
      toast.error("Slug 不能为空");
      return;
    }

    setSaving(true);

    try {
      if (isEdit) {
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

        if (error) throw error;
        toast.success("文章已更新");
      } else {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) throw new Error("未登录");

        const { error } = await supabase.from("posts").insert({
          title: title.trim(),
          slug: slug.trim(),
          excerpt: excerpt.trim() || null,
          cover_image: coverImage.trim() || null,
          content,
          status,
          author_id: user.id,
        });

        if (error) throw error;
        toast.success("文章已创建");
      }

      router.push("/admin/posts");
      router.refresh();
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "保存失败，请稍后重试",
      );
    } finally {
      setSaving(false);
    }
  };

  /** 删除文章 */
  const handleDelete = async () => {
    if (!isEdit) return;
    if (!confirm("确定要删除这篇文章吗？此操作不可撤销。")) return;

    try {
      const { error } = await supabase
        .from("posts")
        .delete()
        .eq("id", post.id);

      if (error) throw error;
      toast.success("文章已删除");
      router.push("/admin/posts");
      router.refresh();
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "删除失败，请稍后重试",
      );
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      {/* ---- 基础信息卡片 ---- */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            {isEdit ? "编辑文章" : "新建文章"}
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          {/* 标题 */}
          <div className="flex flex-col gap-2">
            <Label htmlFor="title">标题</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="输入文章标题..."
              required
            />
          </div>

          {/* Slug */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="slug">URL Slug</Label>
              <button
                type="button"
                className="text-xs text-muted-foreground hover:text-foreground"
                onClick={() => {
                  setAutoSlug(!autoSlug);
                  if (!autoSlug) setSlug(generateSlug(title));
                }}
              >
                {autoSlug ? "手动编辑" : "自动生成"}
              </button>
            </div>
            <Input
              id="slug"
              value={slug}
              onChange={(e) => {
                setSlug(e.target.value);
                setAutoSlug(false);
              }}
              placeholder="article-slug"
              required
            />
          </div>

          {/* 封面图 */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <Label>封面图（可选）</Label>
              <span className="text-[10px] text-muted-foreground">
                上传本地图片或粘贴 URL
              </span>
            </div>
            <CoverImagePicker
              value={coverImage}
              onChange={setCoverImage}
            />
            {/* 手动输入 URL 兜底 */}
            <Input
              value={coverImage}
              onChange={(e) => setCoverImage(e.target.value)}
              placeholder="或直接粘贴图片 URL..."
              className="mt-1"
            />
          </div>

          {/* 摘要 */}
          <div className="flex flex-col gap-2">
            <Label htmlFor="excerpt">摘要（可选）</Label>
            <Textarea
              id="excerpt"
              value={excerpt}
              onChange={(e) => setExcerpt(e.target.value)}
              placeholder="简要描述文章内容..."
              rows={2}
            />
          </div>

          {/* 状态 */}
          <div className="flex flex-col gap-2">
            <Label>发布状态</Label>
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
        </CardContent>
      </Card>

      {/* ---- Markdown 正文卡片 ---- */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">正文（Markdown）</CardTitle>
        </CardHeader>
        <CardContent>
          <MarkdownEditor
            content={content}
            onChange={setContent}
          />
        </CardContent>
      </Card>

      {/* ---- 操作按钮 ---- */}
      <div className="flex items-center gap-3">
        <Button type="submit" disabled={saving}>
          {saving ? "保存中..." : isEdit ? "更新文章" : "发布文章"}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
        >
          取消
        </Button>
        {isEdit && (
          <Button
            type="button"
            variant="destructive"
            className="ml-auto"
            onClick={handleDelete}
          >
            删除文章
          </Button>
        )}
      </div>
    </form>
  );
}
