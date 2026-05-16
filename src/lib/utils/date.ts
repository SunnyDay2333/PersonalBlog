// ============================================================
// 日期格式化工具
// 统一使用 date-fns 进行格式化
// ============================================================

import { format, parseISO, formatDistanceToNowStrict } from "date-fns";
import { zhCN } from "date-fns/locale";

/** 文章列表中显示的日期格式 */
export function formatPostDate(dateString: string): string {
  return format(parseISO(dateString), "yyyy 年 MM 月 dd 日");
}

/** 详情页完整日期格式 */
export function formatDetailDate(dateString: string): string {
  return format(parseISO(dateString), "yyyy 年 MM 月 dd 日 HH:mm");
}

/** 相对时间（如 "3 天前"）— 中文 */
export function formatRelativeDate(dateString: string): string {
  return formatDistanceToNowStrict(parseISO(dateString), {
    addSuffix: true,
    locale: zhCN,
  });
}

/** ISO 字符串转 datetime-local input 值（编辑表单用） */
export function toDatetimeLocal(dateString: string): string {
  return format(parseISO(dateString), "yyyy-MM-dd'T'HH:mm");
}
