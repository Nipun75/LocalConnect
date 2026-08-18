# LOCAL CONNECT — UI/UX DESIGN BRIEF

**Product:** Local Connect  
**Official Tagline:** **Need → Match → Connect**  
**Product Type:** Hyperlocal AI-powered trust and service discovery PWA  
**Design Priority:** Mobile-first, premium consumer product  
**Target:** Hackathon MVP

> **Design north star:** Make finding a trustworthy local person feel as easy as asking someone you already trust.

---

# 1. Design Vision

Local Connect should feel like a **modern local utility**, not a directory.

The interface should communicate three things immediately:

**I can tell you what I need.**  
**You will find relevant people nearby.**  
**You will show me why I should trust them.**

The visual experience should therefore move users through:

### NEED
Large, human, conversational input.

↓

### MATCH
Fast, structured, explainable recommendations.

↓

### CONNECT
Confident, obvious action to contact/request.

The product should feel:

- Premium
- Calm
- Human
- Local
- Intelligent
- Trustworthy
- Fast
- Practical

It should **not** feel like:

- A generic SaaS dashboard
- A chatbot
- A marketplace clone
- Google Maps with extra cards
- A template assembled from UI components
- An overly rounded AI interface

---

# 2. Product Design Positioning

Local Connect is not primarily a listing platform.

The UI should reinforce:

> **Google helps you search. Local Connect helps you decide whom to trust and connect with.**

The PRD defines the product around natural-language need understanding, hyperlocal matching, explainable recommendations, Trust Score, and community recommendations.

Therefore, these should be the most visually important elements rather than category grids or decorative hero graphics.

---

# 3. Design Principles

## 3.1 Need Before Navigation

Do not make users understand the platform's category structure before they can use it.

The first question should be:

> **What do you need?**

## 3.2 Show Intelligence, Don't Advertise Intelligence

Avoid:

> “✨ AI-powered search”

Instead, demonstrate intelligence through the experience:

> “I understood your request.”

Then show editable requirement chips.

## 3.3 Explain Recommendations

Never show:

> **94% Match**

without explaining why.

The match score must immediately connect to meaningful reasons such as skill, distance, budget, availability, and trust.

## 3.4 Trust Must Be Evidence-Based

The Trust Score should not look like a decorative percentage.

Users need to understand the signals behind it.

Use distinct indicators such as:

- Phone Verified
- Identity Submitted
- Community Recommended
- Profile Verified

Do not falsely imply government/KYC verification.

## 3.5 Locality Should Feel Personal

Use language such as:

- “1.2 km away”
- “Recommended by 12 people nearby”
- “Available this weekend”
- “Popular in your area”

rather than generic marketplace language.

## 3.6 One Primary Action Per Screen

Every major screen should have one obvious next step.

Examples:

- Home → **Describe your need**
- Requirement confirmation → **Find matches**
- Match results → **View provider**
- Provider profile → **Connect**
- Request → **Send request**

## 3.7 Density Over Decoration

Information should be compact enough to compare but spacious enough to scan.

The product should use **information-rich minimalism**.

---

# 4. Brand Direction

## Brand Personality

| Trait | UI Expression |
|---|---|
| Local | Nearby language, locality context |
| Human | Conversational copy |
| Trustworthy | Evidence-based trust signals |
| Smart | Intelligent parsing and ranking |
| Modern | Crisp typography and restrained color |
| Accessible | Strong contrast and readable layouts |
| Helpful | Clear explanations |
| Fast | Low-friction flows |

---

# 5. Visual Direction

## Recommended Aesthetic

**Editorial consumer-tech + local utility**

Think:

- Strong typography
- Warm white surfaces
- Deep neutral text
- Controlled green accent
- Subtle dividers
- Small but meaningful status colors
- Clean photography
- High-quality avatars
- Dense but breathable information
- Minimal decorative UI

### Avoid

- Giant gradients
- Purple AI gradients
- Neon green
- Excessive glass cards
- Huge rounded rectangles
- Floating blobs
- Excessive shadows
- Cartoon illustrations
- Random 3D icons
- Every element inside a card

---

# 6. Color System

The primary brand direction should be **deep green + warm neutral**, because green communicates local, trustworthy, human utility without looking like a fintech clone.

## Primary

