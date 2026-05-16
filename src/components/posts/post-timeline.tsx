// ============================================================
// 文章时间轴 / 瀑布流组件（C 端）
// 从 Supabase 获取已发布文章列表，以时间轴形式展示
// ============================================================

import { PostCard } from "@/components/posts/post-card";
import { FadeIn } from "@/components/shared/fade-in";
import { EmptyState } from "@/components/shared/empty-state";
import type { Post } from "@/types/post";

/**
 * 服务端数据获取
 * 直接在这里调用 supabase server client 进行 ISR
 */
async function getPublishedPosts(): Promise<Post[]> {
  const { createClient } = await import("@/lib/supabase/server");
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("posts")
    .select("*")
    .eq("status", "published")
    .order("published_at", { ascending: false })
    .limit(20);

  if (error) {
    console.error("获取文章列表失败:", error.message);
    return [];
  }

  return data as Post[];
}

export async function PostTimeline() {
  const posts = await getPublishedPosts();

  // 暂无文章时显示占位
  if (posts.length === 0) {
    return (
      <EmptyState
        title="还没有文章"
        description="博主正在酝酿灵感，敬请期待。"
      />
    );
  }

  return (
    <div className="flex flex-col divide-y divide-border">
      {posts.map((post, index) => (
        <FadeIn key={post.id} delay={index * 0.06}>
          <PostCard post={post} />
        </FadeIn>
      ))}
    </div>
  );
}
