"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { MessageCircle, ExternalLink, SparklesIcon } from "lucide-react";
import "@waline/client/style";

interface WalineCommentProps {
  path: string;
  compact?: boolean;
}

type Status = "loading" | "unconfigured" | "ready" | "error";

// ============================================================
// 随机昵称生成 — 形容词 + 名词，有逻辑的中文组合
// ============================================================
const ADJECTIVES = [
  "温柔", "勇敢", "安静", "自由", "热情", "快乐", "神秘", "优雅",
  "天真", "淡然", "浪漫", "潇洒", "腼腆", "率真", "从容", "清澈",
  "慵懒", "烂漫", "纯粹", "轻盈", "踏实", "青涩", "孤傲", "温润",
  "不羁", "好奇", "俏皮", "沉稳", "慢热", "耿直", "佛系", "社恐",
];

const NOUNS = [
  "白菜", "熊猫", "小猫", "月光", "微风", "星辰", "云朵", "大海",
  "森林", "奶茶", "芥末", "土豆", "番茄", "橙子", "樱桃", "薄荷",
  "银杏", "梧桐", "茉莉", "铃兰", "纸鸢", "鲸鱼", "海豚", "刺猬",
  "考拉", "柴犬", "布偶", "秋葵", "核桃", "栗子", "青柠", "柚子",
  "路人", "过客", "旅人", "看客", "书虫", "画师", "琴键", "音符",
];

function generateNickname(): string {
  const adj = ADJECTIVES[Math.floor(Math.random() * ADJECTIVES.length)];
  const noun = NOUNS[Math.floor(Math.random() * NOUNS.length)];
  return `${adj}的${noun}`;
}

/** 填充 Waline 昵称输入框 */
function fillNickname(nick: string) {
  // Waline 昵称输入框的 id 固定为 #wl-nick
  const input = document.getElementById("wl-nick") as HTMLInputElement | null;
  if (input) {
    // 手动设置 value 并触发 React 合成事件，确保 Waline 内部状态同步
    const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
      window.HTMLInputElement.prototype,
      "value",
    )?.set;
    nativeInputValueSetter?.call(input, nick);
    input.dispatchEvent(new Event("input", { bubbles: true }));
    input.dispatchEvent(new Event("change", { bubbles: true }));
    input.focus();
  }
}

// ============================================================
// 主组件
// ============================================================
export function WalineComment({ path, compact = false }: WalineCommentProps) {
  const walineContainerRef = useRef<HTMLDivElement>(null);
  const walineInstanceRef = useRef<{ destroy: () => void } | null>(null);
  const mountedRef = useRef(true);
  const [status, setStatus] = useState<Status>("loading");
  const [randomNick, setRandomNick] = useState("");

  // 生成随机昵称供按钮显示
  useEffect(() => {
    setRandomNick(generateNickname());
  }, []);

  const handleAnonymous = useCallback(() => {
    const nick = generateNickname();
    setRandomNick(nick);
    fillNickname(nick);
  }, []);

  useEffect(() => {
    mountedRef.current = true;

    const serverURL = process.env.NEXT_PUBLIC_WALINE_SERVER_URL;

    if (!serverURL || serverURL === "https://your-waline-server.vercel.app") {
      setStatus("unconfigured");
      return;
    }

    if (walineInstanceRef.current) return;

    const fullURL = serverURL.startsWith("http") ? serverURL : `https://${serverURL}`;
    let cancelled = false;

    const init = async () => {
      try {
        const { init: walineInit } = await import("@waline/client/full");

        if (cancelled || !mountedRef.current || !walineContainerRef.current) return;

        walineInstanceRef.current = walineInit({
          el: walineContainerRef.current,
          serverURL: fullURL,
          path,
          lang: "zh-CN",
          dark: "html[data-theme='dark']",
          emoji: [
            "https://unpkg.com/@waline/emojis@1.1.0/bilibili",
            "https://unpkg.com/@waline/emojis@1.1.0/tieba",
            "https://unpkg.com/@waline/emojis@1.1.0/qq",
            "https://unpkg.com/@waline/emojis@1.1.0/weibo",
            "https://unpkg.com/@waline/emojis@1.1.0/alus",
          ],
          requiredMeta: ["nick"],
          wordLimit: [1, 2000],
          pageSize: 10,
        });

        if (mountedRef.current) {
          setStatus("ready");
          requestAnimationFrame(() => {
            const counter = walineContainerRef.current?.querySelector(
              ".wl-count",
            ) as HTMLElement | null;
            if (counter) {
              counter.style.display = "inline-block";
              counter.style.maxWidth = "6ch";
              counter.style.overflow = "hidden";
              counter.style.whiteSpace = "nowrap";
              counter.style.verticalAlign = "middle";
            }
          });
        }
      } catch (err) {
        if (
          err instanceof Error &&
          (err.name === "AbortError" || err.name === "NotFoundError")
        )
          return;
        console.error("[Waline] Init failed:", err);
        if (mountedRef.current) setStatus("error");
      }
    };

    init();

    return () => {
      mountedRef.current = false;
      cancelled = true;
      try {
        walineInstanceRef.current?.destroy();
      } catch {
        // destroy() 的 AbortError / NotFoundError 忽略
      }
      walineInstanceRef.current = null;
    };
  }, [path]);

  // ---- 状态提示（compact 与 full 共用） ----
  const statusUI = (
    <>
      {status === "loading" && (
        <div className="animate-pulse rounded-xl border border-border bg-card p-4 text-center">
          <div className="h-4 w-24 mx-auto rounded bg-muted" />
        </div>
      )}

      {status === "unconfigured" && (
        <div className="rounded-xl border border-border bg-card p-4 text-center text-xs text-muted-foreground">
          评论系统待配置
        </div>
      )}

      {status === "error" && (
        <div className="rounded-xl border border-red-500/30 bg-red-500/5 p-4 text-center text-xs text-red-500">
          评论加载失败
        </div>
      )}
    </>
  );

  if (compact) {
    return (
      <div>
        {statusUI}
        <div ref={walineContainerRef} />
      </div>
    );
  }

  return (
    <section className="mt-12 border-t border-border pt-8">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <MessageCircle className="h-6 w-6 text-[#425AEF]" />
          <h2 className="text-2xl font-bold text-foreground">评论</h2>
        </div>

        {/* 匿名评论按钮 — 仅在 Waline 就绪后显示 */}
        {status === "ready" && (
          <button
            onClick={handleAnonymous}
            className="group inline-flex items-center gap-1.5 rounded-full border border-border bg-gradient-to-br from-amber-400/10 to-orange-500/10 px-4 py-2 text-xs font-medium text-muted-foreground transition-all hover:border-amber-400/40 hover:text-foreground hover:shadow-sm active:scale-95"
            title={`下次点击随机切换昵称，当前可生成："${randomNick}"`}
          >
            <SparklesIcon className="h-3.5 w-3.5 text-amber-500 transition-transform group-hover:rotate-12" />
            匿名评论
          </button>
        )}
      </div>

      {statusUI}

      {/* Waline 独占容器 */}
      <div ref={walineContainerRef} />
    </section>
  );
}
