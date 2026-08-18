# Local Connect — Technical Requirements Document

**Product:** Local Connect  
**Official Tagline:** **Need → Match → Connect**  
**Document Type:** Technical Requirements Document (TRD)  
**Target:** Hackathon-ready MVP  
**Team Size:** 3 developers  
**Primary Architecture:** React PWA + TypeScript + Supabase/PostgreSQL + AI abstraction + deterministic matching engine

---

# 1. Technical Overview

## 1.1 Purpose

This Technical Requirements Document defines how Local Connect will technically implement its core capability:

> **Convert a user's natural-language local service requirement into structured requirements, find relevant local providers, rank them intelligently, and enable the user to connect with a provider.**

The technical architecture is deliberately optimized for a **3-person hackathon team**.

## 1.2 Core Technical Model

```text
NEED
User enters natural-language requirement
        ↓
AI Requirement Parser
        ↓
Validated Structured Requirement
        ↓
MATCH
Candidate Provider Retrieval
        ↓
Deterministic Matching Engine
        ↓
Trust / Availability / Location Signals
        ↓
Ranked Providers
        ↓
CONNECT
Provider Profile
        ↓
Service Request / Contact
```

## 1.3 System Components

The system consists of:

- React + TypeScript PWA
- Supabase Auth
- Supabase PostgreSQL
- Supabase Storage
- Supabase Edge Functions where server-side execution is required
- AI provider abstraction layer
- Deterministic matching engine
- Location abstraction
- Provider and customer profiles
- Reviews and community recommendations
- Service request management
- Optional Supabase Realtime for request-status updates
- External map/geocoding provider
- AI API provider

The MVP should be implemented as a **modular monolith**, not a microservice architecture.

---

# 2. Goals & Non-Goals

## 2.1 Goals

### P0 Goals

1. Accept natural-language service requirements.
2. Parse English and Hinglish requirements.
3. Convert requirements into validated structured data.
4. Search providers within a configurable geographic radius.
5. Rank providers using deterministic scoring.
6. Incorporate budget, skill, distance, availability, and trust signals.
7. Display explainable match results.
8. Allow authenticated users to initiate a service request.
9. Provide provider profiles.
10. Support customer and provider roles.
11. Provide basic reviews and recommendations.
12. Work well on mobile browsers.
13. Be installable as a PWA.
14. Protect provider/customer data with database-level authorization.

## 2.2 Non-Goals

The following should **not** be implemented as MVP requirements:

- Custom machine-learning model training
- Full conversational AI agent
- Automated KYC
- Government-ID verification
- Payment processing
- Escrow
- Complex provider scheduling optimization
- Real-time location tracking
- Native Android/iOS applications
- Multi-region distributed infrastructure
- Kubernetes
- Microservices
- Advanced fraud detection ML
- Fully automated review authenticity detection
- Complex recommendation models
- Guaranteed provider availability
- Background GPS tracking

These can be considered after the hackathon MVP proves the core **Need → Match → Connect** loop.

---

# 3. Architecture

## 3.1 Architecture Style

Local Connect will use a **modular monolith with managed backend services**.

```text
┌───────────────────────────────┐
│           User                │
│       Mobile / Desktop        │
└───────────────┬───────────────┘
                │ HTTPS
                ▼
┌───────────────────────────────┐
│       React PWA Client        │
│ TypeScript + Vite + Tailwind  │
└───────────────┬───────────────┘
                │
                ▼
┌───────────────────────────────┐
│ Application Service Layer     │
│ Auth / Search / Requests / AI │
└───────────────┬───────────────┘
                │
       ┌────────┼─────────┐
       ▼        ▼         ▼
   Supabase   Edge      External
   Client     Functions  Services
       │        │
       ▼        ▼
┌───────────────────────────────┐
│       PostgreSQL              │
│ Providers / Profiles /        │
│ Requests / Reviews /          │
│ Recommendations / Locations   │
└───────────────────────────────┘
```

## 3.2 AI Matching Architecture

```text
User Requirement
      ↓
AI Parser
      ↓
Structured Requirement
      ↓
Candidate Provider Retrieval
      ↓
Matching Engine
      ↓
Trust Evaluation
      ↓
Provider Ranking
      ↓
Results
```

## 3.3 Architectural Principles

- Keep the MVP simple.
- Keep business logic independent from UI components.
- Keep AI provider-specific code behind an interface.
- Keep map provider-specific code behind an interface.
- Validate all AI output before application use.
- Perform authorization at the database layer as well as application layer.
- Prefer PostgreSQL queries over unnecessary custom backend infrastructure.
- Keep matching deterministic and testable.
- Never expose secret API keys to the browser.

---

# 4. Technology Stack

| Layer | Technology | Decision |
|---|---|---|
| Frontend | React | P0 |
| Language | TypeScript | P0 |
| Build | Vite | P0 |
| Styling | Tailwind CSS | P0 |
| UI | shadcn/ui | P1 |
| Backend platform | Supabase | P0 |
| Database | PostgreSQL | P0 |
| Authentication | Supabase Auth | P0 |
| File storage | Supabase Storage | P1 |
| Server-side functions | Supabase Edge Functions | P0 |
| Realtime | Supabase Realtime | P1 |
| AI | Provider-independent adapter | P0 |
| Maps | Provider-independent adapter | P0 |
| PWA | Web Manifest + Service Worker | P0 |
| Unit testing | Vitest | P0 |
| Component/E2E testing | Playwright | P1 |
| Validation | Zod | P0 |

## 4.1 Why Supabase

