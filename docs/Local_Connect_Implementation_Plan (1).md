# LOCAL CONNECT — IMPLEMENTATION PLAN

**Product:** Local Connect  
**Official Tagline:** **Need → Match → Connect**  
**Team:** 3 B.Tech developers  
**Primary Goal:** Ship a reliable, polished, hackathon-ready MVP with a complete end-to-end demo path.

---

# 1. Implementation Strategy

## 1.1 Guiding Principle

Build the product vertically, not feature-by-feature.

The first milestone is not "all frontend done" or "AI done". It is a working slice of:

```text
Landing
  ↓
Need Input
  ↓
AI Parsing
  ↓
Requirement Confirmation
  ↓
Matching
  ↓
Top Providers
  ↓
Provider Profile
  ↓
Trust Details
  ↓
Connect
```

Once this works with seeded data, improve reliability, visual polish, trust signals, location, and PWA behavior.

## 1.2 Priority Order

1. **P0 — Core demo path**
   - App shell
   - Authentication
   - Need input
   - AI parsing
   - Structured requirement validation
   - Deterministic matching
   - Provider results
   - Provider profile
   - Trust score
   - Connect/request
   - Seed data
   - Error/loading states

2. **P1 — Differentiation and polish**
   - Location-aware ranking
   - Availability matching
   - Community recommendations
   - Match explanations
   - PWA installability
   - Better provider discovery
   - Responsive/mobile polish

3. **P2 — Cut first if schedule slips**
   - Advanced notifications
   - Complex recommendation systems
   - Real-time chat
   - Advanced analytics
   - Sophisticated map interactions
   - Full provider dashboards beyond the demo requirement

## 1.3 Recommended Execution Model

Use short vertical milestones:

- **Milestone A:** Repository + Supabase + app shell
- **Milestone B:** Auth + provider data + seeded marketplace
- **Milestone C:** Need → AI parser → structured requirement
- **Milestone D:** Requirement → matching → ranked providers
- **Milestone E:** Provider → trust → connect
- **Milestone F:** Location + recommendations + PWA
- **Milestone G:** Hardening + polish + demo rehearsal

Do not wait for every secondary feature before integrating the core loop.

---

# 2. Team Responsibilities

| Developer | Primary Ownership | Secondary Ownership |
|---|---|---|
| **Developer 1** | React/TypeScript, PWA, UI, responsive UX | Frontend integration, demo polish |
| **Developer 2** | Supabase, PostgreSQL, RLS, APIs, data | Request lifecycle, deployment |
| **Developer 3** | AI parser, validation, matching, trust intelligence | AI integration, match explanations |

## Developer 1 — Frontend / PWA / UI

Own:

- Vite + React + TypeScript setup
- Tailwind + shadcn/ui
- Routes and application shell
- Need input experience
- Requirement confirmation
- Provider cards
- Provider profile
- Trust presentation
- Connect UI
- Loading/error/empty states
- Responsive behavior
- PWA manifest/service worker
- Final visual polish

## Developer 2 — Backend / Database / APIs

Own:

- Supabase project
- Database migrations
- RLS
- Seed data
- Database indexes
- Provider/request/review/recommendation data
- Authentication integration
- Request lifecycle
- Backend service boundaries
- Production configuration
- Database testing

## Developer 3 — AI / Matching / Intelligence

Own:

- AI provider abstraction
- Requirement extraction
- JSON schema validation
- Prompt design
- Hinglish handling
- AI fallback behavior
- Matching algorithm
- Distance scoring
- Trust calculation
- Match explanations
- AI/matching tests

## Shared Responsibilities

All three developers:

- Code review
- Integration testing
- Bug fixing
- Demo rehearsal
- Production verification
- Documentation of important technical decisions

---

# 3. Architecture-to-Code Mapping

## Frontend

```text
src/
├── app/
│   ├── router.tsx
│   ├── providers.tsx
│   └── routes/
├── components/
│   ├── ui/
│   ├── need/
│   ├── provider/
│   ├── trust/
│   └── common/
├── pages/
│   ├── LandingPage
│   ├── AuthPage
│   ├── NeedPage
│   ├── ResultsPage
│   ├── ProviderProfilePage
│   └── RequestPage
├── services/
│   ├── auth.ts
│   ├── requirements.ts
│   ├── providers.ts
│   ├── matching.ts
│   └── requests.ts
├── hooks/
├── lib/
│   ├── supabase.ts
│   ├── validation.ts
│   └── utils.ts
├── types/
└── styles/
```

The exact folder names may vary, but responsibilities should remain separated.

## Backend

Supabase provides:

```text
Supabase Auth
      ↓
PostgreSQL
      ↓
RLS
      ↓
Database functions / queries
      ↓
Frontend service layer
```

Backend responsibilities:

- Authentication
- Persistent data
- Authorization
- Provider discovery
- Request state
- Reviews/recommendations
- Location data
- Trust-related source data

## AI