| Token | Color | Usage |
|---|---|---|
| Primary 900 | `#12372A` | Brand, headings, major CTAs |
| Primary 700 | `#185C43` | Interactive states |
| Primary 500 | `#2F8060` | Accent |
| Primary 100 | `#E6F1EB` | Soft backgrounds |
| Primary 50 | `#F3F8F5` | Highlight surfaces |

## Neutrals

| Token | Color | Usage |
|---|---|---|
| Ink 950 | `#151817` | Main text |
| Ink 700 | `#454A47` | Secondary text |
| Ink 500 | `#737A76` | Metadata |
| Border | `#E4E7E5` | Dividers |
| Surface | `#FFFFFF` | Cards |
| Canvas | `#F8F9F7` | Page background |

## Semantic

**Success:** `#278A5B`  
**Warning:** `#C77A18`  
**Error:** `#C94A45`  
**Info:** `#3676A8`

### Color Rule

Do not use semantic colors as decoration.

Color should communicate **state, trust, action, or meaning**.

---

# 7. Typography

## Primary Typeface: **Plus Jakarta Sans**

### Why

Plus Jakarta Sans gives Local Connect:

- A modern consumer-product feel
- Excellent readability
- Friendly geometry
- Strong numerals
- Good hierarchy
- Premium appearance without feeling corporate

It is preferable here to a purely developer-oriented typeface because Local Connect is a consumer product rather than a technical dashboard.

### Type Scale

| Style | Size | Weight |
|---|---:|---:|
| Display | 48–56px | 700 |
| H1 | 36–44px | 700 |
| H2 | 28–32px | 700 |
| H3 | 22–24px | 650 |
| Body Large | 18px | 400–500 |
| Body | 15–16px | 400 |
| Small | 13–14px | 500 |
| Caption | 11–12px | 600 |

### Mobile

Reduce display typography rather than squeezing desktop typography into mobile.

---

# 8. Spacing System

Use an **8px base spacing system**.

`4 / 8 / 12 / 16 / 24 / 32 / 40 / 48 / 64 / 80`

### Rules

- Card internal padding: 16–20px
- Section spacing: 40–64px
- Mobile page padding: 16px
- Desktop page padding: 32–48px
- Major hero spacing: 64–96px

Whitespace should create hierarchy rather than simply making the interface look empty.

---

# 9. Grid System

## Mobile

- 4-column conceptual grid
- 16px page margins
- 12px gutters

## Tablet

- 8-column grid
- 24px margins
- 16px gutters

## Desktop

- 12-column grid
- Max content width: **1200–1280px**
- 24px gutters
- 32–48px outer margins

---

# 10. Responsive Breakpoints

| Device | Width |
|---|---:|
| Small Mobile | `< 375px` |
| Mobile | `375–767px` |
| Tablet | `768–1023px` |
| Desktop | `1024–1439px` |
| Large Desktop | `1440px+` |

Design mobile first, then progressively enhance.

---

# 11. Iconography

Use a single consistent outline icon family.

### Recommended Style

- 1.75–2px stroke
- Rounded line endings
- Minimal detail
- 20–24px default size

Icons should support text, not replace it.

### Core Icons

- Search
- Location
- Sliders
- Calendar
- Clock
- Star
- Shield
- Check
- Message
- Bookmark
- Arrow
- User
- Map
- Navigation
- Spark/AI indicator

Avoid mixing multiple icon styles.

---

# 12. Buttons

## Primary Button

Deep green filled button.

Example:

**Find Matches →**

Properties:

- 48–52px height
- 12px radius
- Medium/semibold text
- Clear pressed state

## Secondary Button

Neutral surface with border.

Example:

**View Profile**

## Tertiary

Text-only.

Example:

**See why**

## Destructive

Use only where genuinely necessary.

### Button Rule

Do not turn every action into a filled button.

---

# 13. Inputs

The primary input is one of the most important components in the entire product.

## Need Input

Large conversational field.

Example:

> **What do you need?**
>
> “Find a maths tutor for Class 10, weekends, within ₹500…”

### Characteristics

- 18px input text
- 20–24px internal padding
- Minimal border
- Focus ring in primary green
- Optional voice/search icon
- Submit button integrated but not visually dominant

The input should feel closer to a **search box + prompt composer** than a traditional form field.

---

# 14. Requirement Chips

After AI parsing, display editable chips:

`Mathematics` `Class 10` `Female` `Weekend` `₹500` `≤4 km`

Each chip should have:

- Label
- Optional remove icon
- Clear selected state

### Interaction

Tap chip → edit.

Tap × → remove.

Tap **+ Add requirement** → add another constraint.

---

# 15. Cards

Cards should not dominate the entire UI.

Use cards for **information grouping**, not every section.

### Card Style

- White surface
- 1px subtle border
- 12–16px radius
- Minimal shadow
- 16–20px padding

Avoid:

> card inside card inside card

---

# 16. Provider Card

The provider card is the most important reusable content component.

### Structure

**Top**

Avatar + Name + verification indicator

**Below**

Service / specialization

**Main signal**

**94% Match**

**Metadata**

- ★ 4.8
- Trust 89
- 1.2 km
- ₹450/session

**Availability**

`Available weekends`

**Community**

`Recommended by 12 nearby`

**Bottom**

`View Profile` / `Connect`

### Hierarchy

1. Match
2. Provider identity
3. Service relevance
4. Trust
5. Practical information
6. Action

Do not make the rating the hero metric.

---

# 17. Match Score Component

The match score should be visually distinctive but restrained.

### Recommended

A compact score badge:

**94%**  
**Match**

Use the percentage as a strong number rather than a huge circular progress chart.

### Why

Circular gauges often look like generic dashboard UI.

A strong typographic score feels more consumer-product oriented.

---

# 18. Match Explanation

Expandable component:

> **Why this matches**

Then:

- ✓ Skill match
- ✓ 1.2 km away
- ✓ Within budget
- ✓ Available weekends
- ✓ Trusted locally

### Interaction

Collapsed by default on dense result lists.

Expanded automatically for the **top result**.

---

# 19. Trust Score Component

### Compact State

**Trust 89**

with a small shield/check indicator.

### Expanded State

**Local Trust Score**

**89 / 100**

Then show signal groups — this table must show exactly the 7 factors in the Canonical Trust Score Formula (TRD §9.2), no more and no fewer:

| Signal | Status |
|---|---|
| Phone | Verified |
| Identity | Submitted |
| Profile | Complete |
| Rating | 4.8 (32 reviews) |
| Completed Jobs | 18 |
| Community | 12 recommendations |
| Response | 92% |

**Previous versions of this table mislabeled the Completed Jobs row as "Experience"** and omitted Rating and Identity entirely — this was inconsistent with every version of the Trust Score formula and has been corrected. `experience_years` is not a Trust Score input; it's shown separately as provider context (§X, provider card), not in this breakdown.

Do not display an unexplained giant score.

---

# 20. Trust Language

Use:

- **Phone Verified**
- **Identity Submitted**
- **Community Recommended**
- **Profile Verified**

Do not use:

- “100% Safe”
- “Guaranteed”
- “Government Verified” unless genuinely verified
- “Trusted by everyone”

Trust should be presented as **evidence**, not a promise.

---

# 21. Navigation

## Mobile

Use a four-item bottom navigation:

**Home | Discover | Requests | Profile**

The primary Home screen contains the need input.

### Optional floating action

Avoid a persistent floating action button unless Post a Need becomes a major usage pattern.

---

## Desktop

Use:

**Logo | Home | Discover | Post a Need | Requests**

Right side:

**Location | Profile**

The desktop header should remain compact.

---

# 22. Home Screen

## Purpose

Turn the user's intent into a requirement as quickly as possible.

## Layout

### Header

Logo + locality + profile

### Hero

Small greeting:

> **Good evening, Omkar.**

Main heading:

> **What do you need?**

Supporting copy:

> Find the right people and services around you.

### Primary Need Input

Large conversational input.

### Example Prompts

Horizontal chips:

- Find a maths tutor
- Need an electrician
- Photographer under ₹5,000
- Home chef nearby

### Below Input

“Explore nearby services”

Categories:

- Education
- Home
- Food
- Creative
- Technology
- Personal

### Nearby Section

Only after the primary need interaction:

> **People near you**

Use a compact horizontal list rather than turning the homepage into a marketplace catalog.

---

# 23. AI Need Input Screen

## Purpose

Give the user a focused space to express their need.

### Layout

Top:

**What do you need?**

Large input occupying most of the visual attention.

