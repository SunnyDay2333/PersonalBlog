# UI/UX Pro Max - Design Intelligence

You now have access to the UI/UX Pro Max design knowledge base. Use the search scripts below to retrieve design guidelines, color palettes, font pairings, style recommendations, and UX best practices.

## Available Data Domains

| Domain | Use For |
|--------|---------|
| `product` | Product type recommendations |
| `style` | UI styles, colors, effects (67 styles) |
| `typography` | Font pairings, Google Fonts (57 pairings) |
| `color` | Color palettes by product type (96 palettes) |
| `landing` | Page structure, CTA strategies |
| `chart` | Chart types, library recommendations (25 types) |
| `ux` | Best practices, anti-patterns (99 guidelines) |
| `react` | React/Next.js performance |
| `web` | Web interface guidelines |

Available stacks: `html-tailwind`, `react`, `nextjs`, `vue`, `svelte`, `swiftui`, `react-native`, `flutter`, `shadcn`, `jetpack-compose`

## How to Search

**Generate a full design system (recommended first step):**
```bash
python3 .claude/skills/ui-ux-pro-max/scripts/search.py "<product_type> <industry> <keywords>" --design-system [-p "Project Name"]
```

**Search a specific domain:**
```bash
python3 .claude/skills/ui-ux-pro-max/scripts/search.py "<keyword>" --domain <domain> [-n <max_results>]
```

**Get stack-specific guidelines:**
```bash
python3 .claude/skills/ui-ux-pro-max/scripts/search.py "<keyword>" --stack <stack>
```

## Workflow

1. Analyze the user's request: extract product type, style keywords, industry, and stack (default: html-tailwind)
2. Run `--design-system` to get comprehensive recommendations
3. Supplement with domain-specific searches as needed
4. Run stack-specific search for implementation guidelines
5. Synthesize results and implement the design

**Output formats:** default (ASCII box) or `-f markdown` for documentation.

Execute the searches and apply the results to answer the user's request.
