# 🍳 HomeChef — improved version now lives on the `v2-local-json` branch

This is the **original PostgreSQL version** of HomeChef. It is kept as-is for reference.

A substantially improved rewrite is available on the **`v2-local-json`** branch. It fixes the two biggest problems with this version.

## Get the new version

```bash
git fetch origin
git checkout v2-local-json
```

or browse it directly: [`v2-local-json`](../../tree/v2-local-json)

## What changed

**No PostgreSQL required.** The new version stores data in local JSON files. There is no database server, no migrations, and no pgAdmin — clone, install, run.

**Ingredient matching actually understands food.** This version matches ingredients with naive substring comparison, so unrelated items collide and real matches are missed. The new version uses relevance-based matching with explicit exclusions, so it correctly keeps these apart:

| You type | Correctly does **not** match |
| --- | --- |
| `گوشت گوسفندی` (lamb) | `گوشت گوساله` (beef) |
| `روغن مایع` (vegetable oil) | `روغن زیتون` (olive oil) |
| `پنیر پیتزا` (pizza cheese) | `پنیر پارمسان` (parmesan) |

Also included in the new version:

- 35 focused recipes, each with 5–14 structured `{name, amount, note}` ingredients instead of flat strings
- An explainable `match` object per result: score, coverage, matched and missing ingredients, unused inputs
- One unified fridge input with autocomplete, paste support, and chips; automatic search from 2 ingredients
- Title search on the home page
- Persian and English comma, plus newline input normalization
- Vazirmatn font, RTL layout, food-themed UI, and visible API errors instead of silent failures
- Secrets moved to environment variables — no key committed to the repo
- 23 passing backend tests covering normalization, matching, and ranking

See the full documentation in the README on the `v2-local-json` branch.

---

## About this branch

Originally a web development course final project: FastAPI + PostgreSQL with a React + TailwindCSS frontend.
