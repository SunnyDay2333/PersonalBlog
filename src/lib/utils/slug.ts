// ============================================================
// Slug 生成工具
// 将中文标题转为拼音首字母缩写 + 随机短码，确保唯一性
// ============================================================

/**
 * 将任意标题转为 URL 友好的 slug
 * 策略：英文直接 slugify；中文生成随机短码兜底
 * 生产环境中建议接入拼音库（如 pinyin-pro），此处先提供简单实现
 */
export function generateSlug(title: string): string {
  // 将标题转为小写，替换非 ASCII 字符
  const normalized = title
    .toLowerCase()
    .trim()
    // 保留中英文、数字、空格，其余去掉
    .replace(/[^\w一-鿿\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");

  // 如果最终得到的是纯英文 slug（至少 3 个字符），直接使用
  if (/^[a-z0-9-]{3,}$/.test(normalized)) {
    return normalized;
  }

  // 中文标题：生成时间戳 + 随机短码组成 slug
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).slice(2, 6);
  return `${timestamp}-${random}`;
}

/**
 * 验证 slug 格式是否合法（仅允许小写字母、数字、连字符）
 */
export function isValidSlug(slug: string): boolean {
  return /^[a-z0-9]+(-[a-z0-9]+)*$/.test(slug);
}