```text
Frontend
   ↓
AI service abstraction
   ↓
AI provider
   ↓
Raw response
   ↓
JSON schema validation
   ↓
Normalized requirement
   ↓
Matching engine
```

The frontend must never depend directly on a vendor-specific AI response format.

## Matching

```text
Structured Requirement
        ↓
Candidate Filtering
        ↓
Feature Normalization
        ↓
Weighted Score
        ↓
Rank
        ↓
Explanation
```

---

# 4. Phase Plan

## Phase 0 — Repository + Project Setup

**Goal:** Establish a stable shared development baseline.

### Tasks

| ID | Task | Owner | Dependencies | Priority | Effort | Definition of Done |
|---|---|---|---|---|---|---|
| P0-001 | Create Git repository | D2 | None | P0 | 0.5h | Shared repository exists |
| P0-002 | Initialize React + TypeScript + Vite | D1 | P0-001 | P0 | 1h | App runs locally |
| P0-003 | Configure Tailwind + shadcn/ui | D1 | P0-002 | P0 | 1.5h | Shared UI primitives available |
| P0-004 | Create Supabase project | D2 | None | P0 | 1h | Project accessible |
| P0-005 | Configure environment variables | D2 | P0-004 | P0 | 0.5h | Local env works without secrets in Git |
| P0-006 | Add base lint/typecheck/build scripts | D1 | P0-002 | P0 | 1h | CI/local checks pass |
| P0-007 | Establish branch/PR convention | All | P0-001 | P1 | 0.5h | Team agrees on workflow |
| P0-008 | Create shared TypeScript domain types | D1+D3 | P0-002 | P0 | 1h | Core request/provider types compile |

**Parallel:** P0-002, P0-004 can happen simultaneously.

---

# Phase 1 — Design System + Application Shell

**Goal:** Build enough shell to integrate features quickly.

| ID | Task | Owner | Dependencies | Priority | Effort | Definition of Done |
|---|---|---|---|---|---|---|
| P1-001 | App routing | D1 | P0 | P0 | 1.5h | Core routes work |
| P1-002 | Shared layout/navigation | D1 | P1-001 | P0 | 1.5h | Consistent shell renders |
| P1-003 | Typography/spacing/component conventions | D1 | P0-003 | P0 | 1.5h | Shared design tokens/components used |
| P1-004 | Toast/error/loading primitives | D1 | P1-003 | P0 | 1h | Common states available |
| P1-005 | Supabase client wrapper | D2 | P0-004 | P0 | 1h | Frontend can securely access Supabase |
| P1-006 | Base database migration framework | D2 | P0-004 | P0 | 1h | Migrations can be applied consistently |

---

# Phase 2 — Authentication + Onboarding

**Goal:** Establish user identity and role-aware access.

| ID | Task | Owner | Dependencies | Priority | Effort | Definition of Done |
|---|---|---|---|---|---|---|
| P2-001 | Supabase Auth integration | D2 | P1-005 | P0 | 2h | User can sign in/sign out |
| P2-002 | Auth UI | D1 | P1-001 | P0 | 2h | Auth page works on mobile |
| P2-003 | User profile persistence | D2 | P2-001, DB migrations | P0 | 1.5h | Authenticated user has profile |
| P2-004 | Protected routes | D1 | P2-001 | P0 | 1h | Protected pages reject unauthenticated users |
| P2-005 | Role handling | D2 | P2-003 | P0 | 1h | Customer/provider role is enforced |
| P2-006 | Auth error/session states | D1+D2 | P2-001 | P1 | 1h | Expired/failed sessions handled |

---

# Phase 3 — Provider Profiles + Seed Data

**Goal:** Create a realistic marketplace before AI/matching integration.

| ID | Task | Owner | Dependencies | Priority | Effort | Definition of Done |
|---|---|---|---|---|---|---|
| P3-001 | Apply provider-related migrations | D2 | P1-006 | P0 | 2h | Required tables exist |
| P3-002 | Provider profile queries | D2 | P3-001 | P0 | 1.5h | Provider data can be retrieved |
| P3-003 | Provider profile page | D1 | P1 | P0 | 3h | Complete provider details render |
| P3-004 | Provider card component | D1 | P1 | P0 | 1.5h | Reusable result card exists |
| P3-005 | Create realistic provider seed dataset | D2 | P3-001 | P0 | 2h | Multiple categories/distances/prices |
| P3-006 | Availability seed data | D2 | P3-005 | P0 | 1h | Providers have demo availability |
| P3-007 | Provider profile completeness states | D1 | P3-003 | P1 | 1h | Missing fields do not break UI |

### Seed Dataset Target

For the hackathon demo, use approximately:

- 30–50 providers
- 5–8 categories
- 3–8 providers/category
- Different pricing
- Different ratings
- Different trust signals
- Different distances
- Different availability
- Several highly relevant providers for the scripted demo

Realistic seeded data is more valuable than building provider onboarding deeply.

---

# Phase 4 — Need Input + AI Parser

**Goal:** Convert natural language into validated structured requirements.

## Example

Input:

> "Mujhe 12th maths tutor chahiye weekend pe ₹500 ke andar."

