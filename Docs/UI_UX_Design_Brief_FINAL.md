# LOCAL CONNECT — UI/UX DESIGN BRIEF (FINAL)

**Document Type:** Visual Design System + Implementation-Ready UI/UX Brief
**Status:** Final. Supersedes both UI/UX Design Brief V1 and the intermediate V2 draft.
**Still governs (unchanged):** PRD, TRD, App/Web Flow, Backend Schema, Implementation Plan, Post-Revision Verification Report
**Scope:** Hackathon MVP, implementation-ready for Antigravity/vibe coding

---

## 0. What This Document Is

V1 defined Local Connect's product UX correctly: the information hierarchy, the screen inventory, the trust model's display logic, the NEED → MATCH → CONNECT behavior, and the accessibility baseline. None of that was wrong — it was untested on visual direction, not broken.

This document keeps every one of those product decisions and replaces the **visual system** around them: color, typography, spacing, layout composition, and a new controlled motion system built on selected React Bits components. Where V1's product/UX content is restated here, it is restated **because implementers need it in the same document as the new visual direction**, not because it changed.

**Golden rule for the whole document:** everything below is a *visual* revision. If a section here ever seems to imply a change to matching logic, trust computation, data model, or user flow, that implication is wrong — defer to PRD/TRD/Backend Schema/App-Web-Flow, which remain the source of truth for product behavior.

### 0.1 What changed from the V2 draft

An independent verification pass (`ai-doc-verifier`, full report: `verification-report-v2.md`) found that the V2 draft declared V1's green-primary direction "removed" in its own text but never actually overrode the specific V1 passages that still specified it — meaning V1 and V2 gave opposing instructions for the same components with no resolution mechanism. This version fixes that at the root instead of patching around it: **§7A (Inputs & Chips) and §8A (Screen States) are new sections that did not exist in V2**, added specifically to give every component V1 previously specified in green a real, complete replacement in this document — not just a note saying it's superseded.

**Explicit overrides — this document replaces these V1 passages in full; do not implement from them:**

| V1 location | What it said | Replaced by |
|---|---|---|
| §5, "Controlled green accent" | Green listed as a core visual-direction element | §2.3, §3.1 (blue/black/warm-white system) |
| §6 "Color System" | "Primary brand direction should be deep green + warm neutral" | §3.1 |
| §12 "Buttons" | "Deep green filled button" for the primary CTA | §7 |
| §13 "Inputs" | "Focus ring in primary green" | §7A |
| §21 Navigation | "Active State: Use brand green" | §6 |

Two further fixes from the same verification pass, neither related to color direction: `color.neutral.border` was originally assigned to input outlines at a contrast ratio that fails WCAG 2.2 SC 1.4.11 — split into a decorative token and a separate `color.neutral.borderInteractive` that passes (§3.1). The Trust Score display label was corrected from "Profile Complete" back to the canonical "Profile Completeness" (TRD §9.2) to avoid implying a binary state where the underlying factor is graduated (§8, Trust Details).

---

## 1. Context & Goals

Local Connect is a hyperlocal, AI-powered trust and service-discovery PWA built around one loop: **NEED → MATCH → CONNECT**. V2's visual goal is to make that loop feel like a confident, premium, editorial consumer product — not a generic SaaS dashboard, not an AI-gradient demo, not a marketplace grid. The visual language is inspired by REKKI's typography-led, high-contrast, black/white/electric-blue composition — reinterpreted, not copied, into a distinct Local Connect system.

---

## 2. Brand Identity

### 2.1 Brand Principle

The visual identity communicates: human connection, local discovery, intelligent matching, trust, confidence, modern technology, premium consumer product. Every visual decision in this document is a test against those seven words — if a treatment doesn't serve at least one of them, cut it.

### 2.2 Logo System

**The approved logo is fixed and is not being redesigned by this document.** It consists of a glossy, 3D emoji-style handshake icon (gold/yellow hands, periwinkle-blue shirt cuffs with a small button/rivet detail) paired with a two-part wordmark: **"local"** set in a heavy, rounded, solid blue sans-serif, running directly into **"connect"** set in a lighter-weight, elegant blue italic serif — a deliberate weight-and-style contrast where "local" reads grounded and "connect" reads warm and personal. Below the wordmark, the tagline **"need → match → connect"** runs in a small, evenly tracked blue sans-serif, lowercase, using simple right-arrow (→) glyphs as separators.

This document does not alter the handshake, the wordmark treatment, or the tagline typography. It only specifies **usage rules**.

