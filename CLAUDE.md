# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Before writing any code

This project uses **Next.js 16** which has breaking changes from earlier versions. Read the relevant guide in `node_modules/next/dist/docs/` before writing code. Key differences:

- **Proxy replaces Middleware** — The file is `src/proxy.ts`, not `middleware.ts`. Exports a named `proxy` function with a `config.matcher` export. Used for auth guarding `/admin/*` routes.
- **`unstable_instant`** — Routes needing instant client-side navigation must export `unstable_instant = { prefetch: 'static' }`.

## Commands

```bash
npm run dev          # Start dev server on port 3000
npm run build        # Production build
npm run start        # Start production server
npm run lint         # Run ESLint
npx tsc --noEmit     # Type-check without emitting
```

There is no test framework configured.

## Architecture

**Personal blog** — Next.js 16 App Router + Supabase (PostgreSQL, Auth, Storage) + TipTap WYSIWYG editor + Waline comments.

- `@/` path alias maps to `./src/*`

### Three Supabase clients

| Client | File | Use case |
|--------|------|----------|
| Browser | `src/lib/supabase/client.ts` | Client Components only. Uses `createBrowserClient` from `@supabase/ssr`. |
| Server | `src/lib/supabase/server.ts` | Server Components & Route Handlers. Uses `createServerClient` + `cookies()`. |
| Admin | `src/lib/supabase/admin.ts` | **Server-only.** Uses `SUPABASE_SERVICE_ROLE_KEY` to bypass RLS. Never import in client code. |

### Auth & route protection

Two layers protect `/admin/*`:
1. **`src/proxy.ts`** — Checks Supabase session cookie, redirects unauthenticated users to `/admin/login`. Also redirects logged-in users away from the login page.
2. **`AuthGuard` component** (`src/components/admin/auth-guard.tsx`) — Client-side guard that renders `null` until session is verified.

Auth service: `src/lib/services/auth-service.ts`

### Markdown data flow

```
Save: TipTap editor → getHTML() → Turndown (HTML→Markdown) → Supabase (pure Markdown)
Load: Supabase → Markdown → marked → TipTap setContent()
Display: Supabase → KaTeX pre-render → react-markdown + rehype-pretty-code (Shiki) → custom components
```

The database always stores **pure Markdown** — no editor HTML leaks. Turndown has custom rules for fenced code blocks, math formulas, and backslash normalization.

### Database (Supabase)

Tables: `posts`, `profiles`, `categories`, `post_categories`, `moments`. Migrations are in `supabase/migrations/`. RLS policies enforce: published posts are publicly readable, authenticated users manage their own content.

### Styling

- **Tailwind CSS v4** with `@tailwindcss/postcss` plugin
- **shadcn/ui** (base-nova style, neutral base, CSS variables, Lucide icons)
- **next-themes** for light/dark mode
- `src/app/globals.css` contains Tailwind imports, CSS custom properties, TipTap editor styles, and code block styles

### Key dependencies

- **Rich text**: `@tiptap/react`, `@tiptap/starter-kit`, `@tiptap/extension-code-block-lowlight`, `@tiptap/extension-mathematics`, `@tiptap/extension-image`
- **Markdown rendering**: `react-markdown`, `rehype-pretty-code` (Shiki), `rehype-katex`, `remark-gfm`, `remark-math`
- **Markdown conversion**: `turndown` (HTML→MD), `marked` (MD→HTML for editor loading)
- **Math**: `katex` (pre-rendering server-side)
- **Animation**: `framer-motion`, `tw-animate-css`
- **Comments**: `@waline/client`
- **Utilities**: `clsx` + `tailwind-merge` (via `cn()` from `src/lib/utils.ts`)