Structured output:

```json
{
  "category": "education",
  "service": "math tutor",
  "level": "12th",
  "budget": 500,
  "currency": "INR",
  "availability": ["weekend"],
  "radius_km": 5
}
```

| ID | Task | Owner | Dependencies | Priority | Effort | Definition of Done |
|---|---|---|---|---|---|---|
| P4-001 | Define requirement TypeScript contract | D3 | P0 | P0 | 1h | Shared schema exists |
| P4-002 | Define runtime validation schema | D3 | P4-001 | P0 | 1h | Invalid AI output is rejected |
| P4-003 | AI provider abstraction | D3 | P4-001 | P0 | 2h | Vendor-independent interface exists |
| P4-004 | Prompt engineering | D3 | P4-001 | P0 | 2h | English/Hinglish prompts work |
| P4-005 | AI parsing service | D3 | P4-002,P4-003 | P0 | 2h | Natural language produces valid JSON |
| P4-006 | Fallback parser/default handling | D3 | P4-005 | P0 | 1.5h | Common failures produce recoverable state |
| P4-007 | Need input UI | D1 | P1 | P0 | 3h | User can submit natural language need |
| P4-008 | Requirement confirmation UI | D1 | P4-005 | P0 | 2h | Parsed fields can be reviewed/confirmed |
| P4-009 | AI loading/error states | D1+D3 | P4-005 | P0 | 1h | UI never appears stuck |
| P4-010 | AI parsing test cases | D3 | P4-005 | P0 | 2h | Representative English/Hinglish cases pass |

### AI Rules

- Never trust model output directly.
- Validate all fields.
- Apply allowed ranges.
- Normalize currency to INR for MVP.
- Normalize availability to known values.
- Reject unsafe/irrelevant structured output.
- Preserve original user text for debugging/audit.
- If parsing fails, allow manual confirmation/editing rather than blocking the user.

---

# Phase 5 — Matching Engine

**Goal:** Turn a structured need into useful ranked providers.

## MVP Formula

Recommended initial weighting:

```text
Match Score =
30% Skill Relevance
20% Distance
15% Budget
15% Availability
10% Trust
10% Rating
```

Experience and response rate should influence trust/ranking data rather than create too many independent factors in the first implementation.

### Matching Tasks

| ID | Task | Owner | Dependencies | Priority | Effort | Definition of Done |
|---|---|---|---|---|---|---|
| P5-001 | Define candidate filtering rules | D3 | P4 | P0 | 1h | Rules documented and coded |
| P5-002 | Implement skill relevance score | D3 | P5-001 | P0 | 1.5h | Relevant providers score higher |
| P5-003 | Implement distance score | D3 | Location data | P0 | 1.5h | Distance is normalized |
| P5-004 | Implement budget score | D3 | P5-001 | P0 | 1h | Budget compatibility affects ranking |
| P5-005 | Implement availability score | D3 | P3-006 | P0 | 1h | Availability affects ranking |
| P5-006 | Integrate trust/rating score | D3 | Trust data | P0 | 1h | Trust/rating affect ranking |
| P5-007 | Implement final ranking function | D3 | P5-002..006 | P0 | 1.5h | Ranked providers returned |
| P5-008 | Match persistence | D2 | P5-007 | P0 | 1.5h | Request matches can be stored |
| P5-009 | Results API/service | D2+D3 | P5-007 | P0 | 1.5h | Frontend receives ranked results |
| P5-010 | Results page | D1 | P3-004,P5-009 | P0 | 3h | Ranked provider cards render |
| P5-011 | Match explanation | D3 | P5-007 | P0 | 1h | Each result explains key reasons |
| P5-012 | Matching test suite | D3 | P5-007 | P0 | 2h | Edge cases and ranking expectations pass |

## Minimum Match Threshold

Use a simple threshold such as **40/100** for normal results.

If no provider meets the threshold:

1. Expand search radius modestly if allowed.
2. Relax non-critical factors such as budget/availability.
3. Clearly explain that no strong match was found.
4. Never fabricate a match.

---

# Phase 6 — Trust Score

**Goal:** Make ranking understandable and differentiate trustworthy providers.

## MVP Trust Model

Score range: **0–100**.

Suggested signals:

```text
Phone verification       15%
Identity verification    15%
Profile completeness     10%
Rating                   20%
Completed jobs           15%
Recommendations          10%
Response rate            15%
```

If identity verification is not actually implemented, do **not** show an "Identity Verified" badge. Use only real signals.

| ID | Task | Owner | Dependencies | Priority | Effort | Definition of Done |
|---|---|---|---|---|---|---|
| P6-001 | Implement trust input queries | D2 | P3 | P0 | 1.5h | Trust signals available |
| P6-002 | Implement normalized trust calculation | D3 | P6-001 | P0 | 2h | Score is deterministic |
| P6-003 | Store/recalculate trust | D2+D3 | P6-002 | P0 | 1.5h | Score can be recalculated |
| P6-004 | Trust badge UI | D1 | P6-003 | P0 | 1.5h | Score/signals visible |
| P6-005 | Trust explanation | D3 | P6-002 | P0 | 1h | User understands score |
| P6-006 | Trust tests | D3 | P6-002 | P0 | 1h | Boundary cases pass |

