// ============================================================
// 文章列表页（C 端）
// 设计参考 anzhiyu 旧博客 archives：
//   - 主列表按年份分组，大序号装饰
//   - 侧栏：Banner + 月度归档 + 统计信息
// ============================================================

import type { Metadata } from "next";
import { PublicHeader } from "@/components/layout/public-header";
import { PublicFooter } from "@/components/layout/public-footer";
import { ArchiveMain } from "./archive-main";
import { ArchiveSidebar } from "./archive-sidebar";
import { EmptyState } from "@/components/shared/empty-state";
import { SITE_NAME } from "@/lib/constants";
import type { Post } from "@/types/post";

export const metadata: Metadata = {
  title: `文章 | ${SITE_NAME}`,
  description: "全部已发布文章归档",
};

export const revalidate = 60;

async function getPublishedPosts(): Promise<Post[]> {
  const { createClient } = await import("@/lib/supabase/server");
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("posts")
    .select("*")
    .eq("status", "published")
    .order("published_at", { ascending: false });

  if (error) {
    console.error("获取文章列表失败:", error.message);
    return [];
  }

  return data as Post[];
}

export default async function PostsPage() {
  const posts = await getPublishedPosts();

  return (
    <>
      <PublicHeader />

      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-10 sm:px-6 sm:py-14">
        {posts.length === 0 ? (
          <EmptyState
            title="还没有文章"
            description="博主正在酝酿灵感，敬请期待。"
          />
        ) : (
          <div className="grid gap-6 lg:grid-cols-[1fr_280px]">
            <ArchiveMain posts={posts} />
            <ArchiveSidebar posts={posts} />
          </div>
        )}
      </main>

      <PublicFooter />
    </>
  );
}
