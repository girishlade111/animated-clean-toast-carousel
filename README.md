# Animated Clean Toast Carousel

[![Next.js](https://img.shields.io/badge/Next.js-15.2.4-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38BDF8?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![Framer Motion](https://img.shields.io/badge/Framer_Motion-spring-FF0080?style=for-the-badge&logo=framer&logoColor=white)](https://motion.dev/)
[![Deployed on Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-black?style=for-the-badge&logo=vercel)](https://vercel.com/gileb64375-5584s-projects/v0-animated-clean-toast-carousel)

A polished, animation-first UI demo: a **spring-physics toast notification
system** paired with a **scroll-snap card carousel**, built with Next.js 15,
React 19, Tailwind CSS, and Framer Motion. Click a card → a toast pops up
with a bouncy entrance, auto-dismisses after 3 seconds, and exits with a
shrink animation.

The bundled demo is a *"Flowers & Saints"* showcase — 12 cards alternating
flower symbolism and patron saints, each firing a themed toast — but the
toast system and carousel are fully generic and reusable.

> **New here?** Start with the [Developer Guide](./docs/developer-guide.md)
> (setup + architecture + recipes). Deep references:
> [Environment & Configuration](./docs/environment-and-configuration.md) ·
> [Third-Party Integrations](./docs/third-party-integrations.md)

---

## ✨ Features

- **🔔 Animated toast system** — context-based (`ToastProvider` + `useToast`
  hook), 4 built-in types (`flower`, `saint`, `warning`, `info`), each with
  its own Lucide icon and accent color.
- **🌀 Spring-physics motion** — Framer Motion springs
  (`stiffness: 500, damping: 40`) for enter/exit; `AnimatePresence` keeps exit
  animations smooth when toasts dismiss.
- **⏱️ Auto-dismiss** — toasts self-remove after 3 seconds (configurable).
- **🎠 Snap carousel** — horizontal scroll-snap track, hidden scrollbars,
  auto-appearing glassmorphism nav arrows, smooth half-viewport scrolling.
- **🃏 Interactive cards** — hover lift (`y: -5`) and tap press
  (`scale: 0.95`) micro-interactions on every card.
- **🔤 Self-hosted font** — Figtree via `next/font/google` (zero runtime
  font requests, no layout shift).
- **🎨 shadcn-ready** — `components.json` configured (neutral base,
  CSS variables, `@/` aliases, Lucide icons); `pnpm dlx shadcn@latest add <x>`
  works out of the box.
- **0️⃣ Zero-config runtime** — no `.env`, no database, no API keys.
  `pnpm install && pnpm dev` just works.

---

## 🛠️ Tech stack

| Layer | Technology | Version |
|-------|-----------|---------|
| Framework | Next.js (App Router) | 15.2.4 |
| UI library | React + React DOM | 19 |
| Language | TypeScript (strict) | 5 |
| Styling | Tailwind CSS + PostCSS | 3.4.17 / 8.5 |
| Animation | Framer Motion | latest |
| Icons | Lucide React | ^0.454.0 |
| Font | Figtree (`next/font/google`) | — |
| Theming (ready) | next-themes | ^0.4.4 |
| Analytics (ready) | @vercel/analytics | 1.3.1 |
| Utils | clsx, tailwind-merge, tailwindcss-animate | — |
| Package manager | pnpm (lockfile committed) | ≥ 8 |

Full per-package breakdown — what's wired, what's installed-but-unused, and
cleanup candidates — in [Third-Party Integrations](./docs/third-party-integrations.md).

---

## 🚀 Quick start

**Prerequisites:** Node.js ≥ 18.18, pnpm ≥ 8.

```bash
git clone https://github.com/girishlade111/animated-clean-toast-carousel.git
cd animated-clean-toast-carousel
pnpm install
pnpm dev
```

Open **http://localhost:3000** — click any card and watch the toasts.

| Script | Command | Purpose |
|--------|---------|---------|
| `pnpm dev` | `next dev` | Dev server with Fast Refresh |
| `pnpm build` | `next build` | Production build → `.next/` |
| `pnpm start` | `next start` | Serve the production build |
| `pnpm lint` | `next lint` | ESLint |

No environment variables are needed. If you add an integration that needs
them, copy `.env.example` → `.env.local` and follow the conventions
documented in [Environment & Configuration](./docs/environment-and-configuration.md).

---

## 📁 Project structure

```
├── app/
│   ├── layout.tsx        # root layout — Figtree font, metadata
│   ├── page.tsx          # "/" route → <Demo />
│   └── globals.css       # live stylesheet (Figtree base + .font-figtree)
├── components/
│   └── theme-provider.tsx# next-themes wrapper (not mounted yet)
├── lib/
│   └── utils.ts          # cn() class-name helper
├── public/               # static assets
├── styles/
│   └── globals.css       # shadcn theme variables (not imported yet)
├── docs/
│   ├── developer-guide.md
│   ├── environment-and-configuration.md
│   └── third-party-integrations.md
├── animated-toast.tsx    # <AnimatedToast> + <ToastContainer>
├── toast-context.tsx     # <ToastProvider> + useToast()
├── carousel.tsx          # scroll-snap carousel + nav arrows
├── carousel-card.tsx     # card used by the carousel
├── demo.tsx              # demo page: 12 items + providers
├── app-card.tsx          # unused dark card variant
├── components.json       # shadcn/ui config
├── next.config.mjs       # Next.js config
├── tailwind.config.ts    # Tailwind theme (CSS-var palette)
├── tsconfig.json         # strict TS, @/* path alias
└── postcss.config.mjs
```

> **Note:** the interactive components live at the repo root (a v0
> convention). The Tailwind `content` config includes the root glob
> `'*.{js,ts,jsx,tsx,mdx}'` so their classes survive production purging —
> don't remove it.

---

## 🧠 How it works

```
page.tsx → Demo (toast-context.tsx: ToastProvider)
              ├── Carousel (carousel.tsx) → AppCard (carousel-card.tsx)
              │       └── click → addToast(message, type)
              └── ToastContainer (animated-toast.tsx)
                      └── toasts.map → AnimatedToast
                              └── 3s timer → removeToast(id) → exit animation
```

**Toast flow.** `addToast()` appends `{ id, message, type }` to context state.
`ToastContainer` renders the stack inside `<AnimatePresence>` at
`fixed bottom-4 right-4`. Each toast arms a 3-second timer that calls
`removeToast()`, and Framer Motion plays the spring exit (`opacity → 0,
y → 20, scale → 0.5`).

**Carousel flow.** A flex row with `scroll-snap-type: x mandatory` and hidden
scrollbars. Scroll position drives `canScrollLeft/Right`, which fade the
glass nav arrows in/out. Arrow clicks smooth-scroll by half the viewport.

Details, animation specs, and known quirks (toast id collisions, the
`carouselRef.current` effect dep) are covered in the
[Developer Guide](./docs/developer-guide.md#3-architecture--data-flow).

---

## 🎨 Customization

**Add a toast type** — extend the union in `toast-context.tsx`, add an
icon/color entry in `animated-toast.tsx`, then `addToast("Saved!", "success")`.
([step-by-step](./docs/developer-guide.md#41-add-a-new-toast-type))

**Change toast timing/position** — the `3000`ms timeout and
`fixed bottom-4 right-4` classes in `animated-toast.tsx`.

**Add carousel items** — append to the `items` array in `demo.tsx`
(icon + title + description + `action`).

**Theme the app** — edit the HSL CSS variables in `styles/globals.css`
(`:root` / `.dark`), import the file in `app/layout.tsx`, and mount the
`ThemeProvider` for class-based dark mode.
([guide](./docs/developer-guide.md#44-enable-dark-mode))

**Scaffold shadcn components** — `pnpm dlx shadcn@latest add button`
(aliases and style come from `components.json`).

---

## ⚙️ Configuration

| File | Purpose | Docs |
|------|---------|------|
| `next.config.mjs` | Build behavior: skips ESLint/tsc in builds, unoptimized images | [§3](./docs/environment-and-configuration.md#3-nextconfigmjs) |
| `tsconfig.json` | Strict TS, `@/*` alias, bundler resolution | [§4](./docs/environment-and-configuration.md#4-tsconfigjson) |
| `tailwind.config.ts` | Class dark mode, CSS-var palette, accordion keyframes, `tailwindcss-animate` | [§5](./docs/environment-and-configuration.md#5-tailwindconfigts-tailwind-css-v34) |
| `postcss.config.mjs` | Tailwind PostCSS plugin (autoprefixer installed but not registered — see note) | [§6](./docs/environment-and-configuration.md#6-postcssconfigmjs) |
| `components.json` | shadcn/ui codegen settings | [§7](./docs/environment-and-configuration.md#7-componentsjson-shadcnui) |
| `.env.example` | Env template (project needs none today) | [§1](./docs/environment-and-configuration.md#1-environment-variables-env) |

---

## ☁️ Deployment

**Vercel** (recommended — the project's original host):

```bash
pnpm dlx vercel --prod
```

or connect the repo in the Vercel dashboard for auto-deploys on push to
`main`. No environment variables required. `images.unoptimized: true` is
already set, so no image-optimization config is needed.

The live demo: https://vercel.com/gileb64375-5584s-projects/v0-animated-clean-toast-carousel

---

## ⚠️ Known limitations

- **Dead code ships with the template:** `app-card.tsx` (duplicate card),
  `styles/globals.css` (unimported theme), `components/theme-provider.tsx`
  (unmounted), and ~40 installed-but-unused packages (Radix suite, Sonner,
  Embla, …). See [cleanup candidates](./docs/third-party-integrations.md#7-installed-but-completely-unused-cleanup-candidates).
- **Builds skip lint and type checks** (`next.config.mjs`) — flip the flags
  for production hardening.
- **Toast ids use `Date.now()`** — can collide under burst firing.
- **No close button / pause-on-hover** on toasts yet.

The full tech-debt list with fixes is in the
[Developer Guide](./docs/developer-guide.md#7-tech-debt--cleanup-suggestions).

---

## 🤝 Contributing

1. Fork / branch off `main`.
2. `pnpm install && pnpm dev`.
3. Keep components typed (`strict` TS), use `import type` for types, prefer
   `@/` aliases and the `cn()` helper.
4. Document new env vars in `.env.example`.
5. Open a PR with a clear description.

> **v0 sync note:** this repo was generated with v0.app, whose original setup
> auto-pushes v0 deployments to this repository. Pull before pushing and avoid
> force-pushes to prevent conflicts with v0-synced commits.

---

## 📄 License

No license file ships with this repo yet. Until one is added, all rights are
reserved by the author — open an issue if you need one (MIT recommended for
a demo template).

---

## 🙏 Credits

Built with ❤ by **Girish Lade** — [ladestack.in](https://ladestack.in)

Originally generated with [v0.app](https://v0.app) and deployed on Vercel.
Animation via [Framer Motion](https://motion.dev), icons via
[Lucide](https://lucide.dev), UI foundations via [shadcn/ui](https://ui.shadcn.com).
