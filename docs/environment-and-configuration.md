# Environment & Configuration

Complete reference for every environment variable and configuration file in
`animated-clean-toast-carousel`. If you are setting the project up for the
first time, read [Developer Guide](./developer-guide.md) instead — this file
is the deep reference.

---

## 1. Environment variables (.env)

**Short version: this project needs zero environment variables.** There is no
`.env` file in the repo, and no source file reads `process.env`. The app runs
fully client-side with no backend, no API keys, and no external services.

### 1.1 The `.env.example` template

A `.env.example` file ships at the repo root. It contains no active values —
only commented documentation of the conventions to follow when you add an
integration later. Copy it to start a real env file:

```bash
cp .env.example .env.local
```

### 1.2 How Next.js loads env files (load order)

Next.js 15 expands and merges env files at build/dev time. Later files win:

| Priority | File                      | Committed? | Purpose                          |
|----------|---------------------------|------------|----------------------------------|
| 1 (high) | `.env.development.local` / `.env.production.local` / `.env.test.local` | No | Per-environment secrets |
| 2        | `.env.local`              | **No**     | Local secrets, all environments  |
| 3        | `.env.development` / `.env.production` / `.env.test` | Yes | Non-secret per-env defaults |
| 4 (low)  | `.env`                    | Yes        | Shared non-secret defaults       |

This repo's `.gitignore` already ignores `.env*`, so secrets never get committed.

### 1.3 The `NEXT_PUBLIC_` rule

Only variables prefixed with `NEXT_PUBLIC_` are inlined into the browser
bundle. Everything else is server-only. Consequences:

- `NEXT_PUBLIC_APP_URL` → readable in any client component via `process.env.NEXT_PUBLIC_APP_URL`.
- `SOME_API_KEY` (no prefix) → available in Route Handlers / Server Components only; referencing it in a client component yields `undefined` at best and a build warning.

Since this project currently has **no server code at all** (every page is a
client component), every variable you add today would need the `NEXT_PUBLIC_`
prefix to be usable. Prefer adding a Route Handler first if you need secrets.

### 1.4 Variables you would add per integration

| If you add…              | Add these variables                          | Prefix needed |
|--------------------------|----------------------------------------------|---------------|
| Vercel Analytics          | none (just render `<Analytics />`)           | —             |
| A REST API base URL       | `NEXT_PUBLIC_API_URL`                        | `NEXT_PUBLIC_` |
| Auth (e.g. NextAuth)      | `NEXTAUTH_SECRET`, `NEXTAUTH_URL` (+ provider keys, no prefix) | mixed |
| Database (e.g. Postgres)  | `DATABASE_URL`                               | none (server-only) |
| Sentry / PostHog          | `NEXT_PUBLIC_SENTRY_DSN` / `NEXT_PUBLIC_POSTHOG_KEY` | `NEXT_PUBLIC_` |

On Vercel, set these in **Project → Settings → Environment Variables**
(Development / Preview / Production scopes) instead of committing files.

---

## 2. `package.json`

```json
{
  "name": "my-v0-project",
  "version": "0.1.0",
  "private": true
}
```

- `private: true` — blocks accidental `npm publish`. Keep it.
- `name: "my-v0-project"` — v0 boilerplate. Rename to
  `"animated-clean-toast-carousel"` when convenient; it affects nothing at runtime.

### 2.1 Scripts

| Script  | Command      | What it does |
|---------|--------------|--------------|
| `dev`   | `next dev`   | Dev server with Fast Refresh at http://localhost:3000 |
| `build` | `next build` | Production build (`.next/`) — type-checks and lints unless disabled (see §3) |
| `start` | `next start` | Serves the production build |
| `lint`  | `next lint`  | ESLint over the project (Next.js 15 still ships `next lint`; deprecated in v16) |

### 2.2 Package manager

A `pnpm-lock.yaml` is committed, so **pnpm is the intended manager**:

```bash
pnpm install
pnpm dev
```

`npm install` / `yarn` also work but will resolve versions independently of
the lockfile. `next.config.mjs` documents no `packageManager` field, so
nothing enforces pnpm — consider adding `"packageManager": "pnpm@9.x"` to
`package.json` if you want Corepack to pin it.