| Usage | Rule |
|---|---|
| **Primary logo** | Full lockup (handshake + wordmark + tagline). Use in hero moments, splash/loading screens, About/footer, marketing surfaces. |
| **Compact logo** | Handshake + wordmark, tagline dropped. Use in navigation headers, cards, anywhere vertical space is constrained. |
| **Symbol-only** | Handshake icon alone. Use for app icon, favicon, loading spinners, small avatars/badges where the wordmark would be illegible. |
| **Horizontal lockup** | Handshake to the left of the wordmark (not stacked). Use in desktop navigation bars and wide headers. |
| **Mobile/PWA usage** | Symbol-only for the home-screen icon and splash; compact logo for in-app header (single row, left-aligned, ~24–28px icon height). |
| **Favicon** | Symbol-only, simplified to remain legible at 16×16/32×32 — this simplified favicon variant does not exist yet and must be supplied/approved separately; do not derive it ad hoc during implementation. |
| **Dark-background usage** | **Flag, don't invent:** the supplied logo asset is rendered in deep blue on a white/transparent background. Its contrast and legibility on the new Black/Deep Ink surface (§3.1) has not been verified. Request or produce an approved light/reversed variant before placing the logo on dark surfaces — do not auto-invert it in code. |
| **Light-background usage** | Use as supplied, on Warm White or Surface backgrounds. This is the default, verified use case. |
| **Clear space** | Minimum clear space on all sides = the height of the handshake icon in that lockup. Nothing (text, edges, other UI) may enter that zone. |
| **Minimum size** | Horizontal/primary lockup: do not render narrower than 120px wide. Symbol-only: do not render smaller than 24×24px (32×32px recommended minimum for tap-adjacent placements). |
| **Aspect-ratio preservation** | Never stretch, skew, or independently scale the icon and wordmark. Scale the lockup as a single unit. |

### 2.3 What Changed From V1

> **Color direction — explicit removal.** V1's deep-green-as-primary-brand direction is removed entirely. Green is retained **only** as the semantic Success color (§3.1) — it must never again be used as a primary brand, CTA, or navigation color.
>
> **Typography — explicit removal.** V1's Plus Jakarta Sans / strict-8px-grid system is replaced by the system in §3.2–§3.3. This is a like-for-like swap: same rigor, different character.

---

## 3. Design Tokens — Foundations

All component guidance in this document references **semantic token names**, never raw hex/px values. The tables below are where those tokens are defined once — implementation should generate CSS variables / a theme object directly from these tables, and nothing downstream should hardcode a color or size that already has a token.

### 3.1 Color System

**Primary brand direction: Black / Warm White / Electric Blue.** Blue is used *strategically*, not everywhere — see the usage rule at the end of this table.

| Token | Value | Role |
|---|---|---|
| `color.brand.primary` | `#0047FF` | Primary CTA, active states, key interactions, match/connection emphasis, brand accents |
| `color.brand.hover` | `#0038CC` | Hover state for primary-blue elements |
| `color.brand.active` | `#002B99` | Pressed/active state for primary-blue elements |
| `color.brand.soft` | `#E6EDFF` | Soft blue backgrounds — badges, selected chips, subtle highlight fields |
| `color.neutral.ink` | `#0B0B0C` | Black / Deep Ink — primary text, dark surfaces, high-contrast blocks |
| `color.neutral.warmWhite` | `#FAFAF8` | Page background — off-white, not stark white |
| `color.neutral.surface` | `#FFFFFF` | Card/panel surfaces sitting on Warm White |
| `color.neutral.mutedSurface` | `#F1F1EF` | Secondary panels, disabled fields, subtle section breaks |
| `color.neutral.textSecondary` | `#5C5C61` | Supporting text, metadata, timestamps |
| `color.neutral.border` | `#E3E3E0` | **Decorative only** — dividers, hairlines, section breaks. Contrast against `warmWhite` is 1.23:1; do not use for anything an interactive component depends on to be identified. |
| `color.neutral.borderInteractive` | `#8A8A86` | **Input outlines, and any interactive component boundary that is the sole cue identifying it.** 3.32:1 against `warmWhite`, 3.47:1 against `surface` — meets WCAG 2.2 SC 1.4.11 (Non-Text Contrast, 3:1 minimum). This is a fix from V2: `color.neutral.border` was previously assigned to input outlines at 1.23:1, which fails SC 1.4.11 for exactly that use. |
| `color.semantic.success` | `#1B8A5A` | Confirmations, completed states, positive trust signals — **not** a brand color |
| `color.semantic.warning` | `#C77700` | Caution states, pending confirmations |
| `color.semantic.error` | `#D92D20` | Errors, destructive actions, declined states |
| `color.semantic.info` | `#0047FF` (= `color.brand.primary`) | Informational callouts — reuses brand blue rather than adding a near-duplicate token |

**Derivation note:** `color.brand.primary` is inspired by the REKKI reference's extracted `#0000EE` / `#0063E1`, tuned for AA contrast against Warm White and for visual harmony with the approved logo's existing blue. **This exact hex has not been color-matched against the actual logo file** (only a compressed preview was available) — verify and adjust `color.brand.primary` against the real logo asset during implementation before this token is treated as final.

**Contrast verification (computed, not estimated):** `color.brand.primary` on `warmWhite` = 6.01:1; on `surface` = 6.28:1; white text on `color.brand.primary` = 6.28:1 — all comfortably pass AA. `color.neutral.borderInteractive` on `warmWhite` = 3.32:1; on `surface` = 3.47:1 — passes SC 1.4.11. `color.neutral.border` intentionally does not pass and must never be used for an interactive boundary.

**Usage rule:** the majority of every screen is Black/Deep Ink text on Warm White/Surface. Blue is reserved for: primary CTA, active/selected state, links where appropriate, the match-score moment, trust/connection emphasis, and brand marks. If more than roughly 10–15% of a screen's surface area is blue, that's a signal the screen has drifted from "strategic accent" toward "decorative," and should be revisited.

### 3.2 Typography System

