<p align="center">
  <h1 align="center">Sunnyday's Blog</h1>
  <p align="center">
    A modern, full-stack personal blog with a WYSIWYG editor, markdown rendering, and comments.
    <br />
    <a href="https://sunnyday2333.com"><strong>Live Demo »</strong></a>
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

## ✨ Features

### Public Site

- **Homepage** — Hero section with typewriter animation, timeline-style article list grouped by year
- **Article Archive** — Year-grouped archive with sidebar navigation, scroll-to-top button
- **Article Detail** — Full-featured Markdown rendering:
  - GFM tables / task lists
  - Shiki syntax-highlighted code blocks (macOS-style title bar + line numbers + one-click copy)
  - LaTeX math formulas (KaTeX pre-rendering, inline + block)
  - Anchored headings with frosted-glass ToC sidebar navigation
  - Embedded PDF preview
- **About Page** — Personal intro, tech stack, interests, contact
- **Comments** — Waline-powered, supports emoji / images / social login
- **Theme** — Light / dark mode via next-themes, smooth code block color transitions
- **Mobile Responsive** — Collapsible ToC, scrollable tables, bottom tab bar

### Admin Dashboard (`/admin`)

- **Authentication** — Email/password login via Supabase Auth + proxy guard + RLS policies
- **Dashboard** — Article stats (total / published / draft)
- **Article Editor** — TipTap WYSIWYG:
  - Toolbar: bold / italic / strikethrough / inline code / headings (H1–H6)
  - **Code blocks**: 40+ languages, lowlight highlighting, language selector
  - **Math formulas**: KaTeX live preview, click to edit source (Enter/blur to confirm)
  - **Tables**: visual row/column grid picker
  - Image upload (base64 inline), local .md file import
  - Markdown shortcuts: Ctrl+B/I/K/Z/Y, Ctrl+1–6 for headings
- **Auto-save** — 3-second debounce draft saving + manual save + publish
- **Cover Image** — Upload to Supabase Storage + browse existing covers + URL paste
- **Settings Page** — Admin profile management

---

## 🧱 Tech Stack

| Layer | Technology |
|-------|------------|
| Framework | Next.js 16 (App Router + Server Components) |
| Language | TypeScript 5 |
| Database | Supabase (PostgreSQL + RLS + Storage) |
| Auth | Supabase Auth (email/password) |
| Styling | Tailwind CSS v4 + shadcn/ui (base-nova) |
| Rich Text | TipTap (StarterKit + CodeBlockLowlight + Mathematics + Image) |
| Markdown | react-markdown + rehype-pretty-code (Shiki) + KaTeX |
| Comments | Waline (self-hosted on Vercel) |
| Animation | Framer Motion + tw-animate-css |
| Toast | Sonner |

---

## 📦 Prerequisites

