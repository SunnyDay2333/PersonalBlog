/**
 * ============================================================
 * Seed 脚本：插入 "new start" 示例文章
 * 运行方式：npx tsx scripts/seed-new-start.ts
 *
 * 前提条件：
 *   1. .env.local 中已配置 SUPABASE_SERVICE_ROLE_KEY
 *   2. Supabase 中已执行 001_initial_schema.sql
 *   3. 至少存在一个 profiles 记录（可通过注册创建）
 * ============================================================
 */

import { createClient } from "@supabase/supabase-js";

// 加载 .env.local 环境变量（Node.js 21.7+ 原生支持，相对 CWD 解析）
process.loadEnvFile(".env.local");

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } },
);

/** 示例文章 Markdown 内容 */
const sampleContent = `
## 欢迎来到我的博客

这是一篇全新的开始。本博客支持 **Markdown** 写作、**LaTeX 数学公式**、**代码高亮**以及 **PDF 文档内嵌**渲染。

---

## 代码块

\`\`\`typescript
// 一个简单的冒泡排序示例
function bubbleSort(arr: number[]): number[] {
  const n = arr.length;
  for (let i = 0; i < n - 1; i++) {
    for (let j = 0; j < n - i - 1; j++) {
      if (arr[j] > arr[j + 1]) {
        [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]];
      }
    }
  }
  return arr;
}
\`\`\`

\`\`\`python
def fibonacci(n: int) -> int:
    """返回第 n 个斐波那契数"""
    if n <= 1:
        return n
    a, b = 0, 1
    for _ in range(2, n + 1):
        a, b = b, a + b
    return b
\`\`\`

---

## LaTeX 数学公式

### 行内公式

当 $a \\ne 0$ 时，一元二次方程 $ax^2 + bx + c = 0$ 有两个根：

### 块级公式

$$
x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}
$$

### 矩阵表示

$$
\\begin{pmatrix}
a_{11} & a_{12} & \\cdots & a_{1n} \\\\
a_{21} & a_{22} & \\cdots & a_{2n} \\\\
\\vdots & \\vdots & \\ddots & \\vdots \\\\
a_{m1} & a_{m2} & \\cdots & a_{mn}
\\end{pmatrix}
$$

### 贝叶斯公式

$$
P(A \\mid B) = \\frac{P(B \\mid A) \\cdot P(A)}{P(B)}
$$

### 傅里叶变换

$$
\\hat{f}(\\xi) = \\int_{-\\infty}^{\\infty} f(x) \\, e^{-2\\pi i x \\xi} \\, dx
$$

---

## 数学推理示例

> **定理**：对于任意正整数 $n$，若 $n > 2$，则方程 $x^n + y^n = z^n$ 没有正整数解 $(x, y, z)$。

这是一个经典的数论问题。通过椭圆曲线和模形式理论，Andrew Wiles 于 1994 年给出了最终证明。

---

## 任务清单

- [x] 搭建 Next.js 博客框架
- [x] 配置 Supabase 数据库
- [x] 实现 LaTeX 公式渲染
- [x] 支持 PDF 文档嵌入
- [ ] 编写更多文章
- [ ] 上线部署到 Vercel

---

## 表格示例

| 技术栈 | 用途 | 评价 |
|--------|------|------|
| Next.js | 全栈框架 | 极佳 |
| Supabase | 数据库 & 鉴权 | 优秀 |
| Tailwind CSS | 样式系统 | 高效 |
| KaTeX | 数学公式渲染 | 快速 |

---

## PDF 文档嵌入

下面嵌入一份 PDF 文档作为演示：

[示例 PDF 文档](/sample.pdf)
`;

async function main() {
  // 1. 查找第一个 profile 作为作者
  const { data: profiles, error: profileError } = await supabase
    .from("profiles")
    .select("id")
    .limit(1);

  if (profileError || !profiles || profiles.length === 0) {
    console.error("❌ 未找到 profiles 记录。请先在 Supabase Auth 中注册一个用户。");
    console.error("   注册后，触发器 handle_new_user() 会自动创建 profile。");
    process.exit(1);
  }

  const authorId = profiles[0].id;
  console.log(`✅ 找到作者: ${authorId}`);

  // 2. 检查是否已存在同名 slug
  const slug = "new-start";
  const { data: existing } = await supabase
    .from("posts")
    .select("id")
    .eq("slug", slug)
    .single();

  if (existing) {
    console.log("⚠️  'new-start' 文章已存在，正在更新内容...");
    const { error: updateError } = await supabase
      .from("posts")
      .update({
        title: "New Start",
        content: sampleContent.trim(),
        excerpt:
          "这是我的第一篇博客文章，包含 Markdown 排版、LaTeX 数学公式、代码高亮以及 PDF 嵌入演示。",
        status: "published",
        published_at: new Date().toISOString(),
        featured: true,
      })
      .eq("id", existing.id);

    if (updateError) {
      console.error("❌ 更新失败:", updateError.message);
      process.exit(1);
    }
    console.log("✅ 文章 'New Start' 已更新！");
  } else {
    // 3. 插入新文章
    const { error: insertError } = await supabase.from("posts").insert({
      title: "New Start",
      slug,
      content: sampleContent.trim(),
      excerpt:
        "这是我的第一篇博客文章，包含 Markdown 排版、LaTeX 数学公式、代码高亮以及 PDF 嵌入演示。",
      status: "published",
      published_at: new Date().toISOString(),
      featured: true,
      author_id: authorId,
    });

    if (insertError) {
      console.error("❌ 插入失败:", insertError.message);
      process.exit(1);
    }
    console.log("✅ 文章 'New Start' 已创建！");
  }

  console.log("");
  console.log("🌐 访问 http://localhost:3000/posts/new-start 查看文章");
  console.log("🌐 访问 http://localhost:3000 查看首页时间轴");
}

main();
