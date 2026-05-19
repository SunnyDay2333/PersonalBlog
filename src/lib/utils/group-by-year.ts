// ============================================================
// 将数据按年份分组，保持插入顺序
// ============================================================

/** 按 created_at 字段的年份分组，保留插入顺序 */
export function groupByYear<T extends { created_at: string }>(
  items: T[],
): { year: number; items: T[] }[] {
  const groups: { year: number; items: T[] }[] = [];
  for (const item of items) {
    const year = new Date(item.created_at).getFullYear();
    const last = groups[groups.length - 1];
    if (last && last.year === year) {
      last.items.push(item);
    } else {
      groups.push({ year, items: [item] });
    }
  }
  return groups;
}
