// ============================================================
// 站点全局常量
// ============================================================

/** 站点名称（回退值，优先从环境变量读取） */
export const SITE_NAME =
  process.env.NEXT_PUBLIC_SITE_NAME || "自然晴";

/** 站点 URL（回退值） */
export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

/** 首页文章每页数量（分页用） */
export const POSTS_PER_PAGE = 10;

/** 管理员路由前缀 — 中间件根据此前缀拦截未登录请求 */
export const ADMIN_ROUTE_PREFIX = "/admin";

/** 管理员登录页路径 */
export const ADMIN_LOGIN_PATH = "/admin/login";