---

## 3. `next.config.mjs`

```js
/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
}

export default nextConfig
```

### 3.1 `eslint.ignoreDuringBuilds: true`

`next build` skips ESLint. **Why it exists here:** v0-generated projects turn
this on so generated code never blocks a deploy.

**Trade-off:** lint errors (unused vars, `react-hooks/exhaustive-deps`, …)
silently ship. This repo has at least one real case — `carousel.tsx`
`useEffect(..., [carouselRef.current])` violates `exhaustive-deps`. If you
start maintaining this seriously, set it to `false` and run `pnpm lint`.

### 3.2 `typescript.ignoreBuildErrors: true`

`next build` skips `tsc`. Same v0 rationale, same trade-off: type errors
(e.g. the unused `app-card.tsx` variant drifting out of sync) won't fail a
build. For production hardening, set to `false` and fix what `tsc --noEmit`
reports.

### 3.3 `images.unoptimized: true`

Disables Next.js Image Optimization. Required when deploying to hosts without
an image optimizer (static export, some edge hosts). Currently harmless —
the project doesn't use `next/image` at all (only static files in `public/`).

---

## 4. `tsconfig.json`

Standard Next.js 15 + React 19 config. The options that matter most:

| Option | Value | Effect |
|--------|-------|--------|
| `strict` | `true` | Full strict type-checking (but see `ignoreBuildErrors` in §3.2 — builds skip it) |
| `jsx` | `"preserve"` | Next.js handles JSX transform; required for the App Router |
| `moduleResolution` | `"bundler"` | Modern resolution for ESM/CJS interop |
| `target` / `lib` | `ES6` / `dom, dom.iterable, esnext` | Baseline output; Next polyfills what it needs |
| `noEmit` | `true` | `tsc` type-checks only; Next handles emit |
| `isolatedModules` | `true` | Every file must be independently transpilable (use `import type` for types — the codebase already does) |
| `paths` | `{ "@/*": ["./*"] }` | **The `@/` alias** — `@/components/x` → `<root>/components/x`. Defined but barely used; most imports here are relative (`./carousel`). Prefer `@/` for new code |
| `plugins: [{ name: "next" }]` | — | Powers editor integration for Server Components / routes |
| `include` | `next-env.d.ts, **/*.ts(x), .next/types/**` | Covers app, components, lib |
| `exclude` | `node_modules` | — |

---

## 5. `tailwind.config.ts` (Tailwind CSS v3.4)

```ts
darkMode: ['class']
```

- Dark mode is **class-based**: add `class="dark"` on `<html>` to activate the
  `.dark` variable set in `styles/globals.css`. Nothing toggles it today
  (the `next-themes` provider isn't mounted — see
  [Third-Party Integrations](./third-party-integrations.md)).

```ts
content: [
  './pages/**/*.{js,ts,jsx,tsx,mdx}',
  './components/**/*.{js,ts,jsx,tsx,mdx}',
  './app/**/*.{js,ts,jsx,tsx,mdx}',
  '*.{js,ts,jsx,tsx,mdx}',   // ← root-level files: carousel.tsx, demo.tsx, …
]
```

- The last glob is what picks up the root-level components (`demo.tsx`,
  `carousel.tsx`, `animated-toast.tsx`, `toast-context.tsx`, `app-card.tsx`,
  `carousel-card.tsx`). Don't delete it or those files lose their styles in
  production builds (Tailwind purges unused classes).

`theme.extend.colors` — the full **shadcn CSS-variable palette**:
`background`, `foreground`, `card`, `popover`, `primary`, `secondary`,
`muted`, `accent`, `destructive`, `border`, `input`, `ring`, `chart.*`,
`sidebar.*`. Each maps to `hsl(var(--<name>))`, with the variables defined in
`styles/globals.css` (`:root` for light, `.dark` for dark). Change a theme by
editing the HSL values in one place.

`theme.extend.borderRadius` — `lg/md/sm` derive from `--radius`.

`keyframes` / `animation` — `accordion-down` / `accordion-up` use Radix's
`--radix-accordion-content-height` variable. Registered but unused by the
current UI (no accordion rendered).