Trust should be recalculated whenever material signals change, or on demand for the MVP.

---

# Phase 7 — Community Recommendations

**Goal:** Add social proof without creating a complex social network.

| ID | Task | Owner | Dependencies | Priority | Effort | Definition of Done |
|---|---|---|---|---|---|---|
| P7-001 | Recommendation data access | D2 | DB schema | P1 | 1h | Recommendations can be queried |
| P7-002 | Recommendation creation | D2 | Auth | P1 | 1.5h | Authorized users can recommend |
| P7-003 | Recommendation display | D1 | P7-001 | P1 | 1.5h | Provider profile shows recommendations |
| P7-004 | Integrate recommendation count into trust | D3 | P7-001 | P1 | 0.5h | Count contributes to trust |
| P7-005 | Seed recommendations | D2 | P7-001 | P1 | 0.5h | Demo providers have social proof |

Do not build feeds, follower systems, messaging, or social graphs for MVP.

---

# Phase 8 — Provider Requests + Connect

**Goal:** Complete the "CONNECT" part of the product loop.

| ID | Task | Owner | Dependencies | Priority | Effort | Definition of Done |
|---|---|---|---|---|---|---|
| P8-001 | Request creation service | D2 | Auth, provider data | P0 | 2h | User can create request |
| P8-002 | Request status model | D2 | P8-001 | P0 | 1h | Status transitions are enforced |
| P8-003 | Provider request view | D1 | P8-001 | P0 | 2h | Provider can see relevant request |
| P8-004 | Provider response action | D2 | P8-002 | P0 | 1.5h | Provider can accept/decline |
| P8-005 | Connect confirmation UI | D1 | P8-004 | P0 | 1.5h | User sees successful connection |
| P8-006 | Connection persistence | D2 | P8-004 | P0 | 1h | Connection is stored |
| P8-007 | Request error/recovery | D1+D2 | P8-001 | P0 | 1h | Failed requests are recoverable |

### Request Statuses

Use a small state machine:

```text
pending
  ↓
accepted
  ↓
connected
```

Alternative terminal states:

```text
declined
cancelled
completed
```

Avoid a large workflow for the hackathon.

---

# Phase 9 — Map + Location

**Goal:** Make local matching credible without making maps the core product.

| ID | Task | Owner | Dependencies | Priority | Effort | Definition of Done |
|---|---|---|---|---|---|---|
| P9-001 | Browser geolocation service | D1 | P1 | P1 | 1.5h | Location permission handled |
| P9-002 | Location fallback | D1+D2 | P9-001 | P0 | 1h | User can continue without GPS |
| P9-003 | Distance calculation | D3 | P5 | P0 | 1h | Coordinates produce distance |
| P9-004 | Radius filtering | D3+D2 | P9-003 | P0 | 1h | Providers outside radius can be filtered |
| P9-005 | Map abstraction | D1 | P1 | P1 | 1h | Map vendor is isolated |
| P9-006 | Basic provider map | D1 | P9-005 | P1 | 2h | Providers can be visually located |
| P9-007 | Privacy handling | D2 | P9-001 | P0 | 1h | Exact user location is not unnecessarily exposed |

Location is an enhancement to matching, not a blocker for the core demo.

---

# Phase 10 — PWA

**Goal:** Make the web app installable and resilient enough for mobile demo use.

| ID | Task | Owner | Dependencies | Priority | Effort | Definition of Done |
|---|---|---|---|---|---|---|
| P10-001 | Web manifest | D1 | P1 | P1 | 0.5h | Install metadata valid |
| P10-002 | Service worker | D1 | P10-001 | P1 | 1.5h | Service worker registers |
| P10-003 | Static asset caching | D1 | P10-002 | P1 | 1h | Shell can load from cache |
| P10-004 | Offline fallback | D1 | P10-002 | P1 | 1h | Offline state is understandable |
| P10-005 | Installability test | D1 | P10-001 | P1 | 1h | Android/mobile install works |

Do not implement complex offline synchronization.

---

# Phase 11 — Testing

**Goal:** Protect the demo path before polishing.

| ID | Task | Owner | Dependencies | Priority | Effort | Definition of Done |
|---|---|---|---|---|---|---|
| P11-001 | Unit tests for matching | D3 | P5 | P0 | 2h | Ranking scenarios pass |
| P11-002 | AI parser tests | D3 | P4 | P0 | 2h | English/Hinglish cases validated |
| P11-003 | Trust calculation tests | D3 | P6 | P0 | 1h | Trust boundaries pass |
| P11-004 | Database/RLS tests | D2 | P2,P3,P8 | P0 | 2h | Unauthorized access blocked |
| P11-005 | Request integration tests | D2 | P8 | P0 | 1.5h | Request lifecycle works |
| P11-006 | Core UI tests | D1 | P4,P5,P8 | P0 | 2h | Critical components work |
| P11-007 | Mobile browser test | D1 | Core UI | P0 | 1.5h | Main path works on phone |
| P11-008 | PWA test | D1 | P10 | P1 | 1h | Install/cache behavior verified |
| P11-009 | Full demo regression | All | All P0 | P0 | 2h | Complete scripted path passes |

