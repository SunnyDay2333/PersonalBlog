// 登录页不使用 admin 布局（无侧边栏、无顶栏）
import type { ReactNode } from "react";

export default function LoginLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
