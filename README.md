<p align="center">
  <h1 align="center">Sunnyday's Blog</h1>
  <p align="center">
    <sub>一个记录思考与代码的个人博客 / A personal blog for thoughts and code</sub>
    <br />
    <br />
    <img src="https://img.shields.io/badge/Next.js-16-black?logo=next.js" alt="Next.js 16" />
    <img src="https://img.shields.io/badge/React-19-61DAFB?logo=react" alt="React 19" />
    <img src="https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript" alt="TypeScript 5" />
    <img src="https://img.shields.io/badge/Supabase-PostgreSQL-3ECF8E?logo=supabase" alt="Supabase" />
    <img src="https://img.shields.io/badge/Tailwind-v4-06B6D4?logo=tailwindcss" alt="Tailwind CSS v4" />
    <img src="https://img.shields.io/badge/license-MIT-green" alt="MIT License" />
  </p>
</p>

---

## ✨ 功能 / Features

### 前台 / Public Site

- **首页** — Hero 封面区 + 打字机动画 + 时间线式文章列表（带年份分组）
- **文章归档** — 按年份分组、侧边栏导航、滚动到顶按钮
- **文章详情** — 全功能 Markdown 渲染：
  - GFM 表格 / 任务列表
  - Shiki 语法高亮代码块（Mac 风格顶部栏 + 行号 + 一键复制）
  - LaTeX 数学公式（KaTeX 预渲染，行内 + 块级）
  - 中文标题锚点链接 + 右侧毛玻璃 ToC 目录导航
  - PDF 内嵌预览
- **关于页** — 个人介绍、技术栈、兴趣爱好、联系方式
- **评论系统** — Waline 驱动，支持表情 / 图片 / 社交登录
- **亮暗主题** — next-themes 驱动，代码块颜色随主题平滑切换
- **移动端适配** — ToC 折叠、表格横向滚动、底部导航栏

### 后台管理 / Admin Dashboard (`/admin`)

- **登录认证** — Supabase Auth 邮箱密码登录 + Proxy 路由守卫 + RLS 策略
- **仪表盘** — 文章统计（总数 / 已发布 / 草稿）
- **文章编辑器** — TipTap WYSIWYG 富文本：
  - 工具栏：加粗 / 斜体 / 删除线 / 行内代码 / 标题(H1-H6)
  - **代码块**：40+ 语言支持，lowlight 语法高亮，语言选择下拉框
  - **数学公式**：KaTeX 实时预览，点击可编辑源码（Enter/失焦提交）
  - **表格**：可视化行/列选择插入
  - 图片上传（Base64 内联）、本地 .md 文件导入
  - Markdown 快捷键：Ctrl+B/I/K/Z/Y、Ctrl+1~6 标题
- **自动保存** — 3 秒防抖自动存为草稿 + 手动保存 + 发布/更新
- **封面图管理** — 上传至 Supabase Storage + 浏览已上传封面 + URL 粘贴
- **设置页** — 管理员信息展示

---

## 🧱 技术栈 / Tech Stack

| 层 / Layer | 技术 / Technology |
|------------|-------------------|
| 框架 / Framework | Next.js 16 (App Router + Server Components) |
| 语言 / Language | TypeScript 5 |
| 数据库 / Database | Supabase (PostgreSQL + RLS + Storage) |
| 认证 / Auth | Supabase Auth (邮箱密码登录) |
| 样式 / Styling | Tailwind CSS v4 + shadcn/ui (base-nova) |
| 富文本 / Rich Text | TipTap (StarterKit + CodeBlockLowlight + Mathematics + Image) |
| Markdown | react-markdown + rehype-pretty-code (Shiki) + KaTeX |
| 评论 / Comments | Waline (部署在 Vercel) |
| 动画 / Animation | Framer Motion + tw-animate-css |
| 通知 / Toast | Sonner |

---

## 📦 前置要求 / Prerequisites

