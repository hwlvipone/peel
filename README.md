# Peel

A single-level, static character-finding puzzle. Tap a candidate to collect 一 from 二. Pronunciation and game sound are separate controls; game sound preference is stored locally. No network services are used at runtime.

```sh
pnpm install
pnpm dev
pnpm build
```

The production site is written to `dist/`. Progress uses `peel-level-1` (`started` / `completed`); game sound preference uses `peel-sfx-muted`.

## Locked visual system — Night Circuit

- Stage background `#10151D`
- Panel `#1C2530`
- Raised tile `#2C3947`
- Text `#F5F3EB`
- Muted text `#9BAAB4`
- Accent `#F4B95C`
- Success `#80E2B2`
- Miss `#EE7284`
- Border `#394858`
- Shadow `#090D13`
- Secondary shades: opening glow `#263340`, stage glow `#263440`, end glow `#263C3C`, bright edge `#647486`, dashed edge `#657484`, accent depth `#9B6C31`, accent hover `#FFD28A`
- Alpha variants of the accent, success, and shadow colors are used for glow, translucency, and depth; they are defined in the CSS variables.

Fonts are locally hosted Geist (Latin and pinyin) and Noto Serif SC (Han; subset limited to 一 二 三 十 工 土). Reduced-motion users receive instant collection and completion without flight, shake, or idle animation.
