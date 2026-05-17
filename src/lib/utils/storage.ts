// ============================================================
// Supabase Storage 辅助函数
// ============================================================

/**
 * 从 Supabase Storage 公开 URL 中提取文件路径（桶名之后的部分）
 * URL 格式：https://xxx.supabase.co/storage/v1/object/public/{bucket}/{path}
 * 返回 null 表示无法识别该 URL 格式
 */
export function extractStoragePath(url: string, bucket: string): string | null {
  if (!url) return null;
  const marker = `/storage/v1/object/public/${bucket}/`;
  const idx = url.indexOf(marker);
  if (idx === -1) return null;
  return decodeURIComponent(url.slice(idx + marker.length));
}

/**
 * 从 Markdown 正文中提取所有指向指定 Storage 桶的图片文件路径
 */
export function extractImagePathsFromMarkdown(markdown: string, bucket: string): string[] {
  if (!markdown) return [];
  const paths = new Set<string>();
  // 匹配 ![...](url) 和 <img src="url"> 中的 Supabase Storage URL
  const regex = new RegExp(`/storage/v1/object/public/${bucket}/([^)\\s"'\\)\\]]+)`, "g");
  let match: RegExpExecArray | null;
  while ((match = regex.exec(markdown)) !== null) {
    paths.add(decodeURIComponent(match[1]));
  }
  return Array.from(paths);
}