---

# Phase 12 — Polish

**Goal:** Convert a working prototype into a competitive hackathon product.

Only begin after the core demo is reliable.

| ID | Task | Owner | Dependencies | Priority | Effort | Definition of Done |
|---|---|---|---|---|---|---|
| P12-001 | Visual consistency pass | D1 | Core UI | P0 | 2h | Screens look cohesive |
| P12-002 | Micro-interactions/loading polish | D1 | Core UI | P1 | 1.5h | Transitions feel intentional |
| P12-003 | Empty/error state polish | D1 | Testing | P0 | 1h | No broken-looking states |
| P12-004 | Match explanation polish | D3 | P5 | P1 | 1h | Reasons are concise and useful |
| P12-005 | Trust presentation polish | D1+D3 | P6 | P1 | 1h | Trust feels credible |
| P12-006 | Performance pass | D1+D2 | Testing | P0 | 1.5h | No obvious slow paths |
| P12-007 | Demo seed-data cleanup | D2 | P3 | P0 | 1h | Demo results are deterministic |

---

# Phase 13 — Demo Preparation

**Goal:** Make the hackathon presentation repeatable.

| ID | Task | Owner | Dependencies | Priority | Effort | Definition of Done |
|---|---|---|---|---|---|---|
| P13-001 | Create canonical demo account | D2 | Auth | P0 | 0.5h | Login tested |
| P13-002 | Create canonical demo need | D3 | AI | P0 | 0.5h | Parser result is reliable |
| P13-003 | Verify top provider result | D3 | Matching | P0 | 0.5h | Expected provider ranks correctly |
| P13-004 | Verify trust story | D3+D2 | Trust | P0 | 0.5h | Trust signals are accurate |
| P13-005 | Verify connect flow | D2+D1 | P8 | P0 | 0.5h | Connection completes |
| P13-006 | Prepare fallback demo data | D2 | Seed | P0 | 1h | Demo can continue if API fails |
| P13-007 | Full rehearsal | All | All | P0 | 2h | Team can complete demo without intervention |
| P13-008 | Backup deployment/device | All | Deployment | P0 | 1h | Second access path works |

---

# 5. Detailed Dependency Graph

## Core Dependency Chain

```text
Repository
   ↓
Application Shell
   ↓
Supabase/Auth
   ↓
Provider Data + Seed Data
   ↓
Need Input
   ↓
AI Parser
   ↓
Structured Requirement
   ↓
Matching Engine
   ↓
Ranked Results
   ↓
Provider Profile
   ↓
Trust
   ↓
Connect
```

## Supporting Dependencies

```text
Provider Data ──────→ Matching
       │                  │
       ├→ Trust ──────────┤
       │                  │
       └→ Availability ───┘

User Location ─────────→ Distance Score
                              ↓
                         Matching

Recommendations ──────→ Trust
```

## Important Rule

No secondary feature should block:

```text
Need → Match → Connect
```

---

# 6. Parallel Work Plan

## Track A — Developer 1

```text
App shell
  ↓
Auth UI
  ↓
Need UI
  ↓
Requirement confirmation
  ↓
Results
  ↓
Provider profile
  ↓
Connect UI
  ↓
Responsive/PWA
  ↓
Polish
```

## Track B — Developer 2

```text
Supabase
  ↓
Migrations
  ↓
RLS
  ↓
Seed data
  ↓
Provider queries
  ↓
Request APIs
  ↓
Trust data
  ↓
Production deployment
```

## Track C — Developer 3

```text
Requirement schema
  ↓
AI abstraction
  ↓
Prompt/parser
  ↓
Matching
  ↓
Trust calculation
  ↓
Match explanation
  ↓
AI/matching tests
```

## Parallelization Rules

### Can happen immediately

- Frontend shell
- Supabase setup
- AI contract/prompt design

### Can happen after basic setup

- Provider UI
- Seed data
- AI parser
- Auth
- Matching algorithm skeleton

### Must integrate before polish

- AI parser + frontend
- Matching + provider data
- Trust + provider profile
- Connect + request backend

---

# 7. MVP Cut Line

## Minimum Demo Version — MUST WORK

The following is the absolute minimum:

### P0

- Landing page
- Login
- Need input
- AI requirement extraction
- Structured requirement confirmation
- Seeded provider dataset
- Deterministic matching
- Match score
- Provider results
- Provider profile
- Trust score
- Connect/request
- Request persistence
- Loading states
- Error states
- Mobile responsive layout
- Production deployment

The full path must work with one scripted request.

## Strong MVP — Build If Core Is Stable

### P1