For a three-person hackathon team, Supabase reduces infrastructure overhead by providing:

- PostgreSQL
- Authentication
- Storage
- Row-Level Security
- Server-side functions
- Realtime capabilities

A separate Node.js API server is therefore **not required for the MVP**.

If business logic becomes significantly more complex, a dedicated API layer can be introduced later without changing the core database model.

---

# 5. Frontend Architecture

## 5.1 Application Structure

Recommended structure:

```text
src/
├── app/
│   ├── routes/
│   ├── providers/
│   └── app.tsx
│
├── components/
│   ├── ui/
│   ├── common/
│   ├── provider/
│   ├── matching/
│   └── request/
│
├── features/
│   ├── auth/
│   ├── need/
│   ├── matching/
│   ├── providers/
│   ├── requests/
│   ├── reviews/
│   └── profile/
│
├── services/
│   ├── auth/
│   ├── ai/
│   ├── matching/
│   ├── providers/
│   ├── requests/
│   └── location/
│
├── lib/
│   ├── supabase/
│   ├── validation/
│   └── utilities/
│
├── hooks/
├── types/
└── styles/
```

The structure is feature-oriented rather than organized entirely by technical layer.

## 5.2 Routes

Minimum routes:

```text
/
 /auth
 /search
 /matches
 /providers/:id
 /requests
 /requests/:id
 /profile
 /provider/profile
 /provider/requests
```

Protected routes will require authentication where appropriate.

## 5.3 State Management

The MVP should avoid introducing Redux unless complexity requires it.

Use:

- React state for local UI state
- React Context for small global concerns
- Server/database state through service functions and lightweight query caching if required
- URL state for shareable search/filter state

## 5.4 Forms

Use:

- Controlled or form-library-based inputs
- Zod schemas for validation
- Clear client-side validation
- Server-side validation for all security-sensitive operations

AI-generated requirements must use the same validation schemas as manually generated requirements.

## 5.5 Loading States

Every asynchronous operation must have explicit states:

```text
idle
loading
success
empty
error
```

AI parsing should display a meaningful processing state rather than exposing implementation details.

## 5.6 Error Handling

The frontend must translate backend errors into user-readable messages.

Do not display:

- database errors
- stack traces
- raw AI API errors
- API keys
- internal IDs unless intentionally exposed

---

# 6. Backend Architecture

## 6.1 Backend Model

The MVP backend will use:

1. Supabase Auth
2. PostgreSQL
3. Row-Level Security
4. Supabase Edge Functions
5. Supabase Storage

The frontend may use Supabase directly for safe database operations where RLS fully protects the operation.

Sensitive operations should execute through server-side functions.

## 6.2 Service Boundaries

Logical service boundaries:

```text
Auth Service
Profile Service
Provider Service
Requirement Service
AI Parser Service
Matching Service
Trust Service
Request Service
Review Service
Recommendation Service
Location Service
```

These are **logical modules**, not separate deployable microservices.

## 6.3 Authentication Service

Responsibilities:

- Sign-up
- Login
- Logout
- Session refresh
- Password recovery
- Authenticated identity
- Role association

Supabase Auth manages session infrastructure.

## 6.4 Provider Service

Responsibilities:

- Provider profile
- Skills
- Pricing
- Service radius
- Availability
- Location
- Profile completeness
- Provider status

## 6.5 Request Service

Responsibilities:

- Create service request
- Associate customer
- Associate provider
- Track request status
- Prevent unauthorized access
- Record timestamps

Suggested request lifecycle:

```text
created
→ sent
→ accepted
→ completed

Alternative:
sent → declined
sent → cancelled
```

The exact state model should remain intentionally small for the MVP.

---

# 7. AI Architecture

## 7.1 AI Requirement Parser

The parser converts:

> "Mujhe 12th maths tutor chahiye weekend pe ₹500 ke andar."

into structured data.

Example:

```json
{
  "service_category": "tutor",
  "skills": ["mathematics", "class 12"],
  "location": null,
  "radius_km": null,
  "budget": {
    "amount": 500,
    "currency": "INR",
    "period": "unspecified"
  },
  "availability": {
    "days": ["saturday", "sunday"],
    "time_ranges": []
  },
  "urgency": null,
  "language": "hinglish",
  "raw_text": "Mujhe 12th maths tutor chahiye weekend pe ₹500 ke andar."
}
```

The system must distinguish between information explicitly provided by the user and values inferred by the AI.

## 7.2 Input Schema

```text
raw_text
language_hint
location_context
optional_user_location
```

`raw_text` is mandatory.

## 7.3 Output Schema

The validated requirement should contain:

```text
service_category
skills[]
location
radius_km
budget
availability
urgency
language
raw_text
confidence
```

Where appropriate, fields can be `null`.

The AI must **not invent missing requirements**.

For example:

```text
"Mujhe maths tutor chahiye"
```

must not automatically become:

```text
class = 12
budget = ₹500
radius = 5 km
```

unless these values came from the user or an explicitly defined deterministic default.

## 7.4 AI Provider Abstraction

Use an internal interface conceptually equivalent to:

```text
AIProvider
 ├── parseRequirement()
 └── healthCheck()
```

The application interacts with the abstraction rather than directly with a particular AI vendor.

Potential implementations:

```text
PrimaryAIProvider
FallbackAIProvider
MockAIProvider
```

The exact vendor should remain configurable through environment variables/configuration.

## 7.5 Prompt Strategy

The parser prompt should:

1. Define the Local Connect requirement schema.
2. Explain allowed fields.
3. Require valid structured output.
4. Explicitly prohibit invented information.
5. Support English and Hinglish.
6. Normalize common Indian terms.
7. Preserve the original request.
8. Return `null` for unknown values.
9. Extract budget and availability conservatively.
10. Normalize synonyms.

Example normalization:

```text
"maths" → mathematics
"12th" → class 12
"weekend" → Saturday + Sunday
"500 ke andar" → maximum 500 INR
```

Normalization should be applied only when the meaning is unambiguous.

## 7.6 Validation

AI output must pass:

```text
AI response
   ↓
JSON parse
   ↓
Schema validation
   ↓
Business-rule validation
   ↓
Structured Requirement
```

Invalid output is never sent directly into the matching engine.

## 7.7 Fallback Behaviour

If AI fails:

1. Retry once when appropriate.
2. Attempt deterministic extraction for simple fields if implemented.
3. Ask the user to refine the requirement if required fields remain ambiguous.
4. Never silently fabricate values.

For the hackathon MVP, a deterministic fallback should be limited to obvious fields such as:

- numeric budget
- radius
- basic availability keywords

A complete NLP fallback is unnecessary.

## 7.8 Multilingual Requirements

The MVP should support:

- English
- Hinglish

The system should accept Roman-script Hindi naturally.

Examples:

```text
"500 ke andar"
"weekend pe"
"ghar pe aake"
"maths padhaane wala"
"nearby"
```

The canonical internal representation should remain language-neutral.

---

# 8. Matching Engine

## 8.1 Design Principle

Matching should be deterministic.

AI should **interpret the request**, not decide the final provider ranking.

This makes the system:

- explainable
- testable
- predictable
- easier to debug
- cheaper to operate

## 8.2 Matching Pipeline

```text
Structured Requirement
        ↓
Hard Filters
        ↓
Candidate Providers
        ↓
Feature Normalization
        ↓
Weighted Score
        ↓
Threshold
        ↓
Rank
        ↓
Explain
```

## 8.3 Hard Filters

Candidate providers should first be filtered using applicable hard constraints:

- provider is active
- provider provides required category
- required skill is sufficiently relevant
- provider is within allowed radius
- provider meets explicit budget constraints where data permits
- provider is available for explicitly required availability

Hard filtering should not reject a provider when the relevant provider field is simply unknown, unless the user explicitly required that attribute.

## 8.4 Score

Recommended MVP formula:

```text
Match Score =
30% Skill Relevance
20% Distance
15% Budget Fit
15% Availability
10% Trust
5% Rating
5% Experience
```

Total:

```text
100%
```

## 8.5 Skill Score

Normalized:

```text
0.0 → no relevance
0.5 → partial relevance
1.0 → strong relevance
```

Example:

```text
Exact skill/category match       = 1.0
Strong related skill             = 0.8
Partially related                = 0.5
Weak relationship                = 0.2
No relevant skill                = 0
```

## 8.6 Distance Score

Distance score should decay with distance.

For example:

```text
distance_score = max(0, 1 - distance / radius)
```

A provider at the user's location receives approximately 1.

A provider at the search-radius boundary receives 0.

The actual radius must be configurable.

## 8.7 Budget Score

If the user's maximum budget is known:

```text
provider_price <= user_budget
```

should receive a strong score.

Example:

```text
provider <= budget          = 1.0
provider <= 110% budget    = 0.7
provider <= 125% budget    = 0.4
provider > 125% budget     = 0
```

For explicit hard maximum budgets, providers exceeding the maximum may instead be filtered completely.

If provider pricing is unknown, do not assume it fits.

## 8.8 Availability Score

```text
Exact availability match     = 1.0
Partial overlap              = 0.5
Unknown                      = 0.3
Unavailable                  = 0
```

Unknown availability should not be treated as equivalent to available.

## 8.9 Trust Score

Trust is normalized to:

```text
0–100
```

and converted to:

```text
trust_normalized = trust_score / 100
```

## 8.10 Rating Score

Normalize a provider's rating to 0–1.

A minimum review-count safeguard should be used to prevent one five-star review from dominating a provider with substantial history.

## 8.11 Experience Score

Experience should be capped to avoid excessive advantage from very large values.

For example:

```text
experience_score =
min(years_experience / configured_cap, 1)
```

## 8.12 Ranking

Providers are sorted by descending Match Score.

Tie-breaking order:

1. Better hard requirement fit
2. Higher Trust Score
3. Higher availability
4. Shorter distance
5. Higher rating

## 8.13 Minimum Threshold

A provider should normally require a minimum score, for example:

```text
Match Score >= 0.50
```

The threshold should be configurable.

If no provider meets the threshold, return:

```text
No strong matches found
```

rather than presenting poor matches as good matches.

## 8.14 Explainability

Each result should expose reasons such as:

```text
✓ Exact mathematics match
✓ Within 3.2 km
✓ Fits your ₹500 budget
✓ Available on weekends
✓ High trust score
```

These explanations must be generated from actual scoring signals, not invented by an AI model.

---

# 9. Trust Engine

## 9.1 Purpose

Trust Score provides a transparent indicator of provider reliability.

It is **not identity verification** unless an actual verification mechanism is implemented.

The MVP must not describe a phone check as KYC.

## 9.2 Signals

Recommended MVP signals:

| Signal | Weight |
|---|---:|
| Phone verified | 15% |
| Profile completeness | 15% |
| Rating | 20% |
| Completed jobs | 20% |
| Community recommendations | 10% |
| Response rate | 20% |

Total:

```text
100%
```

## 9.3 Calculation

