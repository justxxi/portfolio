# justxxi

personal portfolio. aristocratic minimalism.

```bash
npm install
npm run dev
npm run build
npm run preview
```

requires node 22.12+.

## stack

- astro 6.2 (rust compiler, csp, compressHTML, output: static)
- tailwind v4 via postcss (css-first @theme tokens, oklch color space)
- gsap 3.13+ (core, ScrollTrigger, SplitText, CustomEase)
- lenis 1.3.23 (autoRaf: false, gsap ticker integration)
- typescript strict, no any

## structure

```
src/
  layouts/Layout.astro
  pages/index.astro
  components/{Nav,Hero,Work,About,Footer,Cursor}.astro
  styles/global.css
  scripts/animations.ts
public/noscript.css
astro.config.mjs
postcss.config.mjs
tsconfig.json
```

## notes

- tailwind is wired via `@tailwindcss/postcss` (not `@tailwindcss/vite`) due to a known incompatibility between `@tailwindcss/vite@4.x` and astro 6's bundled rolldown-vite (withastro/astro#16542).
- csp is configured under `security.csp` (astro 6 stable api) with explicit allowlist for `fonts.googleapis.com` and `fonts.gstatic.com`.
- `body { opacity: 0 }` is intentional; gsap fades it in. fallback for no-js users via `public/noscript.css`.
- `prefers-reduced-motion: reduce` skips gsap, snaps lenis (lerp: 1), and short-circuits scroll-driven animations.
