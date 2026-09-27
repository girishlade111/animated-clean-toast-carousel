# Third-Party Integrations

Every external package in this project: what it's for, where it's actually
used in code, what configuration it needs, and — importantly — which
dependencies are **installed but never used** (there are many; this is a
v0-generated project that ships the whole shadcn kitchen sink).

Legend: ✅ wired & used · ⚠️ installed, partially/not wired · ❌ installed, unused

---

## 1. Core framework

### ✅ Next.js `15.2.4` + React `19` + React DOM `19`

The App Router (`app/` directory) renders everything. Notes:

- `app/page.tsx` is a Client Component (`"use client"`) rendering `<Demo />`.
  There are no Server Components, no Route Handlers, no middleware, no data
  fetching — the app is effectively a static interactive page.
- React 19: no `forwardRef` needed for ref-passing components; the codebase
  doesn't use refs-as-props anywhere, so nothing to migrate.
- No `next.config.mjs` special handling required for these versions.

### ✅ TypeScript `^5` (devDependency)

Strict mode on (`tsconfig.json`), but `next.config.mjs` sets
`typescript.ignoreBuildErrors: true`, so `next build` won't fail on type
errors. See [Environment & Configuration](./environment-and-configuration.md#32-typescriptignorebuilderrors-true).

---

## 2. Animation & icons (actually used)

### ✅ framer-motion (`latest`)

The heart of the "animated" in the project name. Used in 4 files:

| File | Usage |
|------|-------|
| `animated-toast.tsx` | `motion.div` enter/exit spring (`stiffness: 500, damping: 40`), `AnimatePresence` for the toast stack |
| `carousel.tsx` | `motion.div` scroll container, `motion.button` fade for nav arrows wrapped in `AnimatePresence` |
| `carousel-card.tsx` | `whileHover={{ y: -5, boxShadow: … }}`, `whileTap={{ scale: 0.95 }}` |

**Tuning guide** (in `animated-toast.tsx`):

```tsx
transition={{
  type: "spring",
  stiffness: 500,  // higher = snappier entrance
  damping: 40,     // higher = less bounce/overshoot
}}
```

- `initial={{ opacity: 0, y: 50, scale: 0.3 }}` → toast pops up from below.
- `exit={{ opacity: 0, y: 20, scale: 0.5 }}` → shrinks away on dismiss.
- `AnimatePresence` **must** wrap the mapped list or exit animations won't run.

No config needed. Docs: https://motion.dev (formerly framer.com/motion).

### ✅ lucide-react `^0.454.0`

Icon set. Used in 5 files:

- `demo.tsx` — 12 icons for carousel cards: `Flower, Cross, Sun, Moon, Cloud, Umbrella, Wind, Snowflake, Rainbow, Zap, Heart, Star`.
- `animated-toast.tsx` — per-type icons: `flower → Flower`, `saint → Cross`, `warning → AlertTriangle`, `info → Info`.
- `carousel.tsx` — `ChevronLeft`, `ChevronRight` for nav buttons.
- `carousel-card.tsx` — `LucideIcon` type for the `Icon` prop (tightened 27 Sep 2026; `carousel.tsx` previously passed `React.ElementType`, a real type error).

Tree-shaken by the bundler; importing individual icons is the correct pattern.
Docs: https://lucide.dev.

### ✅ next/font (`next/font/google`) — Figtree

In `app/layout.tsx`:

```tsx
import { Figtree } from "next/font/google"
const figtree = Figtree({ subsets: ["latin"] })
// …
<body className={figtree.className}>{children}</body>
```

Self-hosts the font at build time (no Google Fonts request at runtime, no
layout shift). Components additionally use the hand-written `.font-figtree`
CSS class from `app/globals.css`.

---

## 3. Theming & styling utilities

### ⚠️ next-themes `^0.4.4` — installed, provider written, NOT mounted

`components/theme-provider.tsx` exports a `ThemeProvider` wrapping
`next-themes`. **But `app/layout.tsx` never renders it**, so dark mode is
dead code today. To wire it:

```tsx
// app/layout.tsx
import { ThemeProvider } from "@/components/theme-provider"

<html lang="en" suppressHydrationWarning>
  <body className={figtree.className}>
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      {children}
    </ThemeProvider>
  </body>
</html>
```

`suppressHydrationWarning` is required because next-themes mutates the class
attribute on hydration. `tailwind.config.ts` already uses `darkMode: ['class']`
and `app/globals.css` already defines the `.dark` variable set (merged from
the old `styles/globals.css` on 27 Sep 2026) — the only missing piece is
mounting the provider.

### ✅ clsx `^2.1.1` + tailwind-merge `^2.5.5` — `cn()` helper

`lib/utils.ts`:

```ts
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
```

Standard shadcn helper: `clsx` joins conditional classes, `twMerge` resolves
Tailwind conflicts (`cn("p-4", "p-2")` → `"p-2"`). **Currently unused** — no
component imports it. Use it for any new component with conditional classes.

### ❌ class-variance-authority `^0.7.1` — installed, unused

The `cva()` variant API used by shadcn components (e.g. `buttonVariants`).
Nothing calls it yet; it becomes relevant the moment you run
`shadcn add button`.

### ✅ tailwindcss-animate `^1.0.7` — registered as Tailwind plugin

In `tailwind.config.ts`: `plugins: [require('tailwindcss-animate')]`.
Provides `animate-in` / `animate-out` / `fade-in-*` / `slide-in-*` /
`zoom-in-*` utilities. Not used by current components (they use
framer-motion instead); available for CSS-only animations.

---

## 4. Analytics — installed, not wired

### ⚠️ @vercel/analytics `1.3.1`

Page-view / Web-Vitals analytics for Vercel deployments. **Zero code
references it.** To enable, add one line to `app/layout.tsx`:

```tsx
import { Analytics } from "@vercel/analytics/react"

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={figtree.className}>
        {children}
        <Analytics />
      </body>
    </html>
  )
}
```

No env vars, no config, no API keys. Data appears in the Vercel dashboard
under Analytics. Free tier included with any Vercel project.

---

## 5. Font package — installed, not used

### ❌ geist `^1.3.1`

Vercel's Geist font as an npm package (`geist/font/sans`, `geist/font/mono`).
The project uses **Figtree** via `next/font/google` instead; the merged
`app/globals.css` references `var(--font-geist-sans)` / `var(--font-geist-mono)`
in `:root`, but those variables are never defined, so Geist never loads.
Either wire it:

```tsx
import { GeistSans } from "geist/font/sans"
// className={GeistSans.variable} + use var(--font-geist-sans) in CSS
```

…or `pnpm remove geist`.

---

## 6. Dead / duplicate component files — resolved 27 Sep 2026

- **`app-card.tsx`** — was a *second* `AppCard` variant (dark iOS-style,
  `bg-[#1c1c1e]`); nothing imported it. **Deleted.**
- **`styles/globals.css`** — was the full shadcn theme, unimported.
  **Merged into `app/globals.css`** (which also gained the missing `@tailwind`
  directives) and the `styles/` directory was deleted.

---

## 7. Installed but completely unused (cleanup candidates)

These ship in `package.json` with **zero references** in source. They bloat
`node_modules` (~hundreds of MB with Radix) and slow installs. Safe to
`pnpm remove` unless you plan to build forms/dialogs/charts soon:

| Package | Version | What it's for |
|---------|---------|---------------|
| `@radix-ui/react-*` (27 packages) | various | Headless primitives (dialog, dropdown, tabs, …) — shadcn prerequisites |
| `@hookform/resolvers` | `^3.9.1` | Zod/Yup resolvers for react-hook-form |
| `@emotion/is-prop-valid` | `latest` | Emotion's prop filter (transitive dep of some UI libs) |
| `cmdk` | `1.0.4` | Command palette (`<Command />`) |
| `date-fns` | `4.1.0` | Date formatting/manipulation |
| `embla-carousel-react` | `8.5.1` | Carousel engine — note: this project hand-rolled its carousel with scroll-snap + framer-motion instead |
| `input-otp` | `1.4.1` | OTP input |
| `react-day-picker` | `9.8.0` | Calendar/date picker |
| `react-hook-form` | `^7.54.1` | Form state management |
| `react-resizable-panels` | `^2.1.7` | Resizable split panes |
| `recharts` | `2.15.0` | Charts |
| `sonner` | `^1.7.1` | Toast library — note: this project hand-rolled its toast system (`toast-context.tsx` + `animated-toast.tsx`) instead of using Sonner |
| `vaul` | `^0.9.6` | Drawer component |
| `zod` | `^3.24.1` | Schema validation |

**Recommendation:** if the goal is a lean toast+carousel demo, removing the
table above cuts the dependency tree dramatically. If the goal is a shadcn
starter, keep Radix + hook-form + zod (they're the standard shadcn form
stack) and drop the rest.

```bash
# example: strip everything unused except the shadcn form stack
pnpm remove cmdk date-fns embla-carousel-react input-otp react-day-picker \
  react-resizable-panels recharts sonner vaul @emotion/is-prop-valid geist \
  @vercel/analytics class-variance-authority
```

After removing, delete the now-dangling `pnpm-lock.yaml` entries with
`pnpm install --lockfile-only` (or just `pnpm install`).

---

## 8. Integration checklist for new work

- [ ] Need page analytics? → mount `<Analytics />` (§4).
- [ ] Need dark mode? → mount `ThemeProvider` (§3). The `.dark` variable set is already in `app/globals.css`.
- [ ] Need shadcn primitives? → `pnpm dlx shadcn@latest add <component>` (aliases in `components.json`).
- [ ] Need toasts elsewhere? → reuse `ToastProvider`/`useToast` — don't add Sonner alongside the custom system; pick one.
- [ ] Need a "real" carousel (looping, autoplay, drag physics)? → consider wiring `embla-carousel-react` (§7) instead of extending the hand-rolled one.
- [ ] Adding any integration with secrets? → see [Environment & Configuration](./environment-and-configuration.md#1-environment-variables-env).
