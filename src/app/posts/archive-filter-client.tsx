"use client";

// ============================================================
// 文章搜索过滤 — Client Component
//   状态提升：searchQuery 在此管理，向下分发给 SearchBar
//   和 ArchiveMain（过滤后） / ArchiveSidebar（全量统计）
//   防抖 300ms 减少频繁重渲染
// ============================================================

import { useState, useMemo } from "react";
import { useDebounce } from "@/hooks/use-debounce";
import { SearchBar } from "@/components/posts/search-bar";
import { ArchiveMain } from "./archive-main";
import { ArchiveSidebar } from "./archive-sidebar";
import type { Post } from "@/types/post";

interface ArchiveFilterClientProps {
  posts: Post[];
}

/** 模糊搜索：忽略大小写匹配标题和摘要 */
function filterPosts(posts: Post[], query: string): Post[] {
  if (!query.trim()) return posts;
  const lower = query.toLowerCase();
  return posts.filter((post) => {
    const title = post.title.toLowerCase();
    const excerpt = (post.excerpt ?? "").toLowerCase();
    return title.includes(lower) || excerpt.includes(lower);
  });
}

export function ArchiveFilterClient({ posts: allPosts }: ArchiveFilterClientProps) {
  const [query, setQuery] = useState("");
  const debouncedQuery = useDebounce(query, 300);

  const filteredPosts = useMemo(
    () => filterPosts(allPosts, debouncedQuery),
    [allPosts, debouncedQuery],
  );

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_280px]">
      {/* 左侧：文章列表（过滤后） */}
      <ArchiveMain
        posts={filteredPosts}
        emptyMessage={
          debouncedQuery
            ? `未找到与「${debouncedQuery}」相关的文章`
            : undefined
        }
      />

      {/* 右侧：搜索框 + 侧边栏 */}
      <aside className="flex flex-col gap-4 lg:sticky lg:top-20 lg:h-fit">
        <SearchBar value={query} onChange={setQuery} />
        <ArchiveSidebar posts={allPosts} />
      </aside>
    </div>
  );
}