Each signal is normalized to 0–100.

```text
Trust Score =
0.15 Phone Verification
+ 0.15 Profile Completeness
+ 0.20 Rating
+ 0.20 Completed Jobs
+ 0.10 Recommendations
+ 0.20 Response Rate
```

The resulting value is rounded to an integer from:

```text
0–100
```

## 9.4 Cold-Start Handling

A new provider should not receive an artificially high score because of missing history.

Example:

```text
New provider:
verification + profile completeness
but no jobs/reviews
```

The system should show:

```text
New provider
```

alongside the Trust Score.

Trust should become stronger as actual platform activity accumulates.

## 9.5 Update Mechanism

Trust should be recalculated when relevant events occur:

- phone verification
- profile update
- completed request
- review submitted
- recommendation submitted
- response recorded

For MVP scale, synchronous recalculation or database-triggered updates are sufficient.

A background job system is unnecessary.

---

# 10. Location Architecture

## 10.1 Location Acquisition

The client may request browser geolocation permission.

Possible sources:

1. Browser GPS/geolocation
2. User-selected locality
3. Manually entered location
4. Provider profile location

## 10.2 Permission Handling

Location is optional.

If permission is denied:

```text
Location permission denied
        ↓
Ask user to enter locality/address
        ↓
Geocode location
        ↓
Use approximate coordinates
```

The application must remain usable without live GPS.

## 10.3 Coordinates

Store coordinates as:

```text
latitude
longitude
```

Use PostgreSQL/PostGIS where available and justified for efficient geographic querying.

For a single-locality hackathon deployment, a standard coordinate representation plus server-side distance calculation is acceptable if PostGIS setup would materially slow development.

However, **PostGIS is recommended** because radius-based provider discovery is central to the product.

## 10.4 Distance Calculation

Use geographic distance, preferably PostGIS spatial functions.

The system must not calculate distance from raw latitude/longitude using simplistic degree differences.

## 10.5 Radius Search

The search process should:

```text
User coordinates
      ↓
Configured search radius
      ↓
Geographic candidate query
      ↓
Matching engine
```

Default radius should be configurable rather than hard-coded.

## 10.6 Map Abstraction

Create:

```text
MapProvider
 ├── geocode()
 ├── reverseGeocode()
 ├── renderMap()
 └── calculate/display directions where required
```

The MVP only needs enough functionality to:

- locate providers
- display approximate location
- support local discovery

A map is not required for the core matching calculation.

## 10.7 Privacy

Do not expose exact customer coordinates to providers by default.

Customer location should be represented approximately where possible.

Provider addresses should also be exposed according to provider privacy settings.

The matching engine may use precise coordinates internally while UI presentation uses locality or approximate position.

---

# 11. Authentication & Authorization

## 11.1 Roles

Minimum roles:

```text
customer
provider
admin
```

A user may potentially have both customer and provider capabilities, but the MVP should keep role behavior simple.

## 11.2 Authentication

Supabase Auth handles:

- email/password or configured authentication method
- session management
- token handling
- password reset

Social login should be considered optional rather than required for the MVP.

## 11.3 Protected Resources

Authentication is required for:

- creating service requests
- editing personal profile
- editing provider profile
- submitting reviews
- submitting recommendations

Public or semi-public:

- provider discovery
- provider profiles
- aggregate ratings

depending on the product's final privacy policy.

## 11.4 Authorization

Authorization must be enforced in two places:

```text
Frontend route protection
+
Database Row-Level Security
```

Frontend protection is for UX.

RLS is the actual security boundary.

## 11.5 Ownership

A customer may:

- read their own requests
- create requests for themselves
- cancel eligible requests
- submit permitted reviews

A provider may:

- read requests assigned/sent to them
- update their own provider profile
- update permitted request statuses

A user must never be able to access another user's private records simply by changing an ID in a request.

---

# 12. PWA Architecture

## 12.1 Manifest

The application must provide:

- application name
- short name
- icons
- start URL
- display mode
- theme/background metadata

## 12.2 Service Worker

The service worker should provide:

- static asset caching
- application shell caching
- offline fallback

## 12.3 Caching Strategy

Recommended:

```text
Static assets       → Cache-first
Application shell   → Cache-first
API data             → Network-first
Sensitive data       → No persistent offline cache unless necessary
```

Do not cache private customer/provider information indiscriminately.

## 12.4 Offline Behaviour

If offline:

- show cached application shell
- show a clear offline state
- allow navigation to cached public content where safe
- prevent actions requiring the server
- retry requests when the network returns where safe

The MVP does not need full offline-first request creation.

## 12.5 Installability

The application should satisfy browser installability requirements.

## 12.6 Push Notifications

The MVP should be **push-notification ready**, but full push infrastructure is P1 unless the hackathon requires it.

A request-status architecture should avoid making push notifications mandatory.

---

# 13. Data Architecture

Detailed SQL schema is intentionally excluded from this TRD.

## 13.1 Core Entities

### User

Represents authenticated identity.

### Customer Profile

Customer-specific profile information.

### Provider Profile

Provider-specific information.

### Provider Skill

Normalized provider capabilities.

### Service Category

High-level service taxonomy.

### Requirement

Original user need and parsed structured representation.

### Availability

Provider availability information.

### Service Request

Connection/request between customer and provider.

### Review

Customer feedback following an eligible interaction.

### Community Recommendation

Recommendation signal for a provider.

### Location

Provider/customer location metadata.

### Trust Metrics

Aggregated trust signals.

## 13.2 Relationships

Conceptually:

```text
User
 ├── Customer Profile
 └── Provider Profile

Provider Profile
 ├── Skills
 ├── Availability
 ├── Reviews
 ├── Recommendations
 └── Trust Metrics

Customer
 └── Requirements
      └── Service Requests
             └── Provider

Service Request
 └── Review
```

## 13.3 Primary Keys

Use UUIDs for application entities.

This avoids predictable sequential identifiers and simplifies distributed creation.

## 13.4 Foreign Keys

Foreign keys must enforce relationships between:

- users
- profiles
- providers
- requirements
- requests
- reviews
- recommendations
- skills
- availability

## 13.5 Important Indexes

At minimum:

- provider active status
- provider category
- provider skill
- geographic location
- service request customer
- service request provider
- service request status
- reviews provider
- recommendations provider
- provider rating/trust fields

Geographic indexes should be used when PostGIS is adopted.

## 13.6 Constraints

Examples:

- rating must be within valid range
- budget cannot be negative
- latitude must be valid
- longitude must be valid
- trust score must remain 0–100
- duplicate recommendation rules should be enforced
- review eligibility should be enforced
- request state transitions should be controlled

## 13.7 Data Ownership

Every private entity must have an identifiable owner or authorized relationship.

RLS policies should be designed around ownership and role.

---

# 14. API Architecture

## 14.1 API Philosophy

The MVP does not require a large REST API server.

Use:

```text
React
 ↓
Application services
 ↓
Supabase SDK / Edge Functions
```

## 14.2 Logical API Operations

### Requirement

```text
parseRequirement(input)
```

### Provider Discovery

```text
searchProviders(requirement, location)
```

### Matching

```text
generateMatches(requirement, location)
```

### Provider

```text
getProvider(id)
updateProviderProfile(data)
```

### Requests

```text
createRequest(providerId, requirementId)
getMyRequests()
updateRequestStatus(id, status)
```

### Reviews

```text
createReview(requestId, rating, content)
```

### Recommendations

```text
createRecommendation(providerId, content)
```

Sensitive operations may be implemented through Edge Functions.

## 14.3 AI Endpoint

AI parsing should be server-side:

```text
POST /functions/v1/parse-requirement
```

The exact endpoint naming can differ, but the AI key must never reach the client.

## 14.4 Match Endpoint

Conceptually:

```text
POST /functions/v1/match
```

Input:

```text
structured_requirement
location_context
```

Output:

```text
ranked providers
match scores
match explanations
```

If the matching query can safely be executed directly through PostgreSQL/RPC with RLS, an Edge Function is not mandatory.

---

# 15. Security

## 15.1 Authentication Security

- Use managed authentication.
- Never store raw passwords.
- Use secure session mechanisms.
- Do not place authentication tokens in application logs.
- Protect authenticated routes.

## 15.2 Authorization

RLS must prevent:

- unauthorized profile editing
- unauthorized request access
- unauthorized review modification
- unauthorized recommendation modification

## 15.3 Input Validation

Validate:

- user input
- AI output
- query parameters
- budgets
- coordinates
- request status
- ratings
- review content

Use shared schemas where practical.

## 15.4 API Security

- Keep AI and map secret keys server-side when required.
- Validate authenticated identity.
- Rate-limit expensive AI endpoints.
- Limit request payload size.
- Reject malformed input.

## 15.5 Database Security

Use:

- RLS
- least-privilege access
- constraints
- server-side privileged credentials only inside trusted server environments

The Supabase service-role key must never be shipped to the browser.

## 15.6 Secrets

Environment variables:

```text
VITE_SUPABASE_URL
VITE_SUPABASE_ANON_KEY

SUPABASE_SERVICE_ROLE_KEY
AI_API_KEY
MAPS_API_KEY
```

Only variables explicitly intended for browser exposure may use the `VITE_` prefix.

## 15.7 Rate Limiting

At minimum, rate-limit:

- AI parsing
- service-request creation
- review creation
- recommendation creation
- authentication-related abuse where supported

## 15.8 Abuse Prevention

MVP safeguards:

- authenticated review submission
- one review per eligible request
- recommendation limits
- request creation throttling
- basic suspicious activity logging

Advanced fraud detection is P2.

## 15.9 Location Privacy

- Ask for location permission only when useful.
- Explain why location is needed.
- Store the minimum location precision necessary.
- Avoid exposing customer exact coordinates.
- Allow manually selected locality.

---

# 16. Performance

## 16.1 Targets

These are practical hackathon MVP targets rather than hard SLAs.

| Operation | Target |
|---|---:|
| Initial application shell | < 2.5 sec on reasonable mobile connection |
| Standard database query | < 500 ms |
| Provider search | < 1 sec target |
| Match generation excluding AI | < 1.5 sec target |
| AI parsing | < 5 sec target |
| Provider profile | < 1 sec target |
| Mobile interaction response | < 100 ms for local UI interactions |

AI latency is inherently dependent on the selected provider.

## 16.2 Frontend Performance

Use:

- code splitting where useful
- lazy loading for non-critical routes
- optimized images
- compressed assets
- minimal third-party JavaScript
- cached static assets

## 16.3 Database Performance

Avoid:

- fetching all providers into the browser
- N+1 queries
- unbounded review queries
- client-side geographic filtering

Use:

- indexes
- server-side filtering
- pagination
- geographic queries
- selected columns instead of unnecessary full records

## 16.4 Matching Performance

Candidate retrieval should happen before scoring.

Do not calculate expensive matching scores for every provider in the locality if geographic/category filters can reduce the candidate set first.

---

# 17. Error Handling

