"use client";

// ============================================================
// 新建文章 — 第一步：基本信息设置
//   填写标题、封面、摘要后创建草稿，自动跳转到编辑器
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
import { ArrowRight, Loader2 } from "lucide-react";

export function NewPostForm() {
  const router = useRouter();
  const supabase = createClient();

  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [coverImage, setCoverImage] = useState("");
  const [creating, setCreating] = useState(false);
  const autoSlug = useRef(true);

  const handleTitleChange = (v: string) => {
    setTitle(v);
    if (autoSlug.current) setSlug(generateSlug(v));
  };

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

  return (
    <motion.form
      onSubmit={handleSubmit}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-xl rounded-2xl border border-border bg-card p-6 sm:p-8"
    >
      <div className="flex flex-col gap-5">
        {/* 标题 */}
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

        {/* slug */}
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

        {/* 封面 */}
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

        {/* 摘要 */}
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

        {/* 提交按钮 */}
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
    </motion.form>
  );
}