- Browser location
- Distance-based ranking
- Availability matching
- Community recommendations
- Match explanations
- PWA installability
- Basic provider map
- Better trust details
- Provider request response

## Polish Layer

Only after all P0 items are stable:

- Animations
- Advanced empty states
- Visual refinement
- Better copy
- Smooth transitions
- Additional seeded categories
- Offline shell
- Demo-specific polish

---

# 8. Cut List

If time becomes constrained, cut in this order:

1. Advanced map interactions
2. Real-time notifications
3. Complex provider dashboard
4. Advanced recommendation logic
5. Offline data synchronization
6. Provider self-service onboarding
7. Advanced analytics
8. Multi-city support
9. Chat/messaging
10. Anything that does not improve Need → Match → Connect

**Never cut:**

- Need input
- AI parsing
- Matching
- Provider results
- Trust explanation
- Connect
- Error recovery

---

# 9. Testing Strategy

## 9.1 Unit Tests

Focus on deterministic business logic:

- Requirement normalization
- Budget normalization
- Distance calculation
- Skill score
- Budget score
- Availability score
- Trust score
- Final match score
- Ranking order

## 9.2 AI Parser Tests

Maintain a small fixed test corpus:

### English

```text
Need a math tutor for class 12 on weekends under ₹500.
```

### Hinglish

```text
Mujhe 12th maths tutor chahiye weekend pe 500 ke andar.
```

### Mixed

```text
Need a home tutor for physics, preferably weekend, budget 700.
```

### Invalid

```text
I need something.
```

Expected behavior:

- Valid input → structured requirement
- Ambiguous input → clarification/edit state
- Invalid model output → validation failure + fallback
- AI outage → graceful error/manual path

## 9.3 Matching Tests

Test:

- Exact skill match
- Partial skill match
- Over-budget provider
- Provider outside radius
- Unavailable provider
- High-trust vs low-trust provider
- Same skill but different distance
- No providers
- Multiple equal-score providers

## 9.4 Database/RLS Tests

Verify:

- User can read own private data
- User cannot read another user's private request details
- Provider can access requests intended for them
- Provider cannot modify another provider's profile
- Review creation is authorized
- Recommendation creation is authorized
- Connection data is restricted to participants

## 9.5 UI Tests

Critical screens:

- Login
- Need input
- Requirement confirmation
- Results
- Provider profile
- Connect

## 9.6 Mobile Testing

Test at minimum:

- Android Chrome
- iPhone Safari if available
- Small-width viewport
- Slow network
- Permission denied
- Offline/reconnection

## 9.7 Testing Principle

Do not aim for high theoretical coverage.

Aim for high confidence in the demo path.

---

# 10. Deployment Plan

## Recommended Deployment

```text
Git Repository
      ↓
Frontend deployment
      ↓
React/Vite PWA

Supabase
      ├── Auth
      ├── PostgreSQL
      ├── Storage
      └── RLS

AI Provider
      ↓
AI abstraction/service
```

Use the simplest reliable deployment available to the team.

## Environment Variables

Example categories:

```text
VITE_SUPABASE_URL
VITE_SUPABASE_ANON_KEY
AI_API_KEY
AI_PROVIDER
MAP_PROVIDER_KEY
```

Never commit secrets.

Only expose frontend-safe public configuration through `VITE_*` variables.

AI secret keys must remain server-side if the selected architecture requires server-side AI calls.

## Production Configuration

Before demo:

- Production Supabase project configured
- Production migrations applied
- Seed/demo records inserted
- RLS enabled
- AI credentials configured
- Production frontend build succeeds
- HTTPS enabled
- PWA manifest valid
- Service worker tested
- Mobile browser tested

## Deployment Checklist

```text
[ ] Production build
[ ] Supabase connected
[ ] Auth works
[ ] Seed data exists
[ ] AI works
[ ] Matching works
[ ] Trust works
[ ] Connect works
[ ] RLS verified
[ ] Mobile tested
[ ] PWA tested
[ ] Backup demo path tested
```

---

# 11. Database Implementation Order

Use the previously created backend schema.

Recommended migration sequence:

```text
1. Extensions / base types
2. Profiles / users
3. Categories
4. Services / skills
5. Locations
6. Providers
7. Provider skills/services
8. Provider availability
9. Requests
10. AI requirement data
11. Request matches
12. Reviews
13. Recommendations
14. Saved providers
15. Connections
16. Notifications if included
17. Indexes
18. Functions
19. RLS policies
20. Seed data
```

Apply and verify each migration before moving forward.

Do not redesign the database during the final demo phase unless a production blocker is discovered.

---

# 12. API / Service Implementation Boundaries

Keep frontend calls behind service modules.

Recommended boundaries:

```text
authService
providerService
requirementService
matchingService
trustService
requestService
recommendationService
locationService
```

The UI should not contain raw database queries scattered across components.

## Requirement Service

Input:

```text
raw user text
```

Output:

```text
validated StructuredRequirement
```

## Matching Service

Input:

```text
StructuredRequirement
candidate providers
```

Output:

```text
RankedProvider[]
```

## Request Service

Input:

```text
user
provider
requirement
```

Output:

```text
request + connection state
```

---

# 13. AI Implementation Strategy

## AI Abstraction

Define a vendor-neutral interface conceptually equivalent to:

```text
parseRequirement(input) → StructuredRequirement
```

The rest of the application must not care whether the model is Provider A, Provider B, or a future local model.

## Validation

AI output must pass runtime validation before entering the matching engine.

Validate:

- Category
- Service
- Level
- Budget
- Currency
- Availability
- Radius
- Optional location information

## Prompt Strategy

The prompt should instruct the model to:

1. Identify the user's intent.
2. Extract only relevant fields.
3. Normalize units.
4. Preserve ambiguity rather than invent details.
5. Return structured JSON.
6. Handle English/Hinglish naturally.
7. Avoid unsupported assumptions.

## Fallback

If AI fails:

```text
AI failure
   ↓
Retry once if appropriate
   ↓
Validation/manual edit
   ↓
User can correct requirement
```

Do not repeatedly retry expensive calls.

## Match Explanation

Prefer deterministic explanations based on actual scores:

```text
92% Match

✓ Strong maths skill match
✓ Within your ₹500 budget
✓ Available on weekends
✓ 2.1 km away
✓ High trust score
```

Do not ask the AI to invent reasons.

---

# 14. Matching Implementation

## Candidate Filtering

Before scoring, remove obvious mismatches:

- Unsupported service
- Outside maximum radius
- Clearly unavailable
- Invalid provider
- Provider not active

## Score Components

Normalize each component to `0–100`.

```text
Skill = 0–100
Distance = 0–100
Budget = 0–100
Availability = 0–100
Trust = 0–100
Rating = 0–100
```

Then:

```text
Final Score =
0.30 × Skill
+ 0.20 × Distance
+ 0.15 × Budget
+ 0.15 × Availability
+ 0.10 × Trust
+ 0.10 × Rating
```

Round to a user-friendly integer.

## Distance

A simple geographic distance calculation is sufficient for MVP.

Closer providers should receive higher scores.

## Budget

Suggested behavior:

- Provider comfortably within budget → high score
- Slightly above budget → lower score
- Significantly above budget → filter or near-zero score

## Availability

Exact requested availability receives the highest score.

Partial overlap receives a reduced score.

No availability overlap should normally be filtered.

---

# 15. Trust Implementation

Trust is derived from actual stored signals.

Potential inputs:

```text
Phone verification
Profile completeness
Rating
Completed jobs
Recommendations
Response rate
```

The score must be reproducible from stored data.

## Trust Display

Show:

```text
Trust Score: 86/100
```

with supporting signals such as:

- Phone verified
- 4.8 rating
- 27 completed jobs
- 8 community recommendations
- 94% response rate

Never display a verification claim that the backend cannot substantiate.

---

# 16. Hackathon Demo Plan

## Canonical Demo Scenario

Use a high-quality seeded example:

> "Mujhe 12th maths tutor chahiye weekend pe ₹500 ke andar."

Expected sequence:

```text
1. Landing
2. Enter need
3. AI extracts:
   - Education
   - Maths
   - Class 12
   - Weekend
   - ₹500
4. Confirm requirement
5. Matching begins
6. Results appear
7. Top provider has strong match score
8. User opens profile
9. Trust score and recommendations visible
10. User connects
11. Request status updates
```

This scenario should be deterministic enough to rehearse.

## Backup Scenario

Prepare a second need:

> "Need a nearby home tutor for physics under ₹700 on Sunday."

If the first scenario fails due to external API problems, switch to the backup.

## Offline/External API Backup

Keep demo seed data and a controlled fallback path.

The presentation should never depend on discovering a real provider during the demo.

---

# 17. Final Demo Checklist

## Authentication

- [ ] Login works
- [ ] Logout works
- [ ] Session persists
- [ ] Protected routes work

## Need

- [ ] Natural language input works
- [ ] English works
- [ ] Hinglish works
- [ ] Loading state works
- [ ] Parsing error is recoverable
- [ ] Requirement can be confirmed

## Matching

- [ ] Providers load
- [ ] Match scores appear
- [ ] Ranking is sensible
- [ ] Distance is shown
- [ ] Budget compatibility is shown
- [ ] Availability is shown
- [ ] Match explanation is accurate

## Trust

- [ ] Trust score appears
- [ ] Supporting signals are visible
- [ ] Recommendation count appears
- [ ] Rating is consistent
- [ ] No fake verification claim is displayed

## Provider

- [ ] Profile opens
- [ ] Skills are visible
- [ ] Pricing is visible
- [ ] Availability is visible
- [ ] Location/distance is visible

## Connect

- [ ] Connect button works
- [ ] Request is persisted
- [ ] Provider response path works if demonstrated
- [ ] Connection state is visible
- [ ] Error can be recovered

## Mobile/PWA

- [ ] Responsive layout
- [ ] Mobile browser test
- [ ] Install prompt/installation
- [ ] Manifest valid
- [ ] Offline fallback works

