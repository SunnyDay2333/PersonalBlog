"use client";

// ============================================================
// 认证状态 Hook
// 获取当前登录用户信息，监听 auth state 变化
// ============================================================

import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import type { User } from "@supabase/supabase-js";

interface UseAuthReturn {
  /** Supabase Auth 用户对象 */
  user: User | null;
  /** 是否正在加载认证状态 */
  loading: boolean;
  /** 刷新用户数据 */
  refresh: () => Promise<void>;
}

export function useAuth(): UseAuthReturn {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  /** 获取当前用户 */
  const refresh = useCallback(async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    setUser(user ?? null);
    setLoading(false);
  }, [supabase]);

  useEffect(() => {
    // 首次挂载获取用户
    refresh();

    // 监听 auth 状态变化（登录 / 登出 / token 刷新）
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [supabase, refresh]);

  return { user, loading, refresh };
}