Bottom:

Example suggestions.

### Mobile

Input should expand almost fullscreen.

Keyboard-friendly layout.

Submit CTA fixed near bottom but above the keyboard.

### Desktop

Centered input container with maximum width around 720–800px.

Avoid unnecessary graphics.

---

# 24. AI Parsing State

The parsing screen should feel **calm and intelligent**, not like a chatbot thinking animation.

### Example

**Understanding your need**

> Maths tutor for Class 10, weekends, within ₹500 and 4 km.

Then progressively show:

`Mathematics ✓`

`Class 10 ✓`

`Weekend ✓`

`₹500 ✓`

`≤4 km ✓`

### Motion

Use subtle sequential appearance.

Avoid:

- Spinning AI brains
- Robot illustrations
- Excessive shimmer
- Fake “thinking” delays

---

# 25. Requirement Confirmation

## Purpose

Give the user control over AI interpretation.

### Layout

**I understood this as**

Requirement chips.

Then:

> **Anything you'd like to change?**

Actions:

**Find Matches**

Secondary:

**Edit requirements**

### Key Principle

AI should feel assistive, not authoritative.

---

# 26. Match Results

## Purpose

Help the user quickly compare suitable people.

### Header

> **24 people match your need**

Below:

Requirement summary chips.

### Sort

**Best Match** | Distance | Trust | Price

### Provider List

Top result receives visual emphasis.

Example:

**94% Match**

**Priya Sharma**  
Mathematics Tutor

`1.2 km` `₹450/session` `Weekend`

**Trust 89**

**Recommended by 12 nearby**

Expandable:

**Why this matches**

CTA:

**View Profile**

---

# 27. Results Information Density

### Mobile

Prioritize:

1. Match
2. Name/service
3. Distance + price
4. Trust
5. Availability
6. Connect/profile

### Desktop

Use wider cards with two-zone structure:

**Left:** provider identity  
**Middle:** match explanation  
**Right:** price + distance + CTA

---

# 28. Provider Profile

## Purpose

Convert confidence into connection.

### Top

Large avatar

**Priya Sharma**

**Mathematics Tutor**

`Trust 89` `★ 4.8` `1.2 km away`

### Primary CTA

**Connect**

Secondary:

**Save**

### Sections

**About**

**Skills**

**Experience**

**Availability**

**Pricing**

**Trust**

**Community Recommendations**

**Reviews**

### Trust placement

Trust should appear **above the fold**, not hidden near the bottom.

---

# 29. Trust Details Screen / Bottom Sheet

On mobile, tapping Trust Score should open a bottom sheet.

### Header

**Why we trust this profile**

Then:

**89 Trust Score**

Signal breakdown.

Each signal gets a concise explanation. Show all 7 canonical factors (TRD §9.2), not a subset:

**Community Recommended**

> 12 people nearby have recommended this provider.

**Phone Verified**

> Phone number has been verified.

**Identity Submitted**

> A photo ID has been submitted. This is a submission, not a government verification.

**Profile Complete**

> This provider filled out their full profile.

**Rating**

> 4.8 average from 32 reviews.

**Completed Jobs**

> 18 completed services on Local Connect.

**Response Rate**

> Responds to 92% of requests.

### CTA

**Done**

No unnecessary graphs.

---

# 30. Search Screen

Search should support both:

### Traditional search

> `math tutor`

and

### Natural language

> `female maths teacher for class 10 this weekend`

### Layout

Search field at top.

Below:

Recent searches / popular nearby services.

Results should transition naturally into the same provider-card system.

---

# 31. Filters

Filters should remain secondary to AI matching.

### Filters

- Category
- Distance
- Budget
- Availability
- Rating
- Trust
- Experience

### Mobile

Open as a bottom sheet.

Sticky bottom action:

**Show 24 matches**

### Desktop

Use a horizontal filter bar or left filter rail depending on result density.

---

# 32. Map Screen

Map should be a **secondary discovery mode**, not the primary product experience.

The product is not trying to become Google Maps.

### Layout

**Map + bottom result sheet**

Provider markers should show:

- Avatar/initial
- Optional match score

Selected marker expands provider preview.

### Mobile

Map occupies upper ~55–60%.

Results sheet occupies lower area.

### Critical Rule

Do not place dozens of generic pins.

Only show relevant matched providers.

