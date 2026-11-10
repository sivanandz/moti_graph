---
type: project
created: 2026-07-18
updated: 2026-07-18
---

# Technical Decisions

- Component metadata uses SemVer while the toolkit release keeps CalVer.
- `manifest.json` and `manifest.lock.json` must remain synchronized with component frontmatter.
- Adopted `bangtutorial/bang-motion` into `.agents/skills/bang-motion/` with `bm.ps1` / `bm.sh` CLI wrapper:
  - 6 explainer styles (visual journalism, cartoon collage, white catalog, vintage sketch, continuous action, cartoon stage) and 19 opener concepts added to Socratic Style Gate.
  - Automated headless frame-by-frame MP4 export via Puppeteer/FFmpeg (`bm export`).
  - Remotion hybrid bridge `<BangMotionOverlay />` integrated into `src/StyleMotion.tsx` under `layout: "bang"`.
  - Codified 5 mechanical Anti-PPT invariants (no fading section toggles, max 2 text levels, living background motion, motivated camera scale zoom, persistent visual thread).