## Reliability

- [ ] AI API failure tested
- [ ] No-provider case tested
- [ ] Location denial tested
- [ ] Network interruption tested
- [ ] Production database verified
- [ ] Backup demo account ready

---

# 18. Presentation Support

Do not spend engineering time building presentation-only features.

Highlight what already exists technically.

## Problem

Local service discovery is fragmented and users often struggle to identify the right provider.

## Innovation

Local Connect converts:

```text
Natural-language need
        ↓
Structured intent
        ↓
Local provider matching
        ↓
Trust-aware ranking
        ↓
Direct connection
```

## AI

Highlight:

- English + Hinglish natural-language understanding
- Structured requirement extraction
- Runtime validation
- Vendor-independent AI abstraction
- Graceful fallback

## Matching

Explain that ranking is deterministic and transparent rather than a black box.

Show:

```text
Skill
Distance
Budget
Availability
Trust
Rating
```

## Trust

Highlight that trust is derived from measurable signals rather than a random AI-generated score.

## Impact

Explain that the same architecture can support:

- Tutors
- Repair professionals
- Home services
- Freelancers
- Local businesses
- Other hyperlocal services

## Scalability

Present:

```text
One locality
    ↓
Multiple localities
    ↓
City
    ↓
Multiple cities
```

The core data model already separates providers, services, locations, and requests so locality expansion does not require rebuilding the product.

---

# 19. Technical Risk Register

| Risk | Impact | Likelihood | Mitigation |
|---|---|---:|---|
| AI hallucination | High | Medium | Runtime schema validation + manual confirmation |
| AI API outage | High | Medium | Fallback/manual path + rehearsed demo data |
| Poor matching | High | Medium | Deterministic scoring + test cases + seeded data |
| Location denied | Medium | High | Manual/default locality fallback |
| Fake providers | High | Medium | Seed trusted demo data + verification signals only when real |
| Fake reviews | High | Medium | Clearly treat seeded recommendations as demo data |
| Fake verification claims | High | Low | Only show implemented verification states |
| RLS misconfiguration | High | Medium | Explicit security tests before deployment |
| API rate limits | Medium | Medium | Small request volume + caching/fallback |
| Slow AI response | Medium | Medium | Loading state + controlled retries |
| Mobile layout bugs | High | Medium | Test primary flow on physical phone |
| PWA issues | Low | Medium | Keep PWA scope simple |
| Scope creep | Critical | High | Enforce P0/P1/P2 cut line |
| Demo environment failure | Critical | Medium | Backup deployment/account/device |
| Seed data inconsistency | High | Medium | Freeze and verify demo dataset |

---

# 20. Definition of Done

Local Connect is considered **hackathon MVP complete** when all P0 requirements below are true.

## Product

- [ ] User can authenticate
- [ ] User can enter a natural-language need
- [ ] AI converts it to structured requirements
- [ ] User can confirm/edit the requirement
- [ ] Matching returns ranked local providers
- [ ] Match score is visible
- [ ] Match explanation is grounded in actual matching signals
- [ ] Provider profile is accessible
- [ ] Trust score is calculated from stored signals
- [ ] User can initiate a connection/request
- [ ] Request state is persisted
- [ ] Complete Need → Match → Connect path works

## Engineering

- [ ] Supabase production project configured
- [ ] Database migrations applied
- [ ] RLS enabled and tested
- [ ] Seed data verified
- [ ] AI output validated
- [ ] Matching unit tests pass
- [ ] Request integration tests pass
- [ ] Production build succeeds
- [ ] No secrets committed
- [ ] Critical errors have recovery paths

## UX/Reliability

- [ ] Loading states exist
- [ ] Empty states exist
- [ ] Error states exist
- [ ] Mobile layout works
- [ ] Location denial does not block the product
- [ ] AI failure does not produce a broken screen
- [ ] No-provider scenario is understandable
- [ ] Connect failure is recoverable

## Demo

- [ ] Canonical demo scenario tested
- [ ] Backup scenario tested
- [ ] Demo account ready
- [ ] Expected top provider verified
- [ ] Trust signals verified
- [ ] Connection verified
- [ ] PWA installation tested if included
- [ ] Backup deployment/device available
- [ ] Team can perform the demo without developer intervention

---

# 21. Final Execution Rule

The team should continuously ask:

> **Does this work improve Need → Match → Connect?**

If yes, prioritize it.

If it improves polish but does not affect reliability, build it after the core loop.

If it does neither, cut it.

The winning hackathon strategy is not maximum feature count. It is a **small, reliable, visually polished product whose technical intelligence is obvious within the first few minutes of the demo.**

## Final Priority

```text
P0
NEED
 ↓
AI PARSE
 ↓
MATCH
 ↓
TRUST
 ↓
PROVIDER
 ↓
CONNECT

P1
LOCATION
RECOMMENDATIONS
PWA
POLISH

P2
EVERYTHING ELSE
```

**Local Connect — Need → Match → Connect**