- **Node.js** ≥ 18
- **npm** ≥ 10
- 一个 **Supabase** 账号（免费版即可）
- （可选）一个 **Waline** 评论服务 — 见下方[部署](#-部署-deployment)章节

---

## 🚀 快速开始 / Quick Start

### 1. 克隆仓库 / Clone

```bash
git clone https://github.com/SunnyDay2333/blog.git
cd blog
```

### 2. 安装依赖 / Install

```bash
npm install
```

### 3. 初始化数据库 / Set Up Supabase

1. 在 [supabase.com](https://supabase.com) 创建一个项目
2. 进入 **Dashboard → SQL Editor**，按顺序执行迁移文件：

   | 顺序 | 文件 | 说明 |
   |------|------|------|
   | 1 | `supabase/migrations/001_initial_schema.sql` | 建表、触发器、RLS 策略 |
   | 2 | `supabase/migrations/002_article_covers_storage.sql` | 封面图存储桶 |
   | 3 | `supabase/migrations/003_article_images_storage.sql` | 文章图片存储桶 |
   | 4 | `supabase/migrations/004_moments.sql` | 说说表 |

3. 进入 **Dashboard → Settings → API**，复制项目 URL 和密钥

### 4. 配置环境变量 / Configure

```bash
cp .env.example .env.local
```

编辑 `.env.local`，填入凭据：

```env
# ── Supabase ────────────────────────────────────────────
# 来源：Supabase Dashboard → Settings → API
NEXT_PUBLIC_SUPABASE_URL=https://<your-project>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJI...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJI...

# ── 站点元信息 / Site Metadata ──────────────────────────
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_SITE_NAME=My Blog

# ── Waline 评论 / Comments ──────────────────────────────
# 设为你的 Waline 服务地址（见部署章节）
NEXT_PUBLIC_WALINE_SERVER_URL=https://your-waline-server.vercel.app
```

### 5. 启动开发服务器 / Start

```bash
npm run dev
```

前台访问 [http://localhost:3000](http://localhost:3000)，后台访问 [http://localhost:3000/admin](http://localhost:3000/admin)。

### 6. 创建管理员账号 / Create Admin

通过 Supabase Auth 注册用户（也可以在 **Supabase Dashboard → Authentication → Add User** 手动创建）。迁移脚本 `001` 中的 `handle_new_user()` 触发器会自动创建对应的 `profiles` 记录。

---

## 🚢 部署 / Deployment

### 方案 A：部署到 VPS（推荐）

本指南基于 **Ubuntu 22.04**，使用 Nginx 反向代理 + PM2 进程管理。

#### A1. 服务器环境 / Server Setup

```bash
# 安装 Node.js 22
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
sudo apt-get install -y nodejs

# 安装 PM2
sudo npm install -g pm2

# 安装 Nginx
sudo apt-get install -y nginx

# 验证
node --version   # ≥ 22
npm --version    # ≥ 10
pm2 --version
nginx -v
```

#### A2. 克隆并构建 / Clone and Build

```bash
# 克隆项目
sudo mkdir -p /opt/blog
sudo chown $USER:$USER /opt/blog
git clone https://github.com/SunnyDay2333/blog.git /opt/blog
cd /opt/blog

# 安装依赖并构建
npm install
cp .env.example .env.local
# ⚠️ 编辑 .env.local，填入生产环境配置（见下方）
nano .env.local
npm run build
```

生产环境 `.env.local` 示例：

```env
NEXT_PUBLIC_SUPABASE_URL=https://<your-project>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJI...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJI...
NEXT_PUBLIC_SITE_URL=https://yourdomain.com
NEXT_PUBLIC_SITE_NAME=My Blog
NEXT_PUBLIC_WALINE_SERVER_URL=https://yourdomain.com/api/waline
```

#### A3. 配置 Nginx / Configure Nginx

创建 `/etc/nginx/sites-available/blog`：

```nginx
# HTTP → HTTPS 跳转
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;
    return 301 https://yourdomain.com$request_uri;
}

server {
    listen 443 ssl;
    server_name yourdomain.com;

    ssl_certificate     /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;

    # Next.js 应用
    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto https;
    }

    # Waline 反向代理（如使用内置代理，见 A4）
    location /api/waline/ {
        proxy_pass http://127.0.0.1:8360/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto https;
    }
}

server {
    listen 443 ssl;
    server_name www.yourdomain.com;

    ssl_certificate     /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;

    return 301 https://yourdomain.com$request_uri;
}
```

启用站点并获取 SSL 证书：

```bash
sudo ln -s /etc/nginx/sites-available/blog /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx

# 安装 certbot 获取免费 HTTPS 证书
sudo apt-get install -y certbot python3-certbot-nginx
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
```

#### A4. 配置 Waline 反向代理（重要）

如果你的 Waline 服务部署在其他域名上，需要反向代理来避免跨域问题并支持 OAuth 登录。

在服务器上创建 `~/proxy.js`：

```js
const http = require("http");
const https = require("https");

const WALINE_HOST = "your-waline-server.vercel.app";
const PROXY_DOMAIN = "yourdomain.com";
const PROXY_PATH = "/api/waline";

const server = http.createServer((req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Headers", "*");
  res.setHeader("Access-Control-Allow-Methods", "*");

  if (req.method === "OPTIONS") {
    res.writeHead(204);
    res.end();
    return;
  }

  const chunks = [];
  req.on("data", (c) => chunks.push(c));
  req.on("end", () => {
    const body = Buffer.concat(chunks);

    // 转发 Cookie（OAuth 登录态需要）
    const fwdHeaders = {
      "Content-Type": req.headers["content-type"] || "application/json",
      "Content-Length": body.length,
      "User-Agent": req.headers["user-agent"] || "Mozilla/5.0 WalineProxy",
      Accept: req.headers["accept"] || "*/*",
    };
    if (req.headers.cookie) fwdHeaders["Cookie"] = req.headers.cookie;
    if (req.headers.authorization) fwdHeaders["Authorization"] = req.headers.authorization;

    const proxy = https.request({
      hostname: WALINE_HOST,
      port: 443,
      path: req.url,
      method: req.method,
      headers: fwdHeaders,
    }, (proxyRes) => {
      const headers = { ...proxyRes.headers };
      const isHTML = (headers["content-type"] || "").includes("text/html");

      // 改写 OAuth 回调 URL，确保走代理
      if (headers.location) {
        headers.location = headers.location.replace(
          new RegExp(WALINE_HOST.replace(/\./g, "\\."), "g"),
          PROXY_DOMAIN + PROXY_PATH
        );
      }

      if (!isHTML) {
        res.writeHead(proxyRes.statusCode, headers);
        proxyRes.pipe(res);
        return;
      }

      const bufs = [];
      proxyRes.on("data", (c) => bufs.push(c));
      proxyRes.on("end", () => {
        let html = Buffer.concat(bufs).toString("utf-8");
        // 改写 serverURL 和域名，确保所有请求走代理
        html = html.replace(
          /window\.serverURL\s*=\s*['"][^'"]*['"]/,
          `window.serverURL = 'https://${PROXY_DOMAIN}${PROXY_PATH}/api/'`
        );
        html = html.replace(
          new RegExp(WALINE_HOST.replace(/\./g, "\\."), "g"),
          PROXY_DOMAIN + PROXY_PATH
        );
        const newBody = Buffer.from(html, "utf-8");
        headers["content-length"] = String(newBody.length);
        delete headers["transfer-encoding"];
        res.writeHead(proxyRes.statusCode, headers);
        res.end(newBody);
      });
    });

    proxy.on("error", () => {
      res.writeHead(502);
      res.end(JSON.stringify({ error: "Proxy error" }));
    });

    proxy.write(body);
    proxy.end();
  });
});

server.listen(8360, "127.0.0.1", () => {
  console.log("Waline proxy running on http://127.0.0.1:8360");
});
```

用 PM2 启动代理：

```bash
pm2 start ~/proxy.js --name waline-proxy
pm2 save
```

#### A5. 启动并持久化 / Start and Persist

```bash
# 启动 Next.js 应用
cd /opt/blog
pm2 start npm --name blog -- start

# 保存 PM2 进程列表并设置开机自启
pm2 save
pm2 startup
# 按屏幕提示完成 PM2 开机自启配置
```

#### A6. 更新已部署的应用 / Update

```bash
cd /opt/blog
git pull origin main
npm install          # 依赖有变化时
npm run build
pm2 restart blog
```

### 方案 B：部署到 Vercel / Netlify

项目兼容 Vercel 和 Netlify。但需要注意：所有 `NEXT_PUBLIC_*` 环境变量必须在平台 Dashboard 中配置，且你仍然需要自备 Supabase 项目和 Waline 评论服务。

---

## 🏗️ 项目结构 / Project Structure

```
src/
├── app/
│   ├── layout.tsx                 # 根布局（字体 + 主题 + Toast）
│   ├── page.tsx                   # 首页（Hero + 时间线列表）
│   ├── about/                     # 关于页
│   ├── posts/
│   │   ├── page.tsx               # 文章归档列表
│   │   └── [slug]/page.tsx        # 文章详情页
│   ├── moments/                   # 说说（碎片化记录）
│   ├── admin/
│   │   ├── layout.tsx             # 管理端布局（侧边栏 + AuthGuard）
│   │   ├── page.tsx               # 仪表盘
│   │   ├── login/                 # 登录页
│   │   ├── posts/                 # 文章管理列表
│   │   ├── posts/new/             # 新建文章
│   │   ├── posts/[id]/edit/       # 编辑文章
│   │   ├── moments/               # 说说管理
│   │   └── settings/              # 设置页
│   └── globals.css                # 全局样式
├── components/
│   ├── admin/                     # 管理端组件（编辑器、鉴权守卫等）
│   ├── posts/                     # 前台文章组件（内容渲染、ToC 等）
│   ├── moments/                   # 说说卡片组件
│   ├── comments/waline.tsx        # Waline 评论组件
│   ├── layout/                    # 公共布局（Header、Footer、Sidebar）
│   ├── theme/                     # 主题提供者和切换按钮
│   └── ui/                        # shadcn/ui 基础组件
├── lib/
│   ├── supabase/                  # Supabase 客户端（browser / server / admin）
│   ├── services/                  # 服务层（post、auth、moment）
│   └── utils/                     # 工具函数（cn、slug、date）
├── hooks/                         # 自定义 React Hooks
├── types/                         # TypeScript 类型定义
└── proxy.ts                       # Admin 路由鉴权（Next.js 16 Proxy）
supabase/
└── migrations/                    # 数据库迁移 SQL 文件
```

### 三种 Supabase 客户端

| 客户端 | 文件 | 用途 |
|--------|------|------|
| Browser | `src/lib/supabase/client.ts` | 仅客户端组件使用 |
| Server | `src/lib/supabase/server.ts` | Server Component 和 Route Handler |
| Admin | `src/lib/supabase/admin.ts` | 仅服务端；使用 `SERVICE_ROLE_KEY` 绕过 RLS |

### Markdown 数据流

```
保存：编辑器 → getHTML() → Turndown → 纯 Markdown → Supabase
加载：Supabase → Markdown → marked → TipTap setContent()
展示：Supabase → KaTeX 预渲染 → react-markdown + Shiki → 自定义组件
```

数据库始终存储**纯 Markdown**，编辑器 HTML 绝不会泄漏到存储中。

---

## 📄 许可 / License

MIT © Sunnyday — 可自由使用、修改和部署你自己的实例。

---

<p align="center">
  Made with ☕️ and lots of late-night coding
</p>
