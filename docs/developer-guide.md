# Developer Guide

How to run, understand, and extend `animated-clean-toast-carousel`. For
configuration deep-dives see [Environment & Configuration](./environment-and-configuration.md);
for packages see [Third-Party Integrations](./third-party-integrations.md).

---

## 1. Prerequisites & setup

| Requirement | Version | Notes |
|-------------|---------|-------|
| Node.js | ≥ 18.18 | Next.js 15 minimum; 20 LTS recommended |
| pnpm | ≥ 8 | `pnpm-lock.yaml` is committed — pnpm is the intended manager |
| Git | any | — |

```bash
# 1. clone
git clone https://github.com/girishlade111/animated-clean-toast-carousel.git
cd animated-clean-toast-carousel

# 2. install
pnpm install

# 3. run
pnpm dev        # → http://localhost:3000

# 4. production check
pnpm build                       # static export → out/
npx serve out                    # serve the export locally
```

No `.env` file, no database, no API keys — `pnpm dev` just works.

> **v0 sync caution:** this repo was generated with v0.app and its original
> README states that v0 deployments auto-push to this repository. If that sync
> is still active, force-pushing local commits can conflict with v0's pushes.
> Prefer normal (non-force) pushes and pull before pushing.

---

## 2. Project structure

```
animated-clean-toast-carousel/
├── app/
│   ├── layout.tsx        # root layout: Figtree font, <html>/<body>, metadata
│   ├── page.tsx          # "/" route — renders <Demo /> (client component)
│   └── globals.css       # LIVE stylesheet: @tailwind directives, shadcn theme
│                           # vars (:root/.dark), Figtree base styles
├── components/
│   └── theme-provider.tsx# next-themes wrapper — NOT mounted (dead code today)
├── lib/
│   └── utils.ts          # cn() class helper — NOT imported anywhere yet
├── public/               # static assets (placeholder images)
├── docs/                 # ← you are here
│   ├── environment-and-configuration.md
│   ├── third-party-integrations.md
│   └── developer-guide.md
├── .env.example          # env template (project needs zero vars today)
├── animated-toast.tsx    # toast UI: AnimatedToast + ToastContainer
├── carousel.tsx          # scroll-snap carousel + nav buttons
├── carousel-card.tsx     # light card used inside the carousel
├── demo.tsx              # demo page: 12 flowers/saints items + providers
├── toast-context.tsx     # toast state: ToastProvider + useToast()
├── components.json       # shadcn/ui configuration
├── eslint.config.mjs      # ESLint flat config (next/core-web-vitals + TS)
├── next.config.mjs       # Next.js config (lint + typecheck enforced in builds)
├── package.json
├── pnpm-lock.yaml
├── postcss.config.mjs
├── tailwind.config.ts
└── tsconfig.json         # @/* path alias
```

**Naming quirk:** the interactive components live at the repo **root**
(`carousel.tsx`, `demo.tsx`, …), not under `components/` or `app/`. The
Tailwind `content` config explicitly includes the root glob
`'*.{js,ts,jsx,tsx,mdx}'` for this reason. For new code, prefer `@/components/`
(via the `components.json` aliases) to reduce confusion.

---

## 3. Architecture & data flow

```
app/page.tsx ("use client")
└── demo.tsx <Demo>
    └── <ToastProvider>            (toast-context.tsx — React context)
        └── <FlowersAndSaintsUI>
            ├── <Carousel items>   (carousel.tsx)
            │   └── <AppCard … onClick={item.action}>   (carousel-card.tsx)
            │         └── onClick → addToast(message, type)  ─┐
            └── <ToastContainer>   (animated-toast.tsx)      │
                └── {toasts.map(t => <AnimatedToast …/>)}  ←─┘
```

### 3.1 Toast system

**State** (`toast-context.tsx`):

```ts
type ToastType = "flower" | "saint" | "warning" | "info"
interface Toast { id: number; message: string; type: ToastType }
```

- `ToastProvider` holds `toasts: Toast[]` in `useState`.
- `addToast(message, type)` appends `{ id, message, type }` where `id` comes
  from a monotonic counter (`useRef`) — `Date.now()` was replaced on
  27 Sep 2026 because same-millisecond toasts shared an id (key collision,
  wrong toast dismissed).
- `removeToast(id)` filters by id.
- `useToast()` throws if called outside the provider — mount order matters.

