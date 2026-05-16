"use client";

// ============================================================
// 文章数据 Hook
// 封装 SWR 风格的数据获取，用于 C 端页面
// 后续可替换为 SWR / TanStack Query 库
// ============================================================

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Post } from "@/types/post";

interface UsePostsReturn {
  /** 文章列表 */
  posts: Post[];
  /** 是否正在加载 */
  loading: boolean;
  /** 错误信息 */
  error: string | null;
  /** 是否有更多文章可加载 */
  hasMore: boolean;
  /** 加载下一页 */
  loadMore: () => Promise<void>;
  /** 重新加载（从第一页开始） */
  refresh: () => Promise<void>;
}

const PAGE_SIZE = 10;

export function usePosts(): UsePostsReturn {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const supabase = createClient();

  /** 加载文章（追加分页） */
  const fetchPosts = useCallback(
    async (pageNum: number, append: boolean) => {
      setLoading(true);
      setError(null);

      const { data, error: supabaseError } = await supabase
        .from("posts")
        .select("*")
        .eq("status", "published")
        .order("published_at", { ascending: false })
        .range(pageNum * PAGE_SIZE, (pageNum + 1) * PAGE_SIZE - 1);

      if (supabaseError) {
        setError(supabaseError.message);
        setLoading(false);
        return;
      }

      setPosts((prev) =>
        append ? [...prev, ...(data as Post[])] : (data as Post[]),
      );
      setHasMore(data.length === PAGE_SIZE);
      setLoading(false);
    },
    [supabase],
  );

  /** 初始加载 */
  useEffect(() => {
    fetchPosts(0, false);
  }, [fetchPosts]);

  /** 加载下一页 */
  const loadMore = useCallback(async () => {
    const nextPage = page + 1;
    setPage(nextPage);
    await fetchPosts(nextPage, true);
  }, [page, fetchPosts]);

  /** 刷新回首页 */
  const refresh = useCallback(async () => {
    setPage(0);
    await fetchPosts(0, false);
  }, [fetchPosts]);

  return { posts, loading, error, hasMore, loadMore, refresh };
}