## 17.1 No Providers Found

Return:

```text
No strong matches found
```

Provide possible recovery:

- increase radius
- relax optional criteria
- modify requirement

The system should not invent providers.

## 17.2 AI Parsing Failure

Fallback:

```text
AI failure
 ↓
retry
 ↓
deterministic extraction where possible
 ↓
request clarification if required
```

## 17.3 Location Denied

Fallback to:

- manually entered locality
- address search
- previously selected location if safely available

## 17.4 Provider Unavailable

Provider availability should be rechecked before allowing a final connection action where applicable.

A provider marked unavailable should not rank normally.

## 17.5 Invalid Budget

Reject:

```text
negative budget
invalid currency
malformed numeric values
```

If budget is missing, continue without budget scoring rather than inventing one.

## 17.6 Invalid Request

Return validation error.

The backend must not trust frontend validation.

## 17.7 Network Failure

The UI must distinguish:

```text
No results
```

from:

```text
Could not connect to server
```

These are materially different conditions.

## 17.8 Incomplete Provider Profile

Incomplete providers can still appear if they satisfy enough matching criteria, but:

- their missing attributes must not be fabricated
- their trust score should reflect missing information
- the UI should indicate missing information where relevant

---

# 18. Third-Party Integrations

## 18.1 AI API

**Purpose:** Natural-language requirement extraction.

**MVP necessity:** P0.

**Why:** Core to natural-language NEED processing.

**Fallback:** Deterministic extraction for limited fields + user refinement.

**Abstraction:** Required.

## 18.2 Supabase

**Purpose:**

- database
- authentication
- storage
- server functions
- optional realtime

**MVP necessity:** P0.

**Fallback:** Firebase or custom PostgreSQL/backend, but migration would increase hackathon complexity.

## 18.3 Maps / Geocoding

**Purpose:**

- geocoding
- reverse geocoding
- map visualization

**MVP necessity:** P0 for location-driven discovery.

**Fallback:** Manual locality selection and direct coordinate capture.

The map provider should be hidden behind a `MapProvider` interface.

## 18.4 Notifications

Possible options:

- browser push
- email provider
- managed notification service

**MVP necessity:** P2 unless the demo requires request notifications.

For the hackathon, request-status visibility inside the application is sufficient.

## 18.5 Storage

Supabase Storage should be used for:

- provider profile images
- optional supporting media

Do not store large files directly in PostgreSQL.

---

# 19. Testing Strategy

Testing should focus on the parts most likely to break the core product promise.

## 19.1 Unit Testing

Use Vitest for:

- budget normalization
- distance scoring
- skill scoring
- availability scoring
- trust calculation
- final matching score
- thresholds
- requirement validation
- request-state transitions

## 19.2 AI Output Testing

Maintain a fixture set containing:

```text
English
Hinglish
Ambiguous
Incomplete
Budget-heavy
Availability-heavy
Location-heavy
Invalid
```

Example:

```text
"Mujhe 12th maths tutor chahiye weekend pe ₹500 ke andar."
```

Expected properties:

```text
category = tutor
skill = mathematics
class = 12
availability = weekend
budget <= 500 INR
```

Do not assert exact wording from an AI response.

Assert the validated semantic structure.

## 19.3 Matching Tests

Create deterministic provider fixtures.

Example:

```text
Provider A:
exact skill
2 km
₹400
high trust

Provider B:
related skill
1 km
₹300
low trust
```

Verify the expected ranking.

Also test:

- no matches
- budget conflict
- distance boundary
- missing availability
- missing rating
- new provider
- equal scores

## 19.4 Integration Testing

Test:

```text
Authentication
→ Requirement
→ Parsing
→ Candidate retrieval
→ Matching
→ Provider selection
→ Request creation
```

## 19.5 UI Testing

Use Playwright selectively for critical journeys:

1. User authenticates.
2. User enters a need.
3. Need is parsed.
4. Matches appear.
5. User opens provider.
6. User creates request.

Do not attempt complete end-to-end coverage of every UI component during the hackathon.

## 19.6 PWA Testing

Verify:

- manifest
- installability
- service worker
- offline fallback
- cached application shell

## 19.7 Mobile Testing

At minimum test:

- Android Chrome
- one modern iOS browser
- narrow viewport
- slow network
- location denied
- offline transition

---

# 20. Deployment

## 20.1 Frontend

Deploy the React/Vite application to a managed static hosting/CDN platform.

Requirements:

- HTTPS
- SPA routing support
- environment configuration
- production build

## 20.2 Backend

Use Supabase hosted infrastructure.

Deploy:

- database
- RLS policies
- Edge Functions
- Storage configuration

## 20.3 Environments

Minimum:

```text
local
production
```

A staging environment is desirable but not required for a short hackathon.

## 20.4 Environment Configuration

Separate:

```text
public configuration
```

from:

```text
server secrets
```

Never commit secrets to Git.

## 20.5 Git Workflow

Recommended:

```text
main
feature/*
fix/*
```

Use pull requests even for a three-person team.

Each change should ideally:

- compile
- pass relevant tests
- avoid breaking the production branch

---

# 21. Scalability

## 21.1 One Locality

The MVP should treat locality as data rather than a hard-coded application constant.

Provider records should contain locality/geographic information.

## 21.2 Multiple Localities

The same architecture can support:

```text
Locality
 ├── Providers
 ├── Customers
 └── Requirements
```

Geographic filtering remains the primary discovery mechanism.

## 21.3 City Scale

At city scale:

