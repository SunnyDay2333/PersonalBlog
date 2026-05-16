// ============================================================
// 编辑文章页 — 标签页版本
// ============================================================

import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { AuthGuard } from "@/components/admin/auth-guard";
import { PostEditor } from "@/components/admin/post-editor";
import type { Post } from "@/types/post";

export const metadata: Metadata = {
  title: "编辑文章",
};

async function getPost(id: string): Promise<Post | null> {
  const { createAdminClient } = await import("@/lib/supabase/admin");
  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from("posts")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !data) return null;
  return data as Post;
}

export default async function EditPostPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const post = await getPost(id);

  if (!post) notFound();

  return (
    <AuthGuard>
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">编辑文章</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          修改内容后自动保存草稿
        </p>
        <div className="mt-6">
          <PostEditor post={post} />
        </div>
      </div>
    </AuthGuard>
  );
}