**Rendering & lifecycle** (`animated-toast.tsx`):

1. `ToastContainer` (fixed `bottom-4 right-4 z-50`) maps `toasts` inside
   `<AnimatePresence>` so exit animations play.
2. Each `AnimatedToast` starts an auto-dismiss `setTimeout` on mount
   (default 3000 ms, configurable via the `duration` prop), then calls
   `removeToast(id)` → `AnimatePresence` plays the exit animation.
3. Animation spec (framer-motion spring):
   - enter: `opacity 0→1, y 50→0, scale 0.3→1`
   - exit: `opacity →0, y →20, scale →0.5`
   - `transition: { type: "spring", stiffness: 500, damping: 40 }`
4. Icon + color per type: `flower → Flower/pink-500`, `saint → Cross/indigo-500`,
   `warning → AlertTriangle/yellow-500`, `info → Info/blue-500`.

**Known quirks (fixed 27 Sep 2026):**

- Toast ids were `Date.now()` — same-millisecond toasts shared an id.
  Replaced with a monotonic `useRef` counter.
- Dismissal was not pausable on hover and had no manual close button.
  An `X` button calling `removeToast(id)` was added (with `aria-label`).

### 3.2 Carousel

`carousel.tsx` is a **hand-rolled scroll-snap carousel** (not Embla):

- Track: `flex overflow-x-auto` with `scrollSnapType: "x mandatory"`,
  each card `scrollSnapAlign: "start"`.
- Scrollbar hidden via injected `.no-scrollbar` CSS (WebKit + Firefox +
  IE/Edge rules).
- Nav buttons: `scrollLeft` / `scrollWidth` / `clientWidth` drive
  `canScrollLeft` / `canScrollRight`; buttons fade in/out via
  `AnimatePresence` + `motion.button`. Clicking scrolls by half the viewport
  (`clientWidth / 2`) with `behavior: "smooth"`.
- Cards: `AppCard` from `carousel-card.tsx` — `w-64 h-72`, light theme,
  `whileHover={{ y: -5 }}` lift + `whileTap={{ scale: 0.95 }}` press.

**Known quirks (fixed 27 Sep 2026):**