- **Node.js** ≥ 18
- **npm** ≥ 10
- A **Supabase** account (free tier works)
- (Optional) A **Waline** server for comments — see [Deployment](#-deployment) below

---

## 🚀 Quick Start (Local Development)

### 1. Clone the repo

```bash
git clone https://github.com/SunnyDay2333/blog.git
cd blog
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up Supabase

1. Create a project at [supabase.com](https://supabase.com)
2. Go to **Dashboard → SQL Editor** and run the migration files **in order**:

   | Order | File | Purpose |
   |-------|------|---------|
   | 1 | `supabase/migrations/001_initial_schema.sql` | Tables, triggers, RLS policies |
   | 2 | `supabase/migrations/002_article_covers_storage.sql` | Cover image storage bucket |
   | 3 | `supabase/migrations/003_article_images_storage.sql` | Article image storage bucket |
   | 4 | `supabase/migrations/004_moments.sql` | Moments table |

3. Go to **Dashboard → Settings → API**, copy your project URL and keys

### 4. Configure environment

```bash
cp .env.example .env.local
```

Edit `.env.local` and fill in your credentials:

```env
# ── Supabase ────────────────────────────────────────────
# From Supabase Dashboard → Settings → API
NEXT_PUBLIC_SUPABASE_URL=https://<your-project>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJI...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJI...

# ── Site Metadata ───────────────────────────────────────
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_SITE_NAME=My Blog

# ── Waline Comments ─────────────────────────────────────
# Set this to your Waline server URL (see Deployment section below)
NEXT_PUBLIC_WALINE_SERVER_URL=https://your-waline-server.vercel.app
```

### 5. Start the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) for the public site, [http://localhost:3000/admin](http://localhost:3000/admin) for the admin dashboard.

### 6. Create an admin account

Register a user via Supabase Auth (you can use the **Supabase Dashboard → Authentication → Add User** to create your first admin account). The `handle_new_user()` trigger in migration `001` will automatically create the corresponding `profiles` row.

---

## 🚢 Deployment

### Option A: Deploy to a VPS (Recommended)

This guide uses **Ubuntu 22.04** with Nginx as reverse proxy and PM2 as process manager.

#### A1. Server Setup

```bash
# Install Node.js 22 (via NodeSource)
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PM2 globally
sudo npm install -g pm2

# Install Nginx
sudo apt-get install -y nginx

# Verify
node --version   # ≥ 22
npm --version    # ≥ 10
pm2 --version
nginx -v
```

#### A2. Clone and Build

```bash
# Clone the project
sudo mkdir -p /opt/blog
sudo chown $USER:$USER /opt/blog
git clone https://github.com/SunnyDay2333/blog.git /opt/blog
cd /opt/blog

# Install and build
npm install
cp .env.example .env.local
# ⚠️ Edit .env.local with your production values (see below)
nano .env.local
npm run build
```

Production `.env.local` example:

```env
NEXT_PUBLIC_SUPABASE_URL=https://<your-project>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJI...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJI...
NEXT_PUBLIC_SITE_URL=https://yourdomain.com
NEXT_PUBLIC_SITE_NAME=My Blog
NEXT_PUBLIC_WALINE_SERVER_URL=https://yourdomain.com/api/waline
```

#### A3. Configure Nginx

Create `/etc/nginx/sites-available/blog`:

```nginx
# HTTP → HTTPS redirect
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

    # Next.js app
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

    # Waline reverse proxy (if using the bundled proxy, see A4)
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

Enable the site and obtain SSL certificates:

```bash
sudo ln -s /etc/nginx/sites-available/blog /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx

# Install certbot and get free HTTPS cert
sudo apt-get install -y certbot python3-certbot-nginx
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
```

#### A4. Set Up Waline Reverse Proxy (Important)

If your Waline server is deployed on a different domain, you need a reverse proxy to avoid CORS issues and enable OAuth login.

Create `~/proxy.js` on the server:

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

    // Forward critical headers (cookies needed for OAuth login)
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

      // Rewrite OAuth callback URLs to go through the proxy
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

Start the proxy with PM2:

```bash
pm2 start ~/proxy.js --name waline-proxy
pm2 save
```

#### A5. Start and Persist

```bash
# Start the Next.js app
cd /opt/blog
pm2 start npm --name blog -- start

# Save PM2 process list and enable startup
pm2 save
pm2 startup
# Follow the printed instructions to enable PM2 on boot
```

#### A6. Update the Deployed App

```bash
cd /opt/blog
git pull origin main
npm install          # if dependencies changed
npm run build
pm2 restart blog
```

### Option B: Deploy to Vercel / Netlify

This project is compatible with Vercel and Netlify. However, you **must** set all `NEXT_PUBLIC_*` environment variables in the platform dashboard, and you will still need a Supabase project and a Waline server.

---

## 🏗️ Project Structure

```
src/
├── app/
│   ├── layout.tsx                 # Root layout (fonts + theme + toast)
│   ├── page.tsx                   # Homepage (hero + timeline)
│   ├── about/                     # About page
│   ├── posts/
│   │   ├── page.tsx               # Article archive
│   │   └── [slug]/page.tsx        # Article detail page
│   ├── moments/                   # Moments (micro-blog)
│   ├── admin/
│   │   ├── layout.tsx             # Admin layout (sidebar + AuthGuard)
│   │   ├── page.tsx               # Dashboard
│   │   ├── login/                 # Login page
│   │   ├── posts/                 # Article management
│   │   ├── posts/new/             # Create new article
│   │   ├── posts/[id]/edit/       # Edit article
│   │   ├── moments/               # Moments management
│   │   └── settings/              # Settings
│   └── globals.css                # Global styles
├── components/
│   ├── admin/                     # Admin components (editor, auth-guard, etc.)
│   ├── posts/                     # Public post components (content, ToC, etc.)
│   ├── moments/                   # Moment card components
│   ├── comments/waline.tsx        # Waline comment widget
│   ├── layout/                    # Shared layout (Header, Footer, Sidebar)
│   ├── theme/                     # Theme provider and toggle
│   └── ui/                        # shadcn/ui primitives
├── lib/
│   ├── supabase/                  # Supabase clients (browser / server / admin)
│   ├── services/                  # Service layer (post, auth, moment)
│   └── utils/                     # Utility functions (cn, slug, date)
├── hooks/                         # Custom React hooks
├── types/                         # TypeScript type definitions
└── proxy.ts                       # Admin route auth guard (Next.js 16 Proxy)
supabase/
└── migrations/                    # Database migration SQL files
```

### Three Supabase Clients

| Client | File | Use Case |
|--------|------|----------|
| Browser | `src/lib/supabase/client.ts` | Client Components only |
| Server | `src/lib/supabase/server.ts` | Server Components & Route Handlers |
| Admin | `src/lib/supabase/admin.ts` | Server-only; uses `SERVICE_ROLE_KEY` to bypass RLS |

### Markdown Data Flow

```
Save: Editor → getHTML() → Turndown → Pure Markdown → Supabase
Load: Supabase → Markdown → marked → TipTap setContent()
Display: Supabase → KaTeX pre-render → react-markdown + Shiki → Custom Components
```

The database always stores **pure Markdown** — no editor HTML ever leaks into storage.

---

## 📄 License

MIT © Sunnyday — feel free to use, modify, and deploy your own instance.

---

<p align="center">
  Made with ☕️ and lots of late-night coding
</p>