---

# 33. Post a Need

**Priority: P1 (Should Have)** — reuses the same AI-parsing and matching screens as the standard search flow (this screen's "Post Need" action feeds the same pipeline, just skips straight to "published" instead of showing ranked results immediately). See PRD §22, Implementation Plan Phase 8A.

## Purpose

For users who want providers to come to them.

### Layout

**What do you need?**

Need description.

Then:

- Category
- Location
- Budget
- Date
- Duration
- Additional details

AI should help structure the request.

### Final CTA

**Post Need**

Secondary:

**Save Draft**

Keep the flow short.

---

# 34. Requests

## Customer

Tabs:

**Active | Completed**

Request card:

**Math Tutor**

Priya Sharma

`Pending`

`Requested 12 min ago`

Actions:

**View Request**

---

## Provider

Tabs:

**New | Active | Completed**

Request card should prioritize:

- Need
- Distance
- Budget
- Date
- User
- Response deadline/status

CTA:

**Accept**

Secondary:

**Decline**

---

# 35. Connection State

After clicking Connect:

### Success state

**Request sent**

> Priya has received your request.

Show:

- Provider
- Request summary
- Status
- Expected next action

Primary:

**View Request**

Secondary:

**Back to Matches**

Avoid fake celebratory animations.

---

# 36. Provider Onboarding

The provider onboarding should feel like **building a professional local profile**, not filling a corporate registration form.

### Step 1

**What do you offer?**

Select skills.

### Step 2

**Tell people about your work**

Experience + description.

### Step 3

**What do you charge?**

Pricing.

### Step 4

**When are you available?**

Schedule.

### Step 5

**Where do you serve?**

Service area.

### Step 6

**Build trust**

Phone/profile verification and other available trust signals.

Progress indicator:

**2 of 6**

---

# 37. Provider Profile Editing

Use sections:

- Basic information
- Services
- Pricing
- Availability
- Service area
- Trust
- Profile visibility

Use inline editing wherever possible.

Avoid giant multi-page forms.

---

# 38. Customer Profile

Keep it lightweight.

### Sections

- Profile photo
- Name
- Locality
- Saved providers
- Requests
- Recommendations given
- Settings

The customer profile should not feel like a social-media profile.

---

# 39. Saved Providers

Saved providers should behave like a shortlist.

Each item:

- Avatar
- Name
- Service
- Match
- Trust
- Distance
- Price

CTA:

**View**

Add a simple empty state:

> **Your shortlist is empty.**
>
> Save providers you want to compare later.

---

# 40. Modals & Bottom Sheets

## Mobile

Prefer bottom sheets for:

- Filters
- Trust details
- Provider quick preview
- Request confirmation

## Desktop

Use centered modal dialogs.

### Rules

- Maximum one modal layer
- Clear title
- Clear close action
- No unnecessary confirmation dialogs

---

# 41. Toasts

Use toasts for lightweight feedback.

Examples:

**Provider saved**

**Request sent**

**Profile updated**

**Location updated**

Toasts should:

- Appear briefly
- Not block interaction
- Include undo where useful

Avoid toasts for important information that users need to read carefully.

---

# 42. Loading States

Use skeletons for content loading.

### Provider Card Skeleton

Avatar block  
Name line  
Service line  
Metadata lines  
CTA block

### AI Parsing

Use progressive text/chip appearance rather than generic skeletons.

### Rule

Never make the interface look broken while data is loading.

---

# 43. Empty States

## No Matches

> **We couldn't find a strong match nearby.**
>
> Try increasing your distance or adjusting your budget.

Actions:

**Expand Search**

**Edit Need**

## No Requests

> **No requests yet.**
>
> When you connect with someone, your requests will appear here.

## No Saved Providers

> **Build your shortlist.**
>
> Save providers you want to compare later.

---

# 44. Error States

### Bad location

> **We couldn't determine your location.**

**Try Again**

**Enter Location Manually**

### AI parsing issue

> **We couldn't fully understand that request.**

Show what was understood and allow manual editing.

### Connection failure

> **Your request wasn't sent.**

**Try Again**

Never expose technical errors to the user.

---

# 45. Motion Guidelines

Motion should communicate **state and hierarchy**, not entertainment.

### Use

- 150–250ms micro-interactions
- 200–300ms bottom sheets
- Subtle card transitions
- Chip insertion/removal
- Match result reveal
- Button press feedback

### Avoid

- Large page transitions
- Constant floating animations
- Infinite shimmer
- Parallax everywhere
- Decorative particles
- Excessive spring physics

### AI Parsing

Use subtle sequential transitions to make the system feel responsive.

---

# 46. Interaction Design

## Touch Targets

Minimum:

**44 × 44px**

Preferred:

**48 × 48px**

## Swipe

Use only where useful:

- Bottom-sheet dismissal
- Image galleries if introduced
- Map sheet expansion

Do not introduce gestures simply because the product is mobile.

---

# 47. Accessibility

## Contrast

Target WCAG AA contrast for normal text.

Never use light gray text for important information.

## Typography

Do not use:

- 10px body text
- Extremely compressed labels
- Long uppercase paragraphs

## Keyboard Navigation

Desktop users should be able to:

- Tab through navigation
- Focus search
- Edit requirement chips
- Navigate filters
- Open/close dialogs
- Submit requests

Visible focus states are mandatory.

## Screen Readers

Important dynamic states should be announced:

- Search results updated
- AI parsing completed
- Request sent
- Error occurred
- Filter count changed

## Reduced Motion

Respect `prefers-reduced-motion`.

Disable non-essential transitions.

---

# 48. Responsive Behavior

## Mobile

Prioritize:

- Thumb reach
- Bottom navigation
- Bottom sheets
- Full-width cards
- Sticky primary CTA
- Short content sections

## Tablet

Use two-column layouts where useful.

Provider cards can become slightly denser.

## Desktop

Use:

- Wider content area
- Persistent navigation
- Multi-column provider results
- Map split-view
- Side filter panels

But do not turn the mobile product into a dashboard.

---

# 49. Mobile Bottom Navigation

Recommended:

| Icon | Label |
|---|---|
| Home | Home |
| Search | Discover |
| Clipboard | Requests |
| User | Profile |

### Active State

Use brand green.

### Rule

Do not use five or six navigation items.

---

# 50. Desktop Navigation

### Left

**Local Connect**

### Center

- Home
- Discover
- Post a Need
- Requests

### Right

Location indicator + Profile

### Header Behavior

Sticky but visually lightweight.

---

# 51. Information Hierarchy

Every provider result should answer these questions in order:

### 1. Is this person relevant?

**94% Match**

### 2. Who are they?

**Priya Sharma — Mathematics Tutor**

### 3. Are they practical for me?

**1.2 km · ₹450 · Weekend**

### 4. Can I trust them?

**Trust 89 · Recommended by 12 nearby**

### 5. What can I do?

**View Profile / Connect**

This hierarchy should remain consistent across mobile and desktop.

---

# 52. Design System Components

The initial component library should include:

## Foundation

- Colors
- Typography
- Spacing
- Radius
- Shadows
- Motion

## Navigation

- Desktop Header
- Mobile Bottom Nav
- Back Header
- Breadcrumbs where useful

## Inputs

- Need Input
- Search Input
- Select
- Date Picker
- Price Input
- Requirement Chip

## Data Display

- Provider Card
- Match Score
- Trust Score
- Rating
- Availability Badge
- Verification Badge
- Community Recommendation

## Actions

- Primary Button
- Secondary Button
- Icon Button
- Text Button

## Overlays

- Modal
- Bottom Sheet
- Toast
- Confirmation

## States

- Skeleton
- Empty State
- Error State
- Success State

---

# 53. Design Do's

## DO

- Make the need input the visual hero.
- Use typography as a major design element.
- Make match reasoning obvious.
- Make trust evidence understandable.
- Use locality throughout the experience.
- Keep cards compact and information-rich.
- Use whitespace intentionally.
- Keep CTAs obvious.
- Design mobile first.
- Use real-looking provider photography in the demo.
- Use realistic local names, prices, distances, and availability.
- Keep the interface calm during AI interactions.
- Make the product feel usable without explaining it.

---

# 54. Design Don'ts

## DON'T

- Use purple/blue “AI” gradients.
- Make everything pill-shaped.
- Put every section inside a card.
- Create giant map-first screens.
- Make the Trust Score look like a game score.
- Use generic stock illustrations.
- Overuse glassmorphism.
- Put huge text everywhere.
- Use five different button styles.
- Turn the home screen into a category directory.
- Add unnecessary social-feed functionality.
- Make AI the visual personality of the brand.
- Use fake verification claims.
- Hide the important Connect action.
- Over-design the dashboard.

---

# 55. Complete Screen Inventory

## Customer

### Core

1. Splash / App Load
2. Onboarding
3. Location Permission
4. Home
5. AI Need Input
6. AI Parsing
7. Requirement Confirmation
8. Match Results
9. Provider Profile
10. Trust Details
11. Search
12. Filters
13. Map Discovery
14. Post a Need
15. Request Confirmation
16. Requests
17. Request Detail
18. Saved Providers
19. Customer Profile
20. Settings

## Provider

21. Provider Onboarding
22. Provider Profile Setup
23. Skills Selection
24. Pricing Setup
25. Availability Setup
26. Service Area Setup
27. Trust Setup
28. Provider Dashboard
29. Incoming Requests
30. Request Detail
31. Provider Profile
32. Edit Profile
33. Edit Availability
34. Provider Performance Snapshot

The last screen should remain lightweight and should not become an analytics dashboard in the MVP.

---

# 56. Hackathon Demo UX

The demo should be designed as a **single continuous story**.

## Scene 1 — Need

Home screen:

> **What do you need?**

User enters:

> “Mujhe 10th ke liye female maths teacher chahiye, weekend pe, ₹500 tak aur 4 km ke andar.”

## Scene 2 — Understand

AI parsing reveals:

`Mathematics`  
`Class 10`  
`Female`  
`Weekend`  
`₹500`  
`≤4 km`

User taps:

**Find Matches**

## Scene 3 — Match

Results immediately show:

### 94% Match

**Priya Sharma**

Mathematics Tutor

`1.2 km` · `₹450/session` · `Weekend`

**Trust 89**

**Recommended by 12 nearby**

## Scene 4 — Explain

Open:

**Why this matches**

✓ Skill match  
✓ Nearby  
✓ Within budget  
✓ Available  
✓ Trusted locally

This is where the judge understands the product differentiation.

## Scene 5 — Trust

Tap Trust 89.

Show evidence:

- Phone Verified
- Profile Verified
- 12 community recommendations
- Strong response history
- Completed requests

## Scene 6 — Connect

Tap:

**Connect**

Confirmation:

> **Request sent**
>
> Priya has received your request.

## Scene 7 — Provider

Switch to provider view.

Show:

> **New request**

The provider can:

**Accept**

or

**Decline**

The complete loop is now visible.

---

# 57. Hackathon Visual Priorities

If development time becomes limited, prioritize these screens in this exact order:

## Tier 1 — Must Look Excellent

1. Home
2. AI Need Input
3. Requirement Confirmation
4. Match Results
5. Provider Profile
6. Trust Details

## Tier 2

7. Requests
8. Provider Dashboard
9. Provider Onboarding
10. Post a Need

## Tier 3

11. Search
12. Filters
13. Map
14. Saved Providers
15. Settings

---

# 58. Final Design Direction

Local Connect should visually communicate:

> **“Tell us what you need. We'll help you find the right person nearby — and show you why they match.”**

The interface should not scream **AI**.

It should quietly demonstrate intelligence.

The interface should not scream **marketplace**.

It should feel like a trusted local utility.

The interface should not scream **trust**.

It should provide visible evidence that allows the user to make their own decision.

---

# 59. Design North Star

Every major screen should reinforce one of these three words:

## NEED

**What are you looking for?**

## MATCH

**Who fits your requirement best?**

## CONNECT

**Who do you want to contact?**

If a UI element does not improve one of these three stages, question whether it belongs in the MVP.

---

# 60. Final Product Design Statement

**Local Connect is a human-first local discovery experience powered by intelligent matching.**

Its visual identity should be:

**Premium enough to feel like a serious startup.**

**Simple enough to understand instantly.**

**Trustworthy enough to make recommendations believable.**

**Local enough to feel personal.**

**Focused enough for a three-person hackathon team to actually ship.**

The winning design is not the one with the most effects.

It is the one where a judge can open the product, type a real need, understand the AI interpretation, compare trustworthy local matches, and connect with someone — **without needing anyone to explain what the product does.**

### **NEED → MATCH → CONNECT**