- PostGIS indexes become increasingly important.
- Candidate retrieval must remain server-side.
- Provider search should be geographically bounded.
- Pagination becomes mandatory.
- Aggregated trust/rating values should be indexed or cached where appropriate.

## 21.4 Multiple Cities

Introduce explicit geographic hierarchy:

```text
Country
 → State
 → City
 → Locality
```

The matching engine remains largely unchanged.

## 21.5 Future Scaling Architecture

If traffic grows substantially:

```text
React PWA
    ↓
API / BFF
    ↓
Domain Services
    ↓
PostgreSQL
    ↓
Async Jobs / Queues
    ↓
Analytics / Recommendation Systems
```

AI parsing and matching can later be moved into dedicated services.

This is intentionally **not required for MVP**.

---

# 22. Technical Risks

## 22.1 AI Hallucination

**Risk:** AI invents budget, location, skills, or availability.

**Mitigation:**

- strict schema
- explicit null handling
- structured output
- post-validation
- prompt instructions against inference
- deterministic business validation

## 22.2 Poor Matching

**Risk:** Relevant providers rank poorly.

**Mitigation:**

- deterministic scoring
- weighted features
- fixture-based tests
- explainable scores
- configurable weights
- manual evaluation using realistic examples

## 22.3 Location Accuracy

**Risk:** GPS is unavailable or inaccurate.

**Mitigation:**

- manual locality fallback
- approximate location
- configurable radius
- avoid requiring GPS

## 22.4 Fake Reviews

**Risk:** Providers manipulate reviews.

**Mitigation:**

- reviews linked to eligible requests
- one review per eligible interaction
- display review count
- avoid treating a single review as definitive trust

## 22.5 Fake Providers

**Risk:** Provider identity may not be genuine.

**Mitigation:**

- phone verification
- profile completeness
- community recommendations
- transparent trust signals

Do not claim government identity verification.

## 22.6 API Dependency

**Risk:** AI/map provider outage.

**Mitigation:**

- abstraction layer
- fallback behavior
- cached public data where safe
- graceful errors

## 22.7 Privacy

**Risk:** precise locations or personal information are exposed.

**Mitigation:**

- RLS
- minimum data collection
- approximate location display
- protected requests
- no unnecessary coordinate exposure

## 22.8 Performance

**Risk:** geographic search becomes slow.

**Mitigation:**

- PostGIS
- geographic indexes
- server-side candidate filtering
- pagination
- bounded radius

## 22.9 Hackathon Scope

**Risk:** too many features reduce reliability of the core experience.

**Mitigation:**

Prioritize:

```text
NEED → MATCH → CONNECT
```

Everything else supports that loop.

---

# 23. Technical Requirements

## 23.1 P0 — Critical

### TR-P0-001 — Natural Language Input

The system shall accept free-form natural-language service requirements.

### TR-P0-002 — Requirement Parsing

The system shall convert supported English and Hinglish requests into validated structured requirements.

### TR-P0-003 — AI Abstraction

The AI implementation shall be isolated behind a provider-independent interface.

### TR-P0-004 — AI Validation

All AI-generated requirements shall pass schema and business validation before matching.

### TR-P0-005 — Provider Retrieval

The system shall retrieve providers based on service relevance and geographic constraints.

### TR-P0-006 — Deterministic Matching

The system shall calculate provider rankings using a deterministic weighted scoring algorithm.

### TR-P0-007 — Location

The system shall support location-based provider discovery.

### TR-P0-008 — Location Fallback

The system shall continue functioning when browser location permission is denied.

### TR-P0-009 — Provider Profiles

The system shall store and display provider profiles and relevant service attributes.

### TR-P0-010 — Authentication

The system shall support authenticated customer and provider identities.

### TR-P0-011 — Authorization

The system shall enforce ownership and role permissions through database-level security.

### TR-P0-012 — Service Requests

Authenticated customers shall be able to initiate a service request to a selected provider.

### TR-P0-013 — Request Ownership

Customers and providers shall only access requests they are authorized to access.

### TR-P0-014 — Trust Score

The system shall calculate a transparent 0–100 trust score from available signals.

### TR-P0-015 — PWA

The application shall be installable as a PWA and provide an offline fallback.

### TR-P0-016 — Security

No server-side secret shall be exposed to the client.

### TR-P0-017 — Error Handling

The application shall gracefully handle AI, database, location, network, and empty-result failures.

### TR-P0-018 — Responsive Performance

The core matching experience shall be usable on modern mobile devices.

---

## 23.2 P1 — Important

### TR-P1-001 — Reviews

Eligible customers shall be able to submit provider reviews.

### TR-P1-002 — Community Recommendations

Users shall be able to provide community recommendations subject to basic abuse controls.

### TR-P1-003 — Availability

Provider availability shall influence matching.

### TR-P1-004 — Realtime Status

Request-status updates may use Supabase Realtime where it improves the experience.

### TR-P1-005 — Provider Images

Provider profile images shall use managed object storage.

### TR-P1-006 — Advanced PWA

The application shall be architected to support browser push notifications.

### TR-P1-007 — Improved Candidate Retrieval

Geographic queries shall use PostGIS or an equivalent indexed spatial approach.

### TR-P1-008 — Automated Test Fixtures

The project shall maintain representative AI and matching fixtures.

### TR-P1-009 — Match Explainability

The system shall expose the main factors contributing to a provider's ranking.

---

## 23.3 P2 — Future

### TR-P2-001 — Payments

Support online payment processing.

### TR-P2-002 — Escrow

Support payment escrow.

### TR-P2-003 — Advanced Fraud Detection