`plugins: [require('tailwindcss-animate')]` — provides `animate-in`,
`animate-out`, `fade-in-*`, `zoom-in-*`, etc. utilities.

> **Note:** `font-figtree` (used across components) is **not** a Tailwind
> theme token — it's a plain CSS class defined in `app/globals.css`
> (`@layer base`). It works independently of this config.

---

## 6. `postcss.config.mjs`

```js
export default {
  plugins: {
    tailwindcss: {},
  },
}
```

Only the Tailwind PostCSS plugin is registered. Two things to know:

1. **`autoprefixer` is installed but NOT registered here.** Tailwind v3's own
   docs recommend adding it (`autoprefixer: {}`). Without it, no vendor
   prefixes are emitted (e.g. for `backdrop-blur`, `scroll-snap-type` on older
   browsers). Add `autoprefixer: {}` to this file if you need wider browser
   support.
2. `app/globals.css` is the stylesheet actually imported (`app/layout.tsx`);
   `styles/globals.css` (the shadcn variable file) is currently **not imported
   anywhere** — the CSS variables it defines (`--background`, `--primary`, …)
   therefore don't exist at runtime, and any `bg-background` / `text-primary`
   classes would resolve to nothing. Either import it in the layout or move the
   `:root` block into `app/globals.css`.

---

## 7. `components.json` (shadcn/ui)

Schema: `https://ui.shadcn.com/schema.json`. Every field:

| Field | Value | Meaning |
|-------|-------|---------|
| `style` | `"default"` | shadcn component style variant |
| `rsc` | `true` | Generate React Server Component–compatible code |
| `tsx` | `true` | TypeScript + TSX (not JS) |
| `tailwind.config` | `"tailwind.config.ts"` | Where the shadcn CLI reads theme config |
| `tailwind.css` | `"app/globals.css"` | Where the CLI injects CSS variables |
| `tailwind.baseColor` | `"neutral"` | Base gray scale for generated components |
| `tailwind.cssVariables` | `true` | Use `hsl(var(--…))` tokens instead of hardcoded colors |
| `tailwind.prefix` | `""` | No class prefix |
| `aliases.components` | `"@/components"` | Import alias for components |
| `aliases.utils` | `"@/lib/utils"` | → the `cn()` helper |
| `aliases.ui` | `"@/components/ui"` | shadcn primitives live here (empty today) |
| `aliases.lib` | `"@/lib"` | — |
| `aliases.hooks` | `"@/hooks"` | Directory doesn't exist yet — created on first `shadcn add` that needs it |
| `iconLibrary` | `"lucide"` | Use `lucide-react` icons in generated code |

Practical use: `pnpm dlx shadcn@latest add button` scaffolds
`components/ui/button.tsx` using these settings.

---

## 8. `.gitignore` (relevant excerpts)

```
# dependencies
/node_modules

# next.js
/.next/
/out/

# production
/build

# env files
.env*
```

`.env*` covers `.env`, `.env.local`, `.env.development.local`, etc. —
secrets can't be committed by accident. One deliberate exception:
`!.env.example` re-allows the documented template (it holds zero secrets —
only commented conventions). `.next/` (build output) and `out/`
(static export) are ignored too.

---

## 9. Quick reference — "I want to change X"

| Goal | File to edit |
|------|--------------|
| Add an env variable | `.env.local` (create from `.env.example`); add `NEXT_PUBLIC_` prefix for browser use |
| Change dev/build/start scripts | `package.json` → `scripts` |
| Re-enable lint/type checks in builds | `next.config.mjs` → set `ignoreDuringBuilds` / `ignoreBuildErrors` to `false` |
| Add a path alias | `tsconfig.json` → `compilerOptions.paths` |
| Change theme colors / radius | `styles/globals.css` (`:root` / `.dark`) **and** import it in `app/layout.tsx` (currently unimported!) |
| Add Tailwind utilities / keyframes | `tailwind.config.ts` → `theme.extend` |
| Add a PostCSS plugin (e.g. autoprefixer) | `postcss.config.mjs` |
| Scaffold shadcn components | `components.json` controls output; run `pnpm dlx shadcn@latest add <name>` |
| Pin the package manager | `package.json` → add `"packageManager": "pnpm@9.x"` |
