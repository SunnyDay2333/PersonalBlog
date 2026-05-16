# Sunnyday's Blog

一个记录思考与代码的个人博客，基于 Next.js 16 + Supabase + TipTap 构建。

---

## 技术栈

| 层 | 技术 |
|---|------|
| 框架 | Next.js 16（App Router + Server Components） |
| 语言 | TypeScript 5 |
| 样式 | Tailwind CSS v4 + shadcn/ui |
| 数据库 | Supabase（PostgreSQL + RLS + Storage） |
| 认证 | Supabase Auth（邮箱密码登录） |
| 富文本编辑器 | TipTap（StarterKit + CodeBlock + Mathematics） |
| Markdown 渲染 | react-markdown + rehype-pretty-code（Shiki） + KaTeX |
| 评论 | Waline |
| 动画 | Framer Motion + tw-animate-css |
| 通知 | Sonner |

---

## 功能概览

### 前台（C 端）

- **首页** — Hero 封面区 + 打字机动画 + 时间线式文章列表（带年份分组）
- **文章列表** — 按年份归档、侧边栏导航、滚动到顶按钮
- **文章详情** — 全功能 Markdown 渲染：
  - GFM 表格 / 任务列表
  - Shiki 语法高亮代码块（Mac 风格顶部栏 + 行号 + 一键复制）
  - LaTeX 数学公式（KaTeX 预渲染，行内 + 块级）
  - 中文标题锚点链接 + 右侧 ToC 目录导航
  - 毛玻璃模糊雾化效果（非活跃标题）
  - PDF 内嵌预览
- **关于页** — 个人介绍、技术栈、兴趣爱好、联系方式
- **评论系统** — Waline 驱动，支持表情 / 图片 / 登录
- **亮暗主题** — next-themes 驱动，代码块颜色随主题平滑切换
- **响应式** — 移动端适配 ToC 折叠、表格横向滚动

### 后台管理（Admin 端 / `/admin`）

- **登录认证** — Supabase Auth 邮箱密码登录 + AuthGuard 路由守卫 + RLS 策略
- **仪表盘** — 文章统计（总数 / 已发布 / 草稿）
- **文章管理** — 列表展示 + 状态徽章 + 批量操作
- **文章编辑器** — TipTap WYSIWYG 富文本：
  - 工具栏：加粗 / 斜体 / 删除线 / 行内代码 / 标题(H1-H6)
  - 无序列表 / 有序列表 / 引用 / 分割线
  - **代码块**：40+ 语言支持，lowlight 语法高亮，语言选择下拉框
  - **数学公式**：KaTeX 实时渲染，点击可编辑源码（Enter/失焦提交）
  - **表格**：可视化行/列选择插入
  - 图片上传（Base64 内联）、本地 .md 文件导入
  - Markdown 快捷键：Ctrl+B/I/K/Z/Y、Ctrl+1~6 标题、Ctrl+7 正文
- **自动保存** — 3 秒防抖自动存为草稿 + 手动保存 + 发布 / 更新
- **文章创建** — 空白撰写 或 上传 .md 文件双入口
- **封面图管理** — 上传至 Supabase Storage + 浏览已上传封面 + URL 粘贴
- **设置页** — 管理员信息展示
- **样式隔离** — 编辑器 CSS 仅 admin 路由加载，不污染前台

---

## 数据架构

### 数据库（Supabase PostgreSQL）

```
auth.users ──1:1──> profiles ──1:N──> posts ──N:M──> categories
```

- `posts` 表：存储 Markdown 原始内容，支持草稿 / 已发布 / 已归档状态
- `profiles` 表：与 Supabase Auth 自动同步，注册时触发创建
- `categories` + `post_categories`：多对多分类关联
- RLS 策略：已发布文章公开可读，认证用户可管理自己的文章

### Markdown 数据流

```
【保存】编辑器 → getHTML → Turndown（围栏代码块 + 数学公式 + 反斜杠归一化） → Markdown → Supabase
【加载】Supabase → Markdown → 数学公式预转换 → marked → setContent → TipTap 实时渲染
【展示】Supabase → KaTeX 预渲染 → react-markdown → rehype-pretty-code(Shiki) → 自定义组件
```

- 数据库始终存储**纯 Markdown**，无编辑器 HTML 泄漏
- 代码块语言标注完整保留（Turndown 自定义规则）
- LaTeX 反斜杠双向归一化保护

---

## 快速开始

### 1. 安装依赖

```bash
npm install
```

### 2. 配置环境变量

复制 `.env.example` 为 `.env.local`，填入 Supabase 项目凭据：

```env
# Supabase（来自 Dashboard → Settings → API）
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJxxx...
SUPABASE_SERVICE_ROLE_KEY=eyJxxx...

# Waline 评论系统
NEXT_PUBLIC_WALINE_SERVER=https://xxx.vercel.app

# OAuth（可选）
GITHUB_CLIENT_ID=xxx
GITHUB_CLIENT_SECRET=xxx
```

### 3. 初始化数据库

在 Supabase Dashboard → SQL Editor 中依次执行：

1. `supabase/migrations/001_initial_schema.sql` — 创建表、触发器、RLS 策略
2. `supabase/migrations/002_article_covers_storage.sql` — 创建封面图存储桶

### 4. 启动开发服务器

```bash
npm run dev
```

访问 `http://localhost:3000` 查看前台，`http://localhost:3000/admin` 进入后台。

---

## 项目结构

```
src/
├── app/
│   ├── layout.tsx              # 根布局（字体 + 主题 + Sonner Toast）
│   ├── page.tsx                # 首页（Hero + 时间线列表）
│   ├── about/                  # 关于页
│   ├── posts/
│   │   ├── page.tsx            # 文章归档列表
│   │   └── [slug]/page.tsx     # 文章详情页
│   ├── admin/
│   │   ├── layout.tsx          # Admin 布局（侧边栏 + AuthGuard）
│   │   ├── page.tsx            # 仪表盘
│   │   ├── login/              # 登录页
│   │   ├── posts/              # 文章管理列表
│   │   ├── posts/new/          # 新建文章
│   │   ├── posts/[id]/edit/    # 编辑文章
│   │   └── settings/           # 设置页
│   └── globals.css             # 全局样式（含 TipTap 编辑器 + 前台代码块）
├── components/
│   ├── admin/                  # 管理端组件
│   │   ├── markdown-editor.tsx  # TipTap 编辑器（核心 700+ 行）
│   │   ├── post-editor.tsx      # 文章编辑页面容器
│   │   └── ...
│   ├── posts/                  # 前台文章组件
│   │   ├── post-content.tsx     # Markdown → JSX 渲染引擎
│   │   ├── post-toc.tsx         # ToC 目录导航
│   │   └── ...
│   ├── comments/waline.tsx     # Waline 评论客户端组件
│   ├── layout/                 # 公共布局（Header / Footer / Sidebar）
│   ├── theme/                  # 主题切换（ThemeProvider / ThemeToggle）
│   └── ui/                     # shadcn/ui 基础组件
├── lib/
│   ├── supabase/               # Supabase 客户端（client / server / admin）
│   ├── services/               # 服务层（post-service / auth-service）
│   └── utils/                  # 工具函数（slug / date）
├── hooks/                      # 自定义 Hooks
├── types/                      # TypeScript 类型定义
└── proxy.ts                    # Admin 路由认证中间件
```

---

## 许可

MIT