**One type family for interface text.** Recommend a geometric/grotesk sans with strong display weights and confident numerals — e.g. **Inter, General Sans, or Neue Montreal** as production-available substitutes (this is a *character* recommendation inspired by the REKKI reference's sans-serif, high-contrast system, not a claim to any proprietary REKKI font). Do not introduce a second interface font. The logo's bespoke wordmark typography (bold sans + italic serif, §2.2) is brand-mark-only and is never used for body copy, headings, or UI text — it appears exactly once per screen, in the logo itself.

| Token | Size | Weight | Line-height | Tracking | Use |
|---|---:|---:|---:|---|---|
| `type.displayXl` | 64px | 800 | 1.0 | −1.5% | Hero moments only — Home's "What do you need?", major section openers |
| `type.display` | 48px | 700 | 1.05 | −1% | Secondary display moments — section headers on Tier 1 screens |
| `type.h1` | 34px | 700 | 1.15 | −0.5% | Screen-level titles |
| `type.h2` | 26px | 600 | 1.25 | normal | Section titles within a screen |
| `type.h3` | 20px | 600 | 1.3 | normal | Subsection/card titles |
| `type.bodyLarge` | 17px | 400 | 1.6 | normal | Lead paragraphs, provider bios, primary readable content |
| `type.body` | 15px | 400 | 1.6 | normal | Default body text, base size |
| `type.small` | 13px | 400 | 1.45 | normal | Metadata, secondary labels, timestamps |
| `type.caption` | 12px | 400 | 1.4 | +2% | Fine print, legal, micro-labels — uppercase optional |
| `type.navigation` | 14px | 500 | 1.3 | normal | Nav items, tabs |
| `type.button` | 15px | 600 | 1.2 | normal | All button labels |

**Scale reasoning:** the REKKI extraction's 12/13/15/16/18/20/24/56px scale is the inspiration for density and the display-to-body contrast ratio, not a value set to copy directly — this system keeps that same character (compact body text, an oversized display step) while completing it into a coherent 11-step scale with defined weights and line-heights, which the raw extraction didn't specify beyond size. Display XL is set to 64px rather than the reference's 56px specifically for the Home hero moment, where the brief calls for the boldest, most editorial display treatment in the product.

**Avoid:** more than one interface typeface; more than 11 defined steps; any one-off font-size not listed here.

### 3.3 Spacing System

Base unit: **4px**. The scale below keeps the reference's clearly intentional anchor values (12, 20, 24, 32) and completes them into a coherent 4px-multiple system — the reference's 13/14/37/39px values read as incidental measurements from the source site's specific implementation rather than deliberate design decisions, and are not carried forward literally.

| Token | Value | Use |
|---|---:|---|
| `space.micro.1` | 4px | Icon-to-label gaps, tight chip padding |
| `space.micro.2` | 8px | Small internal gaps, icon spacing |
| `space.component.1` | 12px | Compact component padding (chips, small buttons) |
| `space.component.2` | 16px | Standard component padding (buttons, inputs, list items) |
| `space.component.3` | 24px | Card internal padding, generous component padding |
| `space.section.1` | 32px | Gap between related content blocks |
| `space.section.2` | 48px | Gap between distinct sections on a screen |
| `space.section.3` | 64px | Major section breaks, especially on desktop |
| `space.hero.1` | 80px | Vertical breathing room around hero compositions (tablet+) |
| `space.hero.2` | 120px | Vertical breathing room around hero compositions (desktop, large desktop) |
| `space.margin.mobile` | 20px | Page margin, mobile |
| `space.margin.tablet` | 32px | Page margin, tablet |
| `space.margin.desktop` | 64px | Page margin, desktop |
| `space.margin.largeDesktop` | 96px | Page margin, large desktop |
| `space.gutter.mobile` | 16px | Grid gutter, mobile |
| `space.gutter.tablet` | 24px | Grid gutter, tablet |
| `space.gutter.desktop` | 32px | Grid gutter, desktop+ |

**The goal is intentional whitespace, not empty space.** Every large gap should be doing a job — separating the "Understanding your need" reveal from the results below it, giving the Trust Score room to be read as evidence rather than decoration, letting a hero headline breathe before the primary input. If a gap can't name the job it's doing, it's probably too big or too arbitrary.

### 3.4 Radius

| Token | Value | Use |
|---|---:|---|
| `radius.xs` | 4px | Inputs, chips, small tags |
| `radius.sm` | 8px | Buttons, small cards |
| `radius.md` | 16px | Large cards, bottom sheets, modals |
| `radius.full` | 9999px | Avatars, pills, circular badges |

**Reinterpretation note:** the reference's `radius.md=59px` / `radius.lg=90px` are almost certainly specific pill-button or avatar measurements at particular component sizes on the source site, not general-purpose tokens — copying them literally would produce oversized, un-editorial rounding everywhere. This scale keeps rounding restrained, consistent with the anti-pattern rule against "excessive rounded cards" (§13).

### 3.5 Elevation

Kept deliberately minimal — the anti-pattern list explicitly prohibits excessive shadows.

| Token | Value | Use |
|---|---|---|
| `elevation.card` | `0 1px 2px rgba(11,11,12,0.06), 0 1px 1px rgba(11,11,12,0.04)` | Cards resting on Warm White |
| `elevation.overlay` | `0 8px 24px rgba(11,11,12,0.12)` | Modals, sheets, dropdowns |
| `elevation.focusRing` | `0 0 0 3px` in `color.brand.soft`, offset 2px | Focus-visible indicator on any interactive element |

### 3.6 Motion Tokens

| Token | Value | Use |
|---|---:|---|
| `motion.duration.fast` | 120ms | Micro-interactions (button press, hover) |
| `motion.duration.base` | 240ms | Standard transitions (reveal, expand) |
| `motion.duration.slow` | 400ms | Hero/section-level motion |
| `motion.easing.standard` | `cubic-bezier(0.2, 0, 0, 1)` | Default easing |
| `motion.easing.entrance` | `cubic-bezier(0.1, 0.9, 0.2, 1)` | Elements entering the viewport |
| `motion.easing.exit` | `cubic-bezier(0.4, 0, 1, 1)` | Elements leaving |

---

## 4. Grid & Layout System

| Breakpoint | Range | Columns | Margin | Gutter |
|---|---|---:|---:|---:|
| Mobile | < 640px | 4 | 20px | 16px |
| Tablet | 640–1023px | 8 | 32px | 24px |
| Desktop | 1024–1439px | 12 | 64px | 32px |
| Large Desktop | ≥ 1440px | 12 (max content width 1280px, centered, with full-bleed exceptions per below) | 96px | 32px |

**Editorial composition patterns** (used deliberately, not everywhere):

- **Asymmetric split** — e.g. a hero with a large left-aligned headline and a narrower right-aligned supporting element, rather than centered stacking. Use on Home and Provider Profile.
- **Full-bleed / edge-to-edge moments** — a section (e.g. a category strip, a community showcase) that ignores the page margin entirely. Use sparingly, at most once or twice per screen, to create rhythm against the otherwise margined content.
- **Controlled max-width content column** — for reading-heavy content (provider bios, trust explanations), cap line length independent of the full grid width, even on large desktop.
- **Strong horizontal rhythm** — consistent section-to-section vertical spacing (`space.section.*`) so the page has a predictable beat even when individual sections vary in composition.

**Usability constraint that overrides all of the above:** no layout experiment may reduce a tap target below 44×44px, break reading order, or require horizontal scrolling on mobile. Editorial ambition stops at the accessibility floor (§10).

---

## 5. Motion & React Bits System

### 5.1 Classification

| Category | Components |
|---|---|
| **1. Hero / Brand Moments** | Masked Heading, Circular Text, Text Pressure, Large Loop |
| **2. Scroll Storytelling** | Scroll Expand, Curved Loop, Scroll Velocity, Gradual Blur |
| **3. Navigation** | Card Nav, Staggered Menu |
| **4. Content Discovery** | Depth Carousel, Drift Wall, Orbit Images |
| **5. Micro-Interactions** | Specular Button, Border Glow, Image Trail |
| **6. Optional / P2** | Circular Text, Image Trail, Orbit Images, Text Pressure *(cross-listed — see tier column below; these four are the first cuts under time pressure)* |

### 5.2 Component Directory

Every row: classification tier, usage, and reduced-motion fallback. **CORE** = load-bearing to the intended experience, build it. **OPTIONAL** = strengthens the story if time allows, ship without it if not. **P2** = nice-to-have, cut first under time pressure.

| Component | Category | Tier | Intended Use | Reduced-Motion Fallback |
|---|---|---|---|---|
| **Masked Heading** | Hero/Brand | **CORE** | Home hero "What do you need?"; AI parsing reveal ("Understanding your need" → structured chips) | Instant text render, no mask animation |
| **Text Pressure** | Hero/Brand | OPTIONAL | One large editorial hero/brand moment (e.g. Home headline weight response to interaction) — must stay accessible and performance-conscious per the source instruction | Static weight, no pressure-response interaction |
| **Circular Text** | Hero/Brand | P2 | A single subtle brand/section moment only if it demonstrably improves composition — not a default | Static horizontal text label |
| **Large Loop** | Hero/Brand | OPTIONAL | One brand storytelling section (e.g. an About/trust-story moment) — never as background decoration | Static single frame |
| **Scroll Expand** | Scroll Storytelling | **CORE** | The major NEED → MATCH transition, or hero-to-discovery transition on Home/Match Results | Instant state change, no scroll-linked expansion |
| **Curved Loop** | Scroll Storytelling | OPTIONAL | Secondary storytelling section or category movement (e.g. service-category showcase) | Static row layout |
| **Scroll Velocity** | Scroll Storytelling | OPTIONAL | Horizontally moving category/service content — used sparingly, at most one instance per screen | Static horizontal scroll (native, user-controlled) |
| **Gradual Blur** | Scroll Storytelling | OPTIONAL | Controlled section/page transitions, image reveal | Instant crossfade or hard cut |
| **Card Nav** | Navigation | OPTIONAL | Discovery/category navigation, if it doesn't compromise scan speed | Standard link list |
| **Staggered Menu** | Navigation | OPTIONAL | Mobile/compact navigation — only if it measurably improves the experience over a standard drawer | Standard instant-open mobile menu |
| **Depth Carousel** | Content Discovery | OPTIONAL | Provider/local-service discovery, only if it improves comparison and never hides match/trust information | Standard horizontal list/grid |
| **Drift Wall** | Content Discovery | OPTIONAL | Community/provider showcase (e.g. "recently connected nearby") if it stays performant and accessible | Static grid |
| **Orbit Images** | Content Discovery | P2 | One carefully chosen local-community visual section, only if it strengthens the story | Static image cluster |
| **Specular Button** | Micro-interactions | **CORE** | Primary "Find Matches" and "Connect" CTAs — the treatment must stay subtle, never a distraction from the CTA's label | Solid `color.brand.primary` button, no specular sweep |
| **Border Glow** | Micro-interactions | P2 | Focus/active/brand moments only — used extremely selectively, not as a general focus style (focus-visible uses `elevation.focusRing`, §3.5, not Border Glow) | No glow; standard focus ring |
| **Image Trail** | Micro-interactions | P2 | One deliberate desktop-only visual interaction. Never load on mobile; never required for navigation or core functionality | Static image, no trail |

### 5.3 Motion Principles

Motion exists to reinforce **NEED → MATCH → CONNECT** — hierarchy, transition, discovery, confirmation, responsiveness. It must never become the product.

| Trigger | Duration token | Easing token | Purpose |
|---|---|---|---|
| Element enters viewport (scroll) | `motion.duration.base` | `motion.easing.entrance` | Reveal, not distract |
| Hero/brand moment on load | `motion.duration.slow` | `motion.easing.entrance` | One-time confident introduction |
| Button/control interaction | `motion.duration.fast` | `motion.easing.standard` | Immediate, responsive feedback |
| Section/page transition | `motion.duration.base` | `motion.easing.standard` | Continuity between states |
| Element exiting/dismissing | `motion.duration.fast` | `motion.easing.exit` | Quick, doesn't linger |

**Explicitly prohibited:** constant/infinite animation loops, parallax that isn't user-scroll-driven, unnecessary 3D transforms, exaggerated spring physics, motion running behind readable text, motion that blocks or delays interaction, dashboard-style animation-everywhere treatment.

**`prefers-reduced-motion` is mandatory, not best-effort.** Every component in §5.2 has a defined static fallback; when the media query is set, the fallback is what ships — not a "reduced" version of the animation, but its absence.

### 5.4 Loading & Performance Rules for Motion

- No React Bits component is imported globally. Each is code-split and loaded only on the screen/route that uses it.
- Scroll-linked components (Scroll Expand, Scroll Velocity, Curved Loop) must throttle/debounce their scroll listeners and disconnect observers on unmount — no orphaned listeners across route changes.
- Any canvas/WebGL-based effect (if a chosen component uses one) must have an explicit mobile fallback that avoids the canvas entirely, not a scaled-down canvas.
- GPU-heavy effects (Orbit Images, Drift Wall, Image Trail) are desktop-only by default; do not attempt a "lighter mobile version" of these three — use the static fallback on mobile outright.

---

## 6. Navigation

**Desktop:** `Logo (horizontal lockup) — Home — Discover — Post a Need — Requests` left/center; `Location — Profile` right. Single row, `type.navigation`, no dropdown mega-menus.

**Mobile:** Bottom bar — `Home — Discover — Requests — Profile` (4 items, matches V1's inventory exactly). Staggered Menu (§5.2) may replace a secondary/overflow menu if used, but the primary 4-item bottom bar is not a candidate for animated replacement — it must always be instantly available.

**States (both):** default, active (current route — `color.brand.primary` underline or fill, never color-only per §10), hover (desktop), focus-visible (`elevation.focusRing`).

---

## 7. Buttons & Core Actions

| Role | Label example | Treatment |
|---|---|---|
| Primary CTA | "Find Matches →" | `color.brand.primary` fill, Specular Button treatment (CORE, subtle) |
| Connect CTA | "Connect" | Same primary treatment — this and "Find Matches" are the two moments Specular Button is used for, not general-purpose |
| Secondary | "View Profile" | Outlined, `color.neutral.borderInteractive`, `color.neutral.ink` text |

**States required for every button:** default, hover, focus-visible, active, disabled, loading, success, error. Loading/success/error states communicate via icon + text + color together — never color alone (§10). Not every button gets Specular treatment — restrict it to the two CTAs above; every other button in the product is a plain, high-contrast, unanimated button.

---

## 7A. Inputs & Chips

The Need Input is the primary interaction on Home (§8) and reappears in Requirement Confirmation. **This section fully supersedes V1 §13 ("Inputs") and §14 ("Requirement Chips")** — V1 specified "Focus ring in primary green," which no longer exists as a token in this system (§2.3); this section replaces that specification rather than sitting alongside it.

### Need Input (primary field)

| Property | Token / Value |
|---|---|
| Text size | `type.bodyLarge` (17px) |
| Internal padding | `space.component.3` (24px) |
| Border (default) | `color.neutral.borderInteractive`, 1px |
| Border (focus) | `color.brand.primary`, 1.5px, plus `elevation.focusRing` |
| Background | `color.neutral.surface` |
| Placeholder text | `color.neutral.textSecondary` |
| Corner radius | `radius.sm` |
| Submit affordance | Integrated, not visually dominant — the field is the hero, not its button |

Character: a search box / prompt composer, not a traditional form field — V1's original intent, carried forward under the new token system instead of green.

### Requirement Chips

| State | Treatment |
|---|---|
| Default | `color.brand.soft` background, `color.brand.primary` text, `radius.xs` |
| Selected/confirmed | Checkmark in `color.brand.primary`, same background |
| Removable | "×" affordance in `color.neutral.textSecondary`, darkens to `color.neutral.ink` on hover |
| Focus-visible | `elevation.focusRing` |

### States (all inputs)

default · hover · focus-visible · active · disabled (`color.neutral.mutedSurface` background, `color.neutral.textSecondary` text) · error (`color.semantic.error` border at `borderInteractive` weight, message in `type.small`/`color.semantic.error` below the field). App/Web Flow §H owns the validation *rule* ("invalid budgets are rejected"); this section owns the *look*.

---

## 8. Screens — Visual Redesign Direction

Screen inventory, tiers, and information hierarchy are preserved exactly from V1/PRD/App-Web-Flow. What follows is new visual direction per tier.

### Tier 1 — Must Look Excellent

#### 1. Home

**Message:** "What do you need?" (primary) / "Find the right people and services around you." (supporting). Intent-first — the need input is the primary interaction, full stop.

**Composition:** Asymmetric hero — `type.displayXl` headline left-aligned (Masked Heading reveal, CORE), generous `space.hero.2` breathing room on desktop, the need-input field as the singular focal element beneath the headline (not competing with it). Minimal top navigation. Locality shown subtly (small `type.small` line, not a prominent widget). Categories, if shown at all, sit below the fold as a restrained row — never a marketplace grid. This is an editorial homepage, not a storefront.

**Motion:** Masked Heading on load (CORE). Optionally Text Pressure on the headline (OPTIONAL) if it doesn't compromise input-field prominence or performance.

#### 2. AI Need Input / Parsing

**Message:** Stays calm. Reveal sequence: "Understanding your need" → structured chips (`Mathematics ✓`, `Class 10 ✓`, `Female ✓`, `Weekend ✓`, `₹500 ✓`, `≤4 km ✓`).

**Composition:** Single-column, generous vertical rhythm (`space.section.1` between reveal stages). Chips use `radius.xs`, `color.brand.soft` background, `color.brand.primary` text/checkmark.

**Motion:** Masked Heading / sequential reveal for the "Understanding your need" line and each chip (CORE — this is the product's single most important trust-building moment for the AI). **Explicitly prohibited here:** spinning AI brain, chatbot bubbles, robot iconography, fake "thinking" animation loops, purple AI glow — any of these directly contradicts "the AI should not become the visual identity."

#### 3. Requirement Confirmation

**Composition:** Same chip system as above, now editable. `type.h2` "Confirm your requirement," chips in a wrap layout, each with a subtle edit affordance. Primary CTA ("Find Matches →") anchors the bottom, full-width on mobile.

#### 4. Match Results

**Preserve exactly (per PRD/TRD/Backend-Schema/App-Web-Flow, unchanged by this document):** information hierarchy — Match → Provider identity → Service → Trust → Practical information → Action. Match score displayed as **94% Match** in typography (`type.h2`/`type.h1` weight, `color.brand.primary`), **not** a circular gauge — explicitly prohibited by the source brief and consistent with "typography over decoration."

**Composition:** Card list (not a dense dashboard grid), each result card using `elevation.card`, `radius.sm`, generous `space.component.3` internal padding. Trust Score compact form (`Trust 89`, §Trust below) sits directly adjacent to the match score, not buried.

**Motion:** Subtle staggered entrance for result cards (`motion.duration.base`, `motion.easing.entrance`) — reveal only, not decoration. Information must remain immediately scannable; motion never delays the ability to read a result.

#### 5. Provider Profile

**Composition:** Premium human-profile feeling, not a dashboard. Priority order (unchanged from V1): identity → service → locality → trust → availability → pricing → reviews → community recommendations → Connect. Asymmetric split on desktop — photo/identity block left, structured detail right. Real, high-quality provider photography (§9) — careful, restrained treatment, not over-animated.

**Motion:** Minimal — a single entrance transition on load at most. This screen is read, not performed.

#### 6. Trust Details

**Preserve exactly — all 7 canonical Trust Score factors (TRD §9.2, Decision Log #1), no more, no fewer:** Phone Verified, Identity Submitted, Profile Completeness, Rating, Completed Jobs, Community Recommendations, Response Rate. *(Fixed from V2/V1, which both displayed "Profile Complete" — this factor is a graduated 0–100% value, not a binary state, and the label should not imply otherwise.)*

**Composition:** Bottom sheet (mobile, `radius.md`, per §3.4's sheet/modal use case) / expanded panel (desktop). `89 / 100` in `type.display`, then the 7-signal breakdown as a clean list — icon + label + one-line evidence per signal (matching the Post-Revision-Report-updated V1 content exactly). No gamified progress bars, no badges-as-achievements treatment — this is evidence, not a game.

**Motion:** Subtle reveal only, per-signal stagger on sheet open (`motion.duration.fast` per item). Never used to *withhold* information — a screen-reader user or reduced-motion user sees all 7 signals instantly, same content, zero animation.

### Tier 2 — Requests, Provider Dashboard, Provider Onboarding, Post a Need

Same token system, restrained motion (entrance-only, no dedicated hero treatment). Provider Dashboard in particular should resist the pull toward "dashboard" visual clichés (dense metric tiles, colorful chart-everywhere) — keep it in the same editorial, high-contrast language as Tier 1, just denser. Post a Need reuses the same input/confirmation visual pattern as AI Need Input (§8, screens 2–3) per its reuse-based product scope (Implementation Plan Phase 8A) — it should not receive a distinct visual identity.

### Tier 3 — Search, Filters, Map, Saved Providers, Settings

Utility screens. Full token compliance (color, type, spacing), no dedicated motion budget — standard `motion.duration.fast` interaction feedback only.

---

## 8A. Screen States — Loading / Empty / Error

**New in this version.** V1 §42–44 define loading/empty/error *content* (skeleton anatomy, empty-state copy and actions, error-state copy and actions) — that content is unchanged and still governs what each state says. V1 never specified what these states look like, under any color system, including its own. This section closes that gap under the current token system.

### Loading

- Skeleton blocks: `color.neutral.mutedSurface` fill, `radius.sm`, a slow (`motion.duration.slow`) subtle opacity pulse — never a spinner for content-shaped loading. Spinners are reserved for button-level loading states (§7).
- AI Parsing (§8, screen 2) has no separate skeleton: the Masked Heading progressive reveal *is* its loading state.
- Rule carried forward from V1: the interface must never look broken while data is loading — every loading moment has a defined skeleton or reveal treatment.

### Empty

- Headline `type.h3`, supporting line `type.body`, `color.neutral.ink` / `color.neutral.textSecondary`.
- Primary action ("Expand Search," "Build your shortlist") uses the Secondary button treatment (§7) — an empty state proposes an action, it doesn't demand one, so it doesn't carry primary-CTA blue weight.
- No illustration. Consistent with §9's rejection of generic AI-generated illustrations — typography and whitespace carry the moment, not an icon.

### Error

- Error headline in `color.semantic.error`, never `color.brand.primary` — errors must be visually distinct from brand/interactive blue so they're never mistaken for a normal or active state.
- Primary recovery action ("Try Again") uses Primary button treatment; secondary path ("Enter Location Manually") uses Secondary.
- Same rule as inputs (§7A): communicate via icon + text + color together, never color alone.

---

## 9. Images

Use high-quality, real-looking provider photography wherever provider identity is shown. **No generic AI-generated illustrations, no stock-photo-obvious imagery, no illustrated avatars as a default.** React Bits image effects (Orbit Images, Image Trail, Drift Wall, Depth Carousel) are permitted only where they demonstrably improve storytelling, and must never interfere with reading, navigation, accessibility, the primary CTA, or provider comparison — if an effect makes it harder to compare two providers side by side, it doesn't belong on that screen.

---

## 10. Accessibility

Baseline: **WCAG 2.2 AA**, unchanged from V1/original audit requirement.

| Requirement | Rule |
|---|---|
| Contrast | All text/background token pairings in §3.1 must meet AA (4.5:1 body, 3:1 large text/UI components). `color.brand.primary` on `warmWhite`/`surface` and `color.neutral.borderInteractive` on both are verified passing (§3.1) — if any token in §3.1 is adjusted during implementation, re-verify before shipping. `color.neutral.border` (decorative) is intentionally sub-3:1 and must never carry an interactive boundary. |
| Target size | Minimum 44×44px for every interactive element, including inside motion components |
| Focus-visible | `elevation.focusRing` on every interactive element, always — Border Glow is not a substitute for standard focus-visible styling |
| Keyboard | Every component in §5.2, including all "optional" ones, must be fully operable by keyboard if shipped — Card Nav and Staggered Menu specifically need documented keyboard behavior (arrow/tab navigation, escape to close) |
| Touch | Documented touch behavior for Scroll Velocity, Depth Carousel, Image Trail — these must not hijack native scroll/swipe gestures |
| Reduced motion | `prefers-reduced-motion` fallback per §5.2, no exceptions |
| Screen reader | Dynamic states (chip reveal, trust signal reveal, loading/success/error) are announced via `aria-live` where appropriate — content must be present in the DOM and readable regardless of animation state |
| Motion-exclusive information | Never — every state communicated by motion (e.g., a card entering) must already be reachable/understandable without it |

---

## 11. Responsive Design

Desktop receives the richest editorial composition (asymmetric splits, hero motion, full-bleed moments). Mobile receives a **simplified, not shrunk**, equally premium composition — this is not "the same layout at 375px."

| Component | Desktop | Mobile |
|---|---|---|
| Masked Heading | Full hero treatment | Simplified reveal, shorter duration |
| Scroll Expand | Full scroll-linked transition | Instant state change (no scroll-link) |
| Depth Carousel / Drift Wall / Orbit Images | Full effect | Static grid/list — not attempted at reduced fidelity |
| Image Trail | Enabled | Disabled entirely, not loaded |
| Text Pressure | Enabled if used | Static weight |
| Card Nav | Full treatment | Standard link list or Staggered Menu |

General mobile rules: reduce animation complexity across the board, prioritize touch, preserve readability and CTA visibility above all else, no horizontal overflow ever, keep the 4-item bottom navigation simple and un-animated.

---

## 12. Performance

- **Lazy loading:** every React Bits component code-split per-route; nothing in the initial bundle beyond what Home actually uses.
- **Image optimization:** responsive `srcset`, modern formats (WebP/AVIF with fallback), explicit width/height to prevent layout shift.
- **Animation throttling:** scroll-linked effects use `requestAnimationFrame` and are throttled; no effect runs on every scroll-event tick unthrottled.
- **Mobile fallback:** GPU-heavy effects (§5.4) are disabled outright on mobile, not degraded.
- **Canvas/WebGL:** if any chosen component renders via canvas/WebGL, it must be entirely absent from the mobile bundle, not conditionally rendered at runtime (avoid shipping the dependency weight for a path that never executes).
- **Cleanup:** every scroll listener, IntersectionObserver, and animation frame loop is disconnected/cancelled on component unmount — verify this explicitly for Scroll Velocity, Curved Loop, and Drift Wall, which are the most likely to leak.

---

## 13. Anti-Pattern Rules

Explicitly prohibited, no exceptions without a documented product reason:

- Copying REKKI's layouts, branding, exact content, or proprietary assets
- Generic SaaS three-column feature-card hero
- Generic AI dashboard aesthetics
- Purple/neon AI gradients, glassmorphism, floating blobs, excessive shadows, random 3D illustrations
- Excessive icon usage, "AI sparkle" overload
- Giant rounded containers, excessive card usage beyond what §8 specifies
- Animation running everywhere, or decorative motion without a named purpose (§5.3)
- Any React Bits effect that is inaccessible, blocks interaction, or degrades mobile performance
- Fake trust/verification signals (only the 7 canonical, real signals in §Trust Details ever appear)
- Fake AI behavior (spinning brains, chatbot bubbles, thinking-animation loops)
- Motion substituting for information hierarchy rather than reinforcing it
- Deep-green as a brand/primary color anywhere in the product

---

## 14. Implementation Guidance Format

Every component specification produced from this brief (in a future, separate implementation pass — not part of this document) must define:

`purpose · anatomy · variants · visual treatment (tokens only) · typography (tokens only) · spacing (tokens only) · responsive behavior · states · interaction · accessibility · motion · reduced-motion fallback · performance considerations`

No raw hex, px, or ms values in component-level documentation — only token references from §3.

---

## 15. QA Checklist

**Visual**
- [ ] No deep green used as a brand/primary color anywhere
- [ ] Blue occupies a minority, strategic share of each screen's surface area
- [ ] No purple AI gradients, glassmorphism, or floating blobs present

**Typography**
- [ ] Single interface type family used throughout
- [ ] Only the 11 defined `type.*` tokens are used — no one-off sizes
- [ ] Logo wordmark typography never reused for body/UI text

**Spacing**
- [ ] Only `space.*` tokens used — no arbitrary margin/padding values
- [ ] Section-level rhythm is consistent within each screen

**Responsive**
- [ ] No horizontal overflow at any breakpoint
- [ ] Mobile layouts are simplified, not shrunk desktop layouts
- [ ] All four breakpoints (§4) tested

**Accessibility**
- [ ] `color.neutral.borderInteractive` (not `color.neutral.border`) used on every input outline and interactive-only boundary
- [ ] All interactive targets ≥ 44×44px
- [ ] Focus-visible present and consistent (`elevation.focusRing`) on every interactive element

**Screen states**
- [ ] Loading, empty, and error treatments follow §8A on every screen that has them, not just Match Results
- [ ] No screen shows a blank/broken state while data is loading

**Keyboard**
- [ ] Every shipped React Bits component fully keyboard-operable
- [ ] Card Nav / Staggered Menu keyboard behavior documented and tested

**Touch**
- [ ] No component hijacks native scroll/swipe gestures
- [ ] Touch targets tested on real mobile viewport, not just resized desktop

**Motion**
- [ ] Every animated component maps to a named purpose in §5.3
- [ ] No infinite/constant animation loops present
- [ ] Motion never blocks or delays interaction

**Reduced Motion**
- [ ] `prefers-reduced-motion` fallback verified per component in §5.2
- [ ] Fallback is absence of motion, not a "lighter" version of it

**Performance**
- [ ] No React Bits component in the global/initial bundle
- [ ] GPU-heavy effects absent (not degraded) on mobile
- [ ] All scroll listeners/observers verified cleaned up on unmount

**Image loading**
- [ ] Responsive images with explicit dimensions (no layout shift)
- [ ] No generic AI-illustration or obvious stock imagery for providers

**Navigation**
- [ ] Desktop and mobile nav match §6 exactly (item count, order, labels)
- [ ] Bottom mobile nav is instantly available, never gated behind animation

**Need → Match → Connect flow**
- [ ] Information hierarchy on Match Results unchanged from PRD/App-Web-Flow
- [ ] Match score shown as typography, not a circular gauge
- [ ] All 7 canonical Trust Score signals present on Trust Details, nothing added or removed, labeled "Profile Completeness" (not "Profile Complete")

**Brand consistency**
- [ ] No implementation was built by reading V1 §5, §6, §12, §13, or §21 directly — confirm §0.1's override table was used instead
- [ ] Seven brand words (§2.1) checked against each major screen
- [ ] No deep-green or off-brand color drift

**Logo usage**
- [ ] Correct lockup variant (§2.2) used for each context
- [ ] Minimum size and clear-space rules respected
- [ ] No dark-background placement without an approved reversed variant

**React Bits usage**
- [ ] Only CORE and intentionally-included OPTIONAL/P2 components shipped — no unused imports
- [ ] Every shipped component's tier (§5.2) matches what's actually implemented

**No REKKI copying**
- [ ] No REKKI logo, branding, exact layout, exact content, or proprietary asset reproduced anywhere

**No AI-slop patterns**
- [ ] No spinning brain, chatbot bubble, robot icon, or fake-thinking animation
- [ ] No purple/neon AI gradient anywhere in the product