- The effect previously depended on `carouselRef.current` (anti-pattern —
  refs don't trigger re-renders; `exhaustive-deps` flags it) and the initial
  button state was never computed on mount. Now `updateScrollButtons` is a
  `useCallback`, the effect runs once on mount (+ on `items.length` change),
  and a `resize` listener keeps the arrows correct on viewport changes.
- No drag/swipe momentum beyond native scroll, no autoplay, no looping —
  fine for a demo; reach for `embla-carousel-react` (already installed) for
  production needs.

### 3.3 Demo content

`demo.tsx` defines 12 items (flowers ↔ saints alternating), each with a
Lucide icon, title, description, and an `action` that fires
`addToast("<fact>", "flower" | "saint")`. The page is a gradient
(`from-indigo-100 to-pink-100`) centered column with the heading
"Flowers & Saints Toast UI".

---

## 4. Common tasks (recipes)

### 4.1 Add a new toast type

1. `toast-context.tsx`: extend the union —
   `type ToastType = "flower" | "saint" | "warning" | "info" | "success"`.
2. `animated-toast.tsx`: add to both maps —
   ```tsx
   const icons = { …, success: CheckCircle2 }
   const colors = { …, success: "text-green-500" }
   ```
   and extend `ToastProps["type"]`.
3. Fire it: `addToast("Saved!", "success")`.

### 4.2 Change toast duration or position

- Duration: the `3000` in `animated-toast.tsx`'s `setTimeout`. Consider making
  it a prop (`durationMs = 3000`) or per-toast field.
- Position: `ToastContainer`'s `fixed bottom-4 right-4` classes.

### 4.3 Add a carousel item

In `demo.tsx`, append to `items`:

```tsx
{
  Icon: Sparkles,                       // import from lucide-react
  title: "Orchid",
  description: "Symbol of luxury and beauty",
  action: () => addToast("Orchids symbolize luxury", "flower"),
},
```

No other changes needed — the carousel maps the array.

### 4.4 Enable dark mode

1. The theme CSS is already merged into `app/globals.css` (`:root`/`.dark`
   blocks came from the old `styles/globals.css`, deleted 27 Sep 2026).
2. Mount the provider (see [Third-Party Integrations](./third-party-integrations.md#️⃣-next-themes-044--installed-provider-written-not-mounted)).
3. Toggle with `useTheme()` from `next-themes`.

### 4.5 Use the `cn()` helper in new components

```tsx
import { cn } from "@/lib/utils"

<div className={cn("rounded-xl p-6", isActive && "bg-indigo-100")} />
```

---

## 5. Build, lint & deploy

```bash
pnpm dev     # dev server + Fast Refresh
pnpm build   # → out/ static export (runs ESLint + tsc; both must pass)
pnpm lint    # eslint . (flat config in eslint.config.mjs)
npx serve out  # serve the static export locally
```

> `next start` does not work with `output: "export"` — there is no Node
> server; serve `out/` with any static file server.

**Deploy to Cloudflare Pages** (current live host): `pnpm build`, then
upload `out/` (dashboard or `wrangler pages deploy out`).
Live: https://animated-clean-toast-carousel.pages.dev

**Deploy to Vercel** (the project's original host):

```bash
pnpm dlx vercel        # first time: link project
pnpm dlx vercel --prod # production deploy
```

Or connect the GitHub repo in the Vercel dashboard — pushes to `main`
auto-deploy. No environment variables are required. `images.unoptimized: true`
is already set, so no image-optimization config is needed.

---

## 6. Troubleshooting

| Symptom | Cause / fix |
|---------|-------------|
| Toast styles missing in production | Was missing `@tailwind` directives in `app/globals.css` — fixed 27 Sep 2026 (directives + shadcn theme merged in, `styles/` deleted) |
| `bg-background` / `text-primary` do nothing | Fixed — the shadcn CSS variables now live in `app/globals.css` (`:root`/`.dark`) |
| `useToast must be used within a ToastProvider` | Component rendered outside `<ToastProvider>` in `demo.tsx` — check tree order |
| Hydration warning after adding next-themes | Add `suppressHydrationWarning` to `<html>` |
| `next lint` reports errors but build passes | No longer possible — builds run ESLint + tsc and fail on errors (strict since 27 Sep 2026) |
| Two toasts vanish together | Was `Date.now()` id collision — fixed with a monotonic counter (§3.1) |
| `pnpm install` slow / huge `node_modules` | 27 unused Radix packages + more — prune per [Third-Party Integrations](./third-party-integrations.md#7-installed-but-completely-unused-cleanup-candidates) |

---

## 7. Tech debt & cleanup suggestions

Numbered by impact; safe to tackle in any order. Items marked ✅ were fixed
during the 27 Sep 2026 audit:

1. ✅ **Delete or rename `app-card.tsx`** — deleted; `carousel.tsx` uses
   `carousel-card.tsx`.
2. ✅ **Import or delete `styles/globals.css`** — merged into `app/globals.css`
   (this also fixed the missing `@tailwind` directives — utilities were never
   generated before).
3. **Mount or delete `components/theme-provider.tsx`** — same story for theming.
4. **Prune unused dependencies** — see the removal list in
   [Third-Party Integrations](./third-party-integrations.md#7).
5. ✅ **Re-enable build checks** — `ignoreDuringBuilds` / `ignoreBuildErrors`
   flipped to `false`; the strict build immediately caught a real
   `LucideIcon` type error in `carousel.tsx` (fixed by tightening
   `CarouselProps`).
6. ✅ **Register `autoprefixer`** in `postcss.config.mjs`.
7. **Move root components** (`carousel.tsx`, `demo.tsx`, …) into
   `components/` and switch imports to `@/` aliases for a conventional layout.
8. **Rename package** `my-v0-project` → `animated-clean-toast-carousel`.
9. ✅ **Unique toast ids** — `Date.now()` replaced with a monotonic counter.
10. ✅ **Add a close button** to toasts — done; pause-on-hover still open.

---

## 8. Conventions for new code

- `"use client"` at the top of every interactive component (the app has no
  server components today; keep the directive explicit).
- `import type` for type-only imports (`isolatedModules` requires it).
- Prefer `@/` aliases over long relative paths.
- Icons: import individual icons from `lucide-react` (tree-shaking).
- Animations: framer-motion springs for enter/exit; `tailwindcss-animate`
  utilities for simple CSS loops.
- Never commit `.env.local` (already gitignored); document new variables in
  `.env.example` and [Environment & Configuration](./environment-and-configuration.md).