Use behavioral signals and potentially ML to identify fraudulent providers/reviews.

### TR-P2-004 — Full Identity Verification

Integrate an actual identity-verification provider.

### TR-P2-005 — Advanced Recommendation Model

Replace or augment deterministic ranking with learned ranking models after sufficient interaction data exists.

### TR-P2-006 — Push Notifications

Implement complete push notification infrastructure.

### TR-P2-007 — Native Mobile Apps

Build dedicated Android/iOS clients if justified.

### TR-P2-008 — Multi-City Optimization

Add city-level search optimization and regional indexing.

---

# 24. Definition of Done

The Local Connect MVP is technically complete when the following conditions are satisfied.

## 24.1 NEED

- [ ] A user can authenticate.
- [ ] A user can enter a natural-language requirement.
- [ ] English input works.
- [ ] Hinglish input works for representative cases.
- [ ] AI converts the requirement into structured data.
- [ ] Structured data passes validation.
- [ ] Missing information is not fabricated.
- [ ] AI failures are handled gracefully.

## 24.2 MATCH

- [ ] Providers can be stored with categories and skills.
- [ ] Provider locations are available.
- [ ] Candidate providers can be geographically filtered.
- [ ] Matching uses deterministic scoring.
- [ ] Budget is incorporated where available.
- [ ] Availability is incorporated where available.
- [ ] Trust contributes to ranking.
- [ ] Rating contributes to ranking.
- [ ] Results are sorted by match score.
- [ ] Low-quality matches are filtered or clearly identified.
- [ ] Match explanations correspond to actual scoring signals.

## 24.3 CONNECT

- [ ] Users can open provider profiles.
- [ ] Provider profiles show relevant service information.
- [ ] An authenticated customer can create a service request.
- [ ] Providers can view requests intended for them.
- [ ] Request status can be updated through permitted transitions.
- [ ] Unauthorized users cannot access private request data.

## 24.4 TRUST

- [ ] Phone verification state is represented where implemented.
- [ ] Profile completeness is measurable.
- [ ] Ratings are incorporated.
- [ ] Completed requests/jobs are incorporated.
- [ ] Recommendations are incorporated where implemented.
- [ ] Response behavior can contribute to trust.
- [ ] Trust remains within 0–100.
- [ ] The system does not claim KYC unless genuine identity verification exists.

## 24.5 LOCATION

- [ ] Browser location can be requested.
- [ ] Permission denial does not break discovery.
- [ ] Manual location fallback exists.
- [ ] Distance can be calculated reliably.
- [ ] Provider radius filtering works.
- [ ] Exact customer coordinates are not unnecessarily exposed.

## 24.6 SECURITY

- [ ] Authentication is enforced for protected operations.
- [ ] RLS policies are enabled.
- [ ] Users cannot access other users' private requests.
- [ ] Secrets are not committed to source control.
- [ ] AI credentials remain server-side.
- [ ] User input is validated.
- [ ] AI output is validated.
- [ ] Basic abuse/rate controls exist for expensive operations.

## 24.7 PWA

- [ ] Web manifest exists.
- [ ] Application is installable.
- [ ] Service worker is registered.
- [ ] Static assets can be cached.
- [ ] Offline fallback works.
- [ ] Network-dependent actions fail gracefully offline.

## 24.8 Performance

- [ ] Provider search is server-side.
- [ ] Geographic queries are indexed appropriately.
- [ ] The frontend does not download the entire provider database.
- [ ] Large result sets are paginated or bounded.
- [ ] Mobile performance is acceptable on a normal mobile connection.

## 24.9 Testing

- [ ] Matching scoring has unit tests.
- [ ] Trust calculation has unit tests.
- [ ] Requirement validation has unit tests.
- [ ] Representative English/Hinglish AI fixtures exist.
- [ ] At least one end-to-end NEED → MATCH → CONNECT test passes.
- [ ] PWA installation/offline behavior has been manually tested.
- [ ] Location-denied behavior has been tested.

---

# Final Technical Recommendation

For a three-person hackathon team, Local Connect should **not** be implemented as a collection of independent microservices.

The recommended implementation is:

```text
                    LOCAL CONNECT
                         │
                         ▼
                 ┌───────────────┐
                 │   React PWA   │
                 │ TypeScript    │
                 │ Vite/Tailwind │
                 └───────┬───────┘
                         │
                         ▼
              ┌─────────────────────┐
              │ Application Services│
              └─────────┬───────────┘
                        │
           ┌────────────┼─────────────┐
           ▼            ▼             ▼
       Supabase      Edge Functions  External
           │            │             APIs
           ▼            ▼
     PostgreSQL       AI Adapter
       + RLS             │
       + PostGIS         ▼
       + Storage      AI Provider
           │
           ▼
     Provider Data
     Requirements
     Requests
     Reviews
     Trust
     Availability
```

The critical product intelligence should remain concentrated in two deterministic boundaries:

```text
Natural Language
      ↓
AI Requirement Parser
      ↓
Validated Requirement
      ↓
Deterministic Matching Engine
      ↓
Ranked Providers
```

This creates a clean separation between **AI interpretation** and **business decision-making**.

The resulting MVP remains technically credible while keeping the central promise extremely focused:

> **NEED** — understand what the user wants  
> **MATCH** — identify and rank the best nearby providers  
> **CONNECT** — let the user initiate a real service request

That architecture is sufficient for a hackathon demonstration while providing a practical migration path from **one locality → multiple localities → city-scale → multi-city deployment** without prematurely introducing unnecessary infrastructure.
