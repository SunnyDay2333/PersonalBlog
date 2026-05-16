// ============================================================
// 文章封面占位图（无封面时的兜底）
//   干净渐变色块 + 首字母
// ============================================================

interface CoverPlaceholderProps {
  title: string;
  className?: string;
}

const GRADIENTS = [
  "from-blue-500 to-cyan-400",
  "from-violet-500 to-fuchsia-400",
  "from-amber-500 to-pink-400",
  "from-emerald-500 to-teal-400",
  "from-rose-500 to-orange-400",
  "from-indigo-500 to-purple-400",
  "from-sky-500 to-blue-400",
  "from-lime-500 to-green-400",
];

function pickGradient(title: string): string {
  let hash = 0;
  for (let i = 0; i < title.length; i++) {
    hash = title.charCodeAt(i) + ((hash << 5) - hash);
  }
  return GRADIENTS[Math.abs(hash) % GRADIENTS.length];
}

export function CoverPlaceholder({ title, className = "" }: CoverPlaceholderProps) {
  return (
    <div className={`flex h-full w-full items-center justify-center bg-gradient-to-br ${pickGradient(title)} ${className}`}>
      <span className="text-lg font-bold text-white/80 sm:text-xl">
        {title.charAt(0).toUpperCase()}
      </span>
    </div>
  );
}
