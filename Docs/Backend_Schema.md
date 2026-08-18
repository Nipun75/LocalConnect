# Local Connect — Complete MVP Backend / PostgreSQL Schema

**Official Tagline:** Need → Match → Connect

## 1. Database Architecture

```text
auth.users
    │
    ▼
profiles
    │
    ├──────────────► saved_providers
    ├──────────────► requests
    │                    │
    │                    ├──► request_matches ──► providers
    │                    └──► connections
    └──────────────► recommendations

providers
    ├──► provider_services ──► services ──► categories
    ├──► provider_availability
    ├──► locations
    ├──► reviews
    └──► provider_trust_scores
```

### Core entities

| Entity | Purpose |
|---|---|
| `profiles` | User account/profile |
| `providers` | Provider-specific information |
| `categories` | Service categories |
| `services` | Individual services |
| `provider_services` | Provider ↔ service relationship |
| `locations` | Provider/requester locations |
| `provider_availability` | Weekly provider availability |
| `requests` | User's requirement/need |
| `request_matches` | Matching engine output |
| `connections` | Actual user-provider interaction |
| `reviews` | Completed-job reviews |
| `provider_trust_scores` | Recalculable trust snapshot |
| `recommendations` | AI/system recommendations |
| `saved_providers` | User bookmarks |
| `notifications` | Important events |

## 2. AI Requirement Storage

Use a **hybrid model**.

JSONB stores the complete AI output:

```json
{
  "category": "education",
  "service": "math tutor",
  "level": "12th",
  "budget": 500,
  "availability": ["weekend"],
  "radius_km": 5
}
```

Store this in:

```text
requests.ai_parsed_requirement
```

Important matching fields are normalized:

```text
category_id
service_id
budget_max
radius_km
latitude
longitude
```

### Decision

- **JSONB** = AI source/audit output and flexible attributes.
- **Normalized columns** = validated matching fields, indexes and constraints.

This gives flexibility without sacrificing query performance.

## 3. Users

### `profiles`

| Column | Type | Nullable | Default |
|---|---|---:|---|
| `id` | UUID | No | `auth.uid()` |
| `full_name` | TEXT | No | — |
| `avatar_url` | TEXT | Yes | NULL |
| `phone` | TEXT | Yes | NULL |
| `bio` | TEXT | Yes | NULL |
| `created_at` | TIMESTAMPTZ | No | `now()` |
| `updated_at` | TIMESTAMPTZ | No | `now()` |

`id` references `auth.users(id)`.

Phone should not be publicly exposed.

## 4. Providers

A provider is a user who offers services.

### `providers`

Important fields:

```text
id
user_id
display_name
bio
experience_years
phone_verified_at        -- NEW: replaces verification_status (see below)
identity_submitted_at    -- NEW: submission only, never implies verification
recommendation_count     -- NEW: cached count, see §16a
response_rate
completed_jobs
average_rating
total_reviews
service_radius_km
is_active
```

**`verification_status` (the single-tier enum) is retired for MVP.** It could not represent four independent badge states (Phone Verified / Identity Submitted / Profile Verified / Community Recommended) — see the Canonical Trust Score Formula (§15). `phone_verified_at` and `identity_submitted_at` replace it with two independent, genuinely computable signals. Profile Verified is derived at query time from profile-completeness, not stored. Bring a review-state enum back if/when real KYC is added post-hackathon.

Trust score is not manually entered. It is calculated from provider activity.

**Column-level write protection:** `completed_jobs`, `average_rating`, `total_reviews`, `response_rate`, `phone_verified_at`, `identity_submitted_at`, and `recommendation_count` are all trust-relevant and must **not** be directly writable by the provider that owns the row — RLS alone doesn't stop this, since `providers_owner_update` (§20/§21) only checks row ownership, not which columns changed. See §20a for the fix.

## 5. Categories

Example:

```text
Education
 ├── Math
 ├── Science
 └── Languages

Home Services
 ├── Plumbing
 ├── Electrical
 └── Cleaning

Technology
 ├── Web Development
 ├── App Development
 └── Computer Repair
```

### `categories`

```text
id
name
slug
description
parent_id
is_active
created_at
```

`parent_id` allows hierarchical categories.

## 6. Services

Examples:

```text
Math Tutor
Home Cleaning
AC Repair
Graphic Design
Web Development
Photography
Laptop Repair
```

### `services`

```text
id
category_id
name
slug
description
base_price
is_active
created_at
```

## 7. Provider Services

Many providers can provide many services.

### `provider_services`

```text
provider_id
service_id
price_from
price_to
experience_years
is_primary
created_at
```

Relationship:

```text
providers 1 ───── N provider_services N ───── 1 services
```

## 8. Locations

Use **PostGIS geography**.

### `locations`

```text
id
user_id
provider_id
label
locality
city
state
pincode
latitude
longitude
point
is_primary
created_at
```

A provider can have multiple service locations. For MVP, one primary location is sufficient.

### Why PostGIS?

Use:

```sql
ST_DWithin(...)
ST_Distance(...)
```

for efficient local distance queries.

## 9. Provider Availability

Use weekly recurring availability.

### `provider_availability`

Example:

```text
Monday    09:00 → 13:00
Monday    17:00 → 20:00
Saturday  10:00 → 18:00
```

Columns:

```text
id
provider_id
day_of_week
start_time
end_time
is_available
```

## 10. Requests

This is the **NEED** stage.

Example:

> "I need a 12th standard maths tutor near me on weekends under ₹500."

Store:

### Human input

```text
raw_description
```

### AI interpretation

```text
ai_parsed_requirement
```

### Matching-ready fields

```text
category_id
service_id
budget_max
radius_km
location
```

## 11. Request Status

Recommended statuses:

```text
open
matching
matched
provider_responded
connected
in_progress
completed
cancelled
expired
```

## 12. Request Matches

This represents the output of the matching engine.

```text
request
    ↓
request_matches
    ↓
provider
```

Store:

```text
distance_km
service_score
availability_score
price_score
rating_score
trust_score
total_match_score
status
```

## 13. Connections

A match is **not automatically a connection**.

```text
Request
 ↓
Match
 ↓
Provider responds
 ↓
User accepts
 ↓
Connection
```

`connections` represents the actual relationship between requester and provider.

## 14. Reviews

Reviews should be attached to a completed connection.

```text
rating
review_text
reviewer_id
reviewee_provider_id
connection_id
```

Unique constraint:

```text
(connection_id, reviewer_id)
```

This prevents duplicate reviews.

## 15. Trust System

Do not simply store a manually assigned `trust_score`.

### CANONICAL TRUST SCORE FORMULA

This is the single source of truth. TRD §9.2–9.3 and Implementation Plan Phase 6 must match this exactly — this replaces the three earlier, mutually inconsistent versions of this section.

Store the inputs:

```text
phone_score           -- 0 or 100, from phone_verified_at
identity_score        -- 0 or 100, from identity_submitted_at
profile_score         -- 0-100, fields-filled / 7
rating_score          -- 0-100, average_rating/5, dampened below 3 reviews
completion_score      -- 0-100, LEAST(100, completed_jobs * 5)
recommendation_score  -- 0-100, LEAST(100, recommendation_count * 10)
response_score        -- 0-100, response_rate directly
trust_score
calculation_version
calculated_at
```

```text
Trust Score =
    Phone Score           × 0.15
  + Identity Score        × 0.10
  + Profile Score         × 0.15
  + Rating Score          × 0.20
  + Completion Score      × 0.15
  + Recommendation Score  × 0.10
  + Response Score        × 0.15
```

Total: 100%. See §21 for the exact `recalculate_provider_trust()` function implementing this.

`provider_trust_scores` is a **derived/cache table**. The source of truth remains:

```text
providers
reviews
connections
provider_recommendations
```

The score is recalculated using a database function, triggered on the events listed in TRD §9.5.

## 16. Recommendations

Recommendations represent system/AI suggestions.

Store:

```text
user_id
provider_id
request_id
reason
score
algorithm_version
```

This supports explainable recommendations such as:

> Recommended because this provider is nearby, has a high rating, and matches your availability.

**This table is not the Community Recommendations feature.** It is left as-is, unused by MVP, reserved for a possible future AI-suggestions feature. Do not wire the PRD's "Recommended by 12 nearby" feature to this table — see §16a.

## 16a. Community Recommendations (NEW — distinct feature)

This is the PRD §21 feature: a user vouching for a provider they had a genuine, completed interaction with. It requires its own table because `recommendations` (§16) models something else entirely (system-generated suggestions) and, as originally specified, had no INSERT policy at all — nobody could ever write to it.

### `provider_recommendations`

```text
id
recommender_id      -- profiles(id), who is vouching
provider_id         -- providers(id), who is being vouched for
connection_id        -- connections(id), REQUIRED (not optional — see rationale below)
is_active            -- boolean, for revoke/deactivate
created_at
```

**Why `connection_id` is required, not optional:** the PRD's original language allowed an "optional connection reference." An optional check cannot be enforced — a recommender could always omit it and vouch with zero evidence of interaction, which defeats the entire safeguard. Requiring a completed connection is the only version of this rule that is actually abuse-resistant, and it's cheap to implement since `connections` already exists.

### Constraints

```text
UNIQUE (recommender_id, provider_id)   -- one active recommendation per relationship
```

### Enforcement (BEFORE INSERT trigger, not just a constraint)

A recommendation may only be inserted if, at the time of insert:

1. `connection_id` refers to a connection with `status = 'completed'`.
2. That connection's `requester_id = recommender_id` OR its `provider_id`'s `providers.user_id = recommender_id` — i.e., the recommender was genuinely a participant.
3. `recommender_id` is not the provider's own `user_id` (self-recommendation blocked).

A plain CHECK constraint cannot express cross-table conditions like these, hence the trigger.

### Public count

`providers.recommendation_count` (added §4) is maintained by a trigger on INSERT/UPDATE of `is_active`, counting only `is_active = true` rows. This is what both the Trust Score (§15) and the "Recommended by N nearby" UI read from — nobody queries `provider_recommendations` directly for a count.

## 17. Saved Providers

Simple many-to-many relationship:

```text
user → provider
```

Unique constraint:

```text
(user_id, provider_id)
```

## 18. Notifications

For MVP:

```text
New match
Provider response
Connection accepted
Review reminder
Request completed
```

## 19. Index Strategy

Important indexes:

```text
providers(user_id)
providers(is_active)

provider_services(service_id, provider_id)

locations(point) USING GIST

provider_availability(provider_id, day_of_week)

requests(requester_id, status)
requests(service_id, status)

request_matches(request_id, total_match_score)
request_matches(provider_id, status)

connections(requester_id)
connections(provider_id)
connections(status)

reviews(reviewee_provider_id)

recommendations(user_id, score)

saved_providers(user_id)
```

### Location index

```sql
CREATE INDEX idx_locations_point
ON locations
USING GIST(point);
```

This is the key index for geographic filtering.

## 20. RLS Strategy

### Profiles

Users can:

- read their own profile
- update their own profile

Public provider information should come from `providers`, not private `profiles`.

### Providers

Public information:

```text
display_name
bio
experience
rating
verification status
service information
```

Private information such as phone numbers should not be unnecessarily exposed.

### Requests

Only:

- request owner
- providers matched to the request

should see appropriate request information.

### Reviews

Users can create reviews only when they participated in the connection.

### Recommendations

Users see only their own recommendations.

### Connections

Only the requester and provider can access the connection.

## 20a. Trust/Score Integrity — Column-Level Write Protection

This section exists because RLS alone was found to be insufficient. RLS restricts which **rows** a user can touch; it does not restrict which **columns** they can change within a row they legitimately own. As originally specified, `providers_owner_update`, `matches_provider_update`, and `connections_participant_update` each let a legitimate row-owner write to *any* column on that row — including the columns that feed the Trust Score and Match Score. A provider could directly set `providers.completed_jobs = 999`, or either connection participant could flip `connections.status` to `'completed'` with no service ever having occurred.

This is fixed two ways, applied together:

**1. Column-level `GRANT`/`REVOKE` (Postgres, not RLS).** The `authenticated` role's write access is narrowed to only the columns a client is legitimately allowed to set directly. All trust-relevant and score-relevant columns are excluded from the grant, so no RLS policy, however permissive on rows, can be used to write to them — see §21 for the exact `REVOKE`/`GRANT` statements.

**2. A completion confirmation gate.** `connections.status` cannot move to `'completed'` through a direct client UPDATE at all, even to a column-level-permitted subset — a `BEFORE UPDATE` trigger rejects any such attempt. The only path to `'completed'` is the `confirm_connection_completion()` function (`SECURITY DEFINER`), which records the *caller's own* confirmation (`requester_confirmed_at` or `provider_confirmed_at` depending on who's calling) and only flips the status once **both** are present. Neither participant can complete a connection unilaterally.

This directly implements the completion-verification rule required by the Canonical Trust Score Formula (§15) — "Completed Jobs" and its downstream Trust Score contribution are meaningless as a trust signal if either side can self-assert completion.

## 21. Complete SQL Schema

```sql
-- ============================================================
-- LOCAL CONNECT
-- NEED → MATCH → CONNECT
-- PostgreSQL / Supabase MVP Schema
-- ============================================================

CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE EXTENSION IF NOT EXISTS postgis;

-- ============================================================
-- ENUM TYPES
-- ============================================================

-- verification_status enum retired (Decision 6): a single linear field cannot
-- represent four independent badges (Phone Verified / Identity Submitted /
-- Profile Verified / Community Recommended). Replaced by providers.phone_verified_at
-- and providers.identity_submitted_at below. Reintroduce a review-state enum here
-- if/when real manual-review KYC is added post-hackathon.

CREATE TYPE request_status AS ENUM (
    'open',
    'matching',
    'matched',
    'provider_responded',
    'connected',
    'in_progress',
    'completed',
    'cancelled',
    'expired'
);

CREATE TYPE match_status AS ENUM (
    'pending',
    'viewed',
    'interested',
    'declined',
    'accepted',
    'expired'
);

CREATE TYPE connection_status AS ENUM (
    'pending',
    'active',
    'in_progress',
    'completed',
    'cancelled'
);

CREATE TYPE notification_type AS ENUM (
    'new_match',
    'provider_response',
    'connection_request',
    'connection_accepted',
    'review_reminder',
    'request_completed',
    'system'
);

-- ============================================================
-- PROFILES
-- ============================================================

CREATE TABLE profiles (
    id UUID PRIMARY KEY
        REFERENCES auth.users(id)
        ON DELETE CASCADE,

    full_name TEXT NOT NULL,
    avatar_url TEXT,
    phone TEXT,
    bio TEXT,

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- CATEGORIES
-- ============================================================

CREATE TABLE categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    description TEXT,

    parent_id UUID
        REFERENCES categories(id)
        ON DELETE SET NULL,

    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),

    CONSTRAINT categories_name_check
        CHECK (length(trim(name)) >= 2)
);

CREATE INDEX idx_categories_parent
ON categories(parent_id);

CREATE INDEX idx_categories_active
ON categories(is_active);

-- ============================================================
-- SERVICES
-- ============================================================

CREATE TABLE services (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    category_id UUID NOT NULL
        REFERENCES categories(id)
        ON DELETE RESTRICT,

    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    description TEXT,

    base_price NUMERIC(12,2),

    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),

    CONSTRAINT services_price_check
        CHECK (base_price IS NULL OR base_price >= 0),

    CONSTRAINT services_name_check
        CHECK (length(trim(name)) >= 2)
);

CREATE INDEX idx_services_category
ON services(category_id);

CREATE INDEX idx_services_active
ON services(is_active);

-- ============================================================
-- PROVIDERS
-- ============================================================

CREATE TABLE providers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    user_id UUID NOT NULL UNIQUE
        REFERENCES profiles(id)
        ON DELETE CASCADE,

    display_name TEXT NOT NULL,
    bio TEXT,

    experience_years INTEGER NOT NULL DEFAULT 0,

    -- Trust/verification signals (Decisions 1 & 6). All of these are
    -- system-computed or system-verified; see §20a for why they must not be
    -- directly writable by the owning provider despite RLS row ownership.
    phone_verified_at TIMESTAMPTZ,
    identity_submitted_at TIMESTAMPTZ,
    recommendation_count INTEGER NOT NULL DEFAULT 0,

    response_rate NUMERIC(5,2) NOT NULL DEFAULT 0,
    completed_jobs INTEGER NOT NULL DEFAULT 0,

    average_rating NUMERIC(3,2) NOT NULL DEFAULT 0,
    total_reviews INTEGER NOT NULL DEFAULT 0,

    service_radius_km NUMERIC(6,2) NOT NULL DEFAULT 5,

    is_active BOOLEAN NOT NULL DEFAULT true,

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),

    CONSTRAINT providers_experience_check
        CHECK (experience_years >= 0),

    CONSTRAINT providers_response_rate_check
        CHECK (response_rate >= 0 AND response_rate <= 100),

    CONSTRAINT providers_rating_check
        CHECK (average_rating >= 0 AND average_rating <= 5),

    CONSTRAINT providers_reviews_check
        CHECK (total_reviews >= 0),

    CONSTRAINT providers_radius_check
        CHECK (service_radius_km > 0),

    CONSTRAINT providers_recommendation_count_check
        CHECK (recommendation_count >= 0)
);

CREATE INDEX idx_providers_user
ON providers(user_id);

CREATE INDEX idx_providers_active
ON providers(is_active);

CREATE INDEX idx_providers_rating
ON providers(average_rating DESC);

-- ============================================================
-- PROVIDER SERVICES
-- ============================================================

CREATE TABLE provider_services (
    provider_id UUID NOT NULL
        REFERENCES providers(id)
        ON DELETE CASCADE,

    service_id UUID NOT NULL
        REFERENCES services(id)
        ON DELETE CASCADE,

    price_from NUMERIC(12,2),
    price_to NUMERIC(12,2),

    experience_years INTEGER NOT NULL DEFAULT 0,
    is_primary BOOLEAN NOT NULL DEFAULT false,

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),

    PRIMARY KEY (provider_id, service_id),

    CONSTRAINT provider_services_price_check
        CHECK (price_from IS NULL OR price_from >= 0),

    CONSTRAINT provider_services_price_range_check
        CHECK (
            price_to IS NULL
            OR price_from IS NULL
            OR price_to >= price_from
        ),

    CONSTRAINT provider_services_experience_check
        CHECK (experience_years >= 0)
);

CREATE INDEX idx_provider_services_service
ON provider_services(service_id);

CREATE INDEX idx_provider_services_provider
ON provider_services(provider_id);

-- ============================================================
-- LOCATIONS
-- ============================================================

CREATE TABLE locations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    user_id UUID
        REFERENCES profiles(id)
        ON DELETE CASCADE,

    provider_id UUID
        REFERENCES providers(id)
        ON DELETE CASCADE,

    label TEXT NOT NULL DEFAULT 'Primary',

    locality TEXT,
    city TEXT NOT NULL,
    state TEXT,
    pincode TEXT,

    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,

    point GEOGRAPHY(Point, 4326) NOT NULL,

    is_primary BOOLEAN NOT NULL DEFAULT false,

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),

    CONSTRAINT locations_owner_check
        CHECK (
            (user_id IS NOT NULL AND provider_id IS NULL)
            OR
            (user_id IS NULL AND provider_id IS NOT NULL)
        ),

    CONSTRAINT locations_latitude_check
        CHECK (latitude BETWEEN -90 AND 90),

    CONSTRAINT locations_longitude_check
        CHECK (longitude BETWEEN -180 AND 180)
);

CREATE INDEX idx_locations_point
ON locations
USING GIST(point);

CREATE INDEX idx_locations_provider
ON locations(provider_id);

CREATE INDEX idx_locations_user
ON locations(user_id);

CREATE INDEX idx_locations_city
ON locations(city);

-- ============================================================
-- PROVIDER AVAILABILITY
-- ============================================================

CREATE TABLE provider_availability (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    provider_id UUID NOT NULL
        REFERENCES providers(id)
        ON DELETE CASCADE,

    day_of_week SMALLINT NOT NULL,

    start_time TIME NOT NULL,
    end_time TIME NOT NULL,

    is_available BOOLEAN NOT NULL DEFAULT true,

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),

    CONSTRAINT availability_day_check
        CHECK (day_of_week BETWEEN 0 AND 6),

    CONSTRAINT availability_time_check
        CHECK (end_time > start_time),

    UNIQUE (
        provider_id,
        day_of_week,
        start_time,
        end_time
    )
);

CREATE INDEX idx_availability_provider_day
ON provider_availability(provider_id, day_of_week);

-- ============================================================
-- REQUESTS
-- ============================================================

CREATE TABLE requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    requester_id UUID NOT NULL
        REFERENCES profiles(id)
        ON DELETE CASCADE,

    raw_description TEXT NOT NULL,

    ai_parsed_requirement JSONB,
    ai_confidence NUMERIC(5,4),

    category_id UUID
        REFERENCES categories(id)
        ON DELETE SET NULL,

    service_id UUID
        REFERENCES services(id)
        ON DELETE SET NULL,

    budget_min NUMERIC(12,2),
    budget_max NUMERIC(12,2),

    radius_km NUMERIC(6,2) NOT NULL DEFAULT 5,

    latitude DOUBLE PRECISION,
    longitude DOUBLE PRECISION,

    location GEOGRAPHY(Point, 4326),

    status request_status NOT NULL DEFAULT 'open',

    expires_at TIMESTAMPTZ,

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),

    CONSTRAINT requests_budget_check
        CHECK (budget_min IS NULL OR budget_min >= 0),

    CONSTRAINT requests_budget_range_check
        CHECK (
            budget_max IS NULL
            OR budget_min IS NULL
            OR budget_max >= budget_min
        ),

    CONSTRAINT requests_radius_check
        CHECK (radius_km > 0),

    CONSTRAINT requests_ai_confidence_check
        CHECK (
            ai_confidence IS NULL
            OR ai_confidence BETWEEN 0 AND 1
        ),

    CONSTRAINT requests_description_check
        CHECK (length(trim(raw_description)) >= 3),

    CONSTRAINT requests_coordinates_check
        CHECK (
            (latitude IS NULL AND longitude IS NULL)
            OR
            (
                latitude BETWEEN -90 AND 90
                AND longitude BETWEEN -180 AND 180
            )
        )
);

CREATE INDEX idx_requests_requester
ON requests(requester_id);

CREATE INDEX idx_requests_status
ON requests(status);

CREATE INDEX idx_requests_service_status
ON requests(service_id, status);

CREATE INDEX idx_requests_category_status
ON requests(category_id, status);

CREATE INDEX idx_requests_location
ON requests
USING GIST(location);

CREATE INDEX idx_requests_created
ON requests(created_at DESC);

-- ============================================================
-- REQUEST MATCHES
-- ============================================================

CREATE TABLE request_matches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    request_id UUID NOT NULL
        REFERENCES requests(id)
        ON DELETE CASCADE,

    provider_id UUID NOT NULL
        REFERENCES providers(id)
        ON DELETE CASCADE,

    distance_km NUMERIC(8,3),

    service_score NUMERIC(5,2) NOT NULL DEFAULT 0,
    availability_score NUMERIC(5,2) NOT NULL DEFAULT 0,
    price_score NUMERIC(5,2) NOT NULL DEFAULT 0,
    rating_score NUMERIC(5,2) NOT NULL DEFAULT 0,
    trust_score NUMERIC(5,2) NOT NULL DEFAULT 0,

    total_match_score NUMERIC(6,2) NOT NULL DEFAULT 0,

    status match_status NOT NULL DEFAULT 'pending',

    provider_response TEXT,
    provider_responded_at TIMESTAMPTZ,

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),

    UNIQUE(request_id, provider_id),

    CONSTRAINT match_distance_check
        CHECK (distance_km IS NULL OR distance_km >= 0),

    CONSTRAINT match_service_score_check
        CHECK (service_score BETWEEN 0 AND 100),

    CONSTRAINT match_availability_score_check
        CHECK (availability_score BETWEEN 0 AND 100),

    CONSTRAINT match_price_score_check
        CHECK (price_score BETWEEN 0 AND 100),

    CONSTRAINT match_rating_score_check
        CHECK (rating_score BETWEEN 0 AND 100),

    CONSTRAINT match_trust_score_check
        CHECK (trust_score BETWEEN 0 AND 100),

    CONSTRAINT match_total_score_check
        CHECK (total_match_score BETWEEN 0 AND 100)
);

CREATE INDEX idx_matches_request
ON request_matches(request_id);

CREATE INDEX idx_matches_provider
ON request_matches(provider_id);

CREATE INDEX idx_matches_request_score
ON request_matches(request_id, total_match_score DESC);

CREATE INDEX idx_matches_provider_status
ON request_matches(provider_id, status);

-- ============================================================
-- CONNECTIONS
-- ============================================================

CREATE TABLE connections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    request_id UUID NOT NULL
        REFERENCES requests(id)
        ON DELETE CASCADE,

    provider_id UUID NOT NULL
        REFERENCES providers(id)
        ON DELETE CASCADE,

    requester_id UUID NOT NULL
        REFERENCES profiles(id)
        ON DELETE CASCADE,

    match_id UUID
        REFERENCES request_matches(id)
        ON DELETE SET NULL,

    status connection_status NOT NULL DEFAULT 'pending',

    connected_at TIMESTAMPTZ,
    started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    cancelled_at TIMESTAMPTZ,

    -- Completion gate (§20a): status can only reach 'completed' once both of
    -- these are set, and only confirm_connection_completion() may set them.
    requester_confirmed_at TIMESTAMPTZ,
    provider_confirmed_at TIMESTAMPTZ,

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),

    UNIQUE(request_id, provider_id)
);

CREATE INDEX idx_connections_requester
ON connections(requester_id);

CREATE INDEX idx_connections_provider
ON connections(provider_id);

CREATE INDEX idx_connections_status
ON connections(status);

CREATE INDEX idx_connections_request
ON connections(request_id);

-- ============================================================
-- REVIEWS
-- ============================================================

CREATE TABLE reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    connection_id UUID NOT NULL
        REFERENCES connections(id)
        ON DELETE CASCADE,

    reviewer_id UUID NOT NULL
        REFERENCES profiles(id)
        ON DELETE CASCADE,

    reviewee_provider_id UUID NOT NULL
        REFERENCES providers(id)
        ON DELETE CASCADE,

    rating SMALLINT NOT NULL,
    review_text TEXT,

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),

    UNIQUE(connection_id, reviewer_id),

    CONSTRAINT reviews_rating_check
        CHECK (rating BETWEEN 1 AND 5)
);

CREATE INDEX idx_reviews_provider
ON reviews(reviewee_provider_id);

CREATE INDEX idx_reviews_connection
ON reviews(connection_id);

CREATE INDEX idx_reviews_rating
ON reviews(reviewee_provider_id, rating);

-- ============================================================
-- PROVIDER TRUST SCORES
-- ============================================================

CREATE TABLE provider_trust_scores (
    provider_id UUID PRIMARY KEY
        REFERENCES providers(id)
        ON DELETE CASCADE,

    phone_score NUMERIC(5,2) NOT NULL DEFAULT 0,
    identity_score NUMERIC(5,2) NOT NULL DEFAULT 0,
    profile_score NUMERIC(5,2) NOT NULL DEFAULT 0,
    rating_score NUMERIC(5,2) NOT NULL DEFAULT 0,
    completion_score NUMERIC(5,2) NOT NULL DEFAULT 0,
    recommendation_score NUMERIC(5,2) NOT NULL DEFAULT 0,
    response_score NUMERIC(5,2) NOT NULL DEFAULT 0,

    trust_score NUMERIC(5,2) NOT NULL DEFAULT 0,

    calculation_version TEXT NOT NULL DEFAULT 'v2',

    calculated_at TIMESTAMPTZ NOT NULL DEFAULT now(),

    CONSTRAINT trust_phone_check
        CHECK (phone_score BETWEEN 0 AND 100),
    CONSTRAINT trust_identity_check
        CHECK (identity_score BETWEEN 0 AND 100),
    CONSTRAINT trust_profile_check
        CHECK (profile_score BETWEEN 0 AND 100),
    CONSTRAINT trust_rating_check
        CHECK (rating_score BETWEEN 0 AND 100),
    CONSTRAINT trust_completion_check
        CHECK (completion_score BETWEEN 0 AND 100),
    CONSTRAINT trust_recommendation_check
        CHECK (recommendation_score BETWEEN 0 AND 100),
    CONSTRAINT trust_response_check
        CHECK (response_score BETWEEN 0 AND 100),
    CONSTRAINT trust_score_check
        CHECK (trust_score BETWEEN 0 AND 100)
);

CREATE INDEX idx_trust_score
ON provider_trust_scores(trust_score DESC);

-- Table comment kept in sync with TRD §9.2 Canonical Trust Score Formula:
-- 15% phone + 10% identity + 15% profile + 20% rating (dampened <3 reviews)
-- + 15% completion + 10% recommendations + 15% response rate = 100%.

-- ============================================================
-- RECOMMENDATIONS
-- ============================================================

CREATE TABLE recommendations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    user_id UUID NOT NULL
        REFERENCES profiles(id)
        ON DELETE CASCADE,

    provider_id UUID NOT NULL
        REFERENCES providers(id)
        ON DELETE CASCADE,

    request_id UUID
        REFERENCES requests(id)
        ON DELETE CASCADE,

    score NUMERIC(6,2) NOT NULL DEFAULT 0,

    reason JSONB,

    algorithm_version TEXT NOT NULL DEFAULT 'v1',

    is_dismissed BOOLEAN NOT NULL DEFAULT false,

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),

    CONSTRAINT recommendation_score_check
        CHECK (score BETWEEN 0 AND 100)
);

CREATE INDEX idx_recommendations_user
ON recommendations(user_id, score DESC);

CREATE INDEX idx_recommendations_request
ON recommendations(request_id);

CREATE INDEX idx_recommendations_provider
ON recommendations(provider_id);

-- ============================================================
-- PROVIDER RECOMMENDATIONS (Community Recommendations — Decision 3)
-- Distinct from `recommendations` above (system/AI suggestions, unused by MVP).
-- ============================================================

CREATE TABLE provider_recommendations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    recommender_id UUID NOT NULL
        REFERENCES profiles(id)
        ON DELETE CASCADE,

    provider_id UUID NOT NULL
        REFERENCES providers(id)
        ON DELETE CASCADE,

    connection_id UUID NOT NULL
        REFERENCES connections(id)
        ON DELETE CASCADE,

    is_active BOOLEAN NOT NULL DEFAULT true,

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),

    UNIQUE (recommender_id, provider_id)
);

CREATE INDEX idx_provider_recommendations_provider
ON provider_recommendations(provider_id)
WHERE is_active = true;

CREATE INDEX idx_provider_recommendations_recommender
ON provider_recommendations(recommender_id);

-- ============================================================
-- SAVED PROVIDERS
-- ============================================================

CREATE TABLE saved_providers (
    user_id UUID NOT NULL
        REFERENCES profiles(id)
        ON DELETE CASCADE,

    provider_id UUID NOT NULL
        REFERENCES providers(id)
        ON DELETE CASCADE,

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),

    PRIMARY KEY(user_id, provider_id)
);

CREATE INDEX idx_saved_providers_provider
ON saved_providers(provider_id);

-- ============================================================
-- NOTIFICATIONS
-- ============================================================

CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    user_id UUID NOT NULL
        REFERENCES profiles(id)
        ON DELETE CASCADE,

    type notification_type NOT NULL,

    title TEXT NOT NULL,
    message TEXT NOT NULL,

    reference_id UUID,

    is_read BOOLEAN NOT NULL DEFAULT false,

    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_notifications_user
ON notifications(user_id, created_at DESC);

CREATE INDEX idx_notifications_unread
ON notifications(user_id, is_read);

-- ============================================================
-- UPDATED_AT FUNCTION
-- ============================================================

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$;

CREATE TRIGGER profiles_updated_at
BEFORE UPDATE ON profiles
FOR EACH ROW
EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER providers_updated_at
BEFORE UPDATE ON providers
FOR EACH ROW
EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER requests_updated_at
BEFORE UPDATE ON requests
FOR EACH ROW
EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER matches_updated_at
BEFORE UPDATE ON request_matches
FOR EACH ROW
EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER connections_updated_at
BEFORE UPDATE ON connections
FOR EACH ROW
EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER reviews_updated_at
BEFORE UPDATE ON reviews
FOR EACH ROW
EXECUTE FUNCTION update_updated_at();

-- ============================================================
-- REQUEST LOCATION FUNCTION
-- ============================================================

CREATE OR REPLACE FUNCTION sync_request_location()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    IF NEW.latitude IS NOT NULL
       AND NEW.longitude IS NOT NULL THEN

        NEW.location :=
            ST_SetSRID(
                ST_MakePoint(
                    NEW.longitude,
                    NEW.latitude
                ),
                4326
            )::geography;

    ELSE
        NEW.location := NULL;
    END IF;

    RETURN NEW;
END;
$$;

CREATE TRIGGER requests_location_sync
BEFORE INSERT OR UPDATE OF latitude, longitude
ON requests
FOR EACH ROW
EXECUTE FUNCTION sync_request_location();

-- ============================================================
-- LOCATION POINT FUNCTION
-- ============================================================

CREATE OR REPLACE FUNCTION sync_location_point()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    NEW.point :=
        ST_SetSRID(
            ST_MakePoint(
                NEW.longitude,
                NEW.latitude
            ),
            4326
        )::geography;

    RETURN NEW;
END;
$$;

CREATE TRIGGER locations_point_sync
BEFORE INSERT OR UPDATE OF latitude, longitude
ON locations
FOR EACH ROW
EXECUTE FUNCTION sync_location_point();

-- ============================================================
-- TRUST SCORE CALCULATION
-- ============================================================

-- CANONICAL TRUST SCORE — implements TRD §9.2-9.3 / Backend Schema §15 exactly.
-- Any change to weights or normalization must be made here AND in both of
-- those sections, in the same commit.
CREATE OR REPLACE FUNCTION recalculate_provider_trust(
    target_provider UUID
)
RETURNS NUMERIC
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    phone NUMERIC := 0;
    identity NUMERIC := 0;
    profile NUMERIC := 0;
    rating NUMERIC := 0;
    completion NUMERIC := 0;
    recommendation NUMERIC := 0;
    response NUMERIC := 0;
    final_score NUMERIC := 0;

    p_phone_verified_at TIMESTAMPTZ;
    p_identity_submitted_at TIMESTAMPTZ;
    p_rating NUMERIC := 0;
    p_total_reviews INTEGER := 0;
    p_completed_jobs INTEGER := 0;
    p_recommendation_count INTEGER := 0;
    p_response_rate NUMERIC := 0;

    profile_fields_filled INTEGER := 0;
BEGIN

    SELECT
        phone_verified_at,
        identity_submitted_at,
        average_rating,
        total_reviews,
        completed_jobs,
        recommendation_count,
        response_rate
    INTO
        p_phone_verified_at,
        p_identity_submitted_at,
        p_rating,
        p_total_reviews,
        p_completed_jobs,
        p_recommendation_count,
        p_response_rate
    FROM providers
    WHERE id = target_provider;

    -- Phone Verified (15%): binary
    phone := CASE WHEN p_phone_verified_at IS NOT NULL THEN 100 ELSE 0 END;

    -- Identity Submitted (10%): binary, submission only — never "verified"
    identity := CASE WHEN p_identity_submitted_at IS NOT NULL THEN 100 ELSE 0 END;

    -- Profile Completeness (15%): count of 7 fields filled
    SELECT
        (CASE WHEN p.display_name IS NOT NULL AND length(trim(p.display_name)) > 0 THEN 1 ELSE 0 END) +
        (CASE WHEN p.bio IS NOT NULL AND length(trim(p.bio)) > 0 THEN 1 ELSE 0 END) +
        (CASE WHEN EXISTS (SELECT 1 FROM provider_services ps WHERE ps.provider_id = p.id) THEN 1 ELSE 0 END) +
        (CASE WHEN EXISTS (SELECT 1 FROM provider_availability pa WHERE pa.provider_id = p.id) THEN 1 ELSE 0 END) +
        (CASE WHEN p.service_radius_km IS NOT NULL THEN 1 ELSE 0 END) +
        (CASE WHEN EXISTS (SELECT 1 FROM locations l WHERE l.provider_id = p.id AND l.is_primary = true) THEN 1 ELSE 0 END) +
        (CASE WHEN p.avatar_url IS NOT NULL OR EXISTS (
            SELECT 1 FROM profiles pf WHERE pf.id = p.user_id AND pf.avatar_url IS NOT NULL
        ) THEN 1 ELSE 0 END)
    INTO profile_fields_filled
    FROM providers p
    WHERE p.id = target_provider;

    profile := LEAST(100, (profile_fields_filled / 7.0) * 100);

    -- Rating (20%): dampened below 3 reviews (same rule as Match Score §8.10)
    IF p_total_reviews = 0 THEN
        rating := 0;
    ELSIF p_total_reviews < 3 THEN
        rating := 50;
    ELSE
        rating := LEAST(100, (COALESCE(p_rating, 0) / 5.0) * 100);
    END IF;

    -- Completed Jobs (15%): 20 jobs reaches the cap
    completion := LEAST(100, p_completed_jobs * 5);

    -- Community Recommendations (10%): 10 recommendations reaches the cap
    recommendation := LEAST(100, p_recommendation_count * 10);

    -- Response Rate (15%): stored value, computed by refresh_response_rate()
    response := LEAST(100, COALESCE(p_response_rate, 0));

    final_score :=
          phone * 0.15
        + identity * 0.10
        + profile * 0.15
        + rating * 0.20
        + completion * 0.15
        + recommendation * 0.10
        + response * 0.15;

    INSERT INTO provider_trust_scores (
        provider_id,
        phone_score,
        identity_score,
        profile_score,
        rating_score,
        completion_score,
        recommendation_score,
        response_score,
        trust_score,
        calculation_version,
        calculated_at
    )
    VALUES (
        target_provider,
        phone,
        identity,
        profile,
        rating,
        completion,
        recommendation,
        response,
        ROUND(final_score, 2),
        'v2',
        now()
    )
    ON CONFLICT (provider_id)
    DO UPDATE SET
        phone_score = EXCLUDED.phone_score,
        identity_score = EXCLUDED.identity_score,
        profile_score = EXCLUDED.profile_score,
        rating_score = EXCLUDED.rating_score,
        completion_score = EXCLUDED.completion_score,
        recommendation_score = EXCLUDED.recommendation_score,
        response_score = EXCLUDED.response_score,
        trust_score = EXCLUDED.trust_score,
        calculation_version = EXCLUDED.calculation_version,
        calculated_at = now();

    RETURN ROUND(final_score, 2);
END;
$$;

-- ============================================================
-- UPDATE PROVIDER RATING AFTER REVIEW
-- ============================================================

CREATE OR REPLACE FUNCTION refresh_provider_rating()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN

    UPDATE providers
    SET
        average_rating = (
            SELECT COALESCE(AVG(rating), 0)
            FROM reviews
            WHERE reviewee_provider_id = NEW.reviewee_provider_id
        ),

        total_reviews = (
            SELECT COUNT(*)
            FROM reviews
            WHERE reviewee_provider_id = NEW.reviewee_provider_id
        )

    WHERE id = NEW.reviewee_provider_id;

    PERFORM recalculate_provider_trust(
        NEW.reviewee_provider_id
    );

    RETURN NEW;
END;
$$;

CREATE TRIGGER reviews_refresh_provider
AFTER INSERT OR UPDATE ON reviews
FOR EACH ROW
EXECUTE FUNCTION refresh_provider_rating();

-- ============================================================
-- COMPLETED CONNECTION → PROVIDER JOB COUNT
-- ============================================================

CREATE OR REPLACE FUNCTION refresh_completed_jobs()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN

    UPDATE providers p
    SET completed_jobs = (
        SELECT COUNT(*)
        FROM connections c
        WHERE c.provider_id = NEW.provider_id
          AND c.status = 'completed'
    )
    WHERE p.id = NEW.provider_id;

    PERFORM recalculate_provider_trust(
        NEW.provider_id
    );

    RETURN NEW;
END;
$$;

CREATE TRIGGER connections_refresh_jobs
AFTER INSERT OR UPDATE OF status ON connections
FOR EACH ROW
EXECUTE FUNCTION refresh_completed_jobs();

-- ============================================================
-- COMPLETION GATE (§20a / TRD §9.6)
-- No single participant can unilaterally mark a connection completed.
-- ============================================================

-- Guard: reject any UPDATE that tries to set status = 'completed' without
-- both confirmation timestamps already present. Applies to every UPDATE,
-- including ones issued by confirm_connection_completion() below — that
-- function sets both confirmation columns first, in an earlier statement,
-- so by the time it sets status the guard condition is already satisfied.
CREATE OR REPLACE FUNCTION guard_connection_status_transition()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    IF NEW.status = 'completed' AND OLD.status IS DISTINCT FROM 'completed' THEN
        IF NEW.requester_confirmed_at IS NULL OR NEW.provider_confirmed_at IS NULL THEN
            RAISE EXCEPTION
                'connections.status cannot be set to completed directly; call confirm_connection_completion()';
        END IF;
    END IF;
    RETURN NEW;
END;
$$;

CREATE TRIGGER connections_guard_completion
BEFORE UPDATE ON connections
FOR EACH ROW
EXECUTE FUNCTION guard_connection_status_transition();

-- The only legitimate path to 'completed'. SECURITY DEFINER: runs with the
-- function owner's privileges, so it can write requester_confirmed_at /
-- provider_confirmed_at / status even though the calling client's own
-- column grants (see the REVOKE/GRANT block near the end of this file)
-- do not permit it to write those columns directly.
CREATE OR REPLACE FUNCTION confirm_connection_completion(
    target_connection UUID
)
RETURNS connection_status
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    caller_is_requester BOOLEAN;
    caller_is_provider BOOLEAN;
    result_status connection_status;
BEGIN
    SELECT
        c.requester_id = auth.uid(),
        c.provider_id IN (SELECT id FROM providers WHERE user_id = auth.uid())
    INTO caller_is_requester, caller_is_provider
    FROM connections c
    WHERE c.id = target_connection;

    IF NOT (COALESCE(caller_is_requester, false) OR COALESCE(caller_is_provider, false)) THEN
        RAISE EXCEPTION 'Not a participant in this connection';
    END IF;

    IF caller_is_requester THEN
        UPDATE connections
        SET requester_confirmed_at = now()
        WHERE id = target_connection
          AND requester_confirmed_at IS NULL;
    END IF;

    IF caller_is_provider THEN
        UPDATE connections
        SET provider_confirmed_at = now()
        WHERE id = target_connection
          AND provider_confirmed_at IS NULL;
    END IF;

    UPDATE connections
    SET status = 'completed', completed_at = now()
    WHERE id = target_connection
      AND requester_confirmed_at IS NOT NULL
      AND provider_confirmed_at IS NOT NULL
      AND status <> 'completed';

    SELECT status INTO result_status FROM connections WHERE id = target_connection;
    RETURN result_status;
END;
$$;

-- ============================================================
-- RESPONSE RATE (TRD §9.7) — the one Trust Score input that
-- previously had no computation mechanism anywhere.
-- ============================================================

CREATE OR REPLACE FUNCTION refresh_response_rate()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    total_assigned INTEGER;
    total_responded INTEGER;
BEGIN
    SELECT COUNT(*) INTO total_assigned
    FROM request_matches
    WHERE provider_id = NEW.provider_id;

    SELECT COUNT(*) INTO total_responded
    FROM request_matches
    WHERE provider_id = NEW.provider_id
      AND provider_response IS NOT NULL;

    UPDATE providers
    SET response_rate = CASE
        WHEN total_assigned = 0 THEN 0
        ELSE ROUND((total_responded::NUMERIC / total_assigned) * 100, 2)
    END
    WHERE id = NEW.provider_id;

    PERFORM recalculate_provider_trust(NEW.provider_id);

    RETURN NEW;
END;
$$;

CREATE TRIGGER matches_refresh_response_rate
AFTER UPDATE OF provider_response ON request_matches
FOR EACH ROW
WHEN (NEW.provider_response IS DISTINCT FROM OLD.provider_response)
EXECUTE FUNCTION refresh_response_rate();

-- ============================================================
-- COMMUNITY RECOMMENDATIONS — eligibility + count (§16a)
-- ============================================================

CREATE OR REPLACE FUNCTION enforce_recommendation_eligibility()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
    conn_status connection_status;
    conn_requester UUID;
    conn_provider_user UUID;
    provider_owner UUID;
BEGIN
    SELECT c.status, c.requester_id, p.user_id
    INTO conn_status, conn_requester, conn_provider_user
    FROM connections c
    JOIN providers p ON p.id = c.provider_id
    WHERE c.id = NEW.connection_id
      AND c.provider_id = NEW.provider_id;

    IF conn_status IS NULL THEN
        RAISE EXCEPTION 'connection_id does not reference a connection with this provider';
    END IF;

    IF conn_status <> 'completed' THEN
        RAISE EXCEPTION 'Recommendations require a completed connection';
    END IF;

    IF NOT (NEW.recommender_id = conn_requester OR NEW.recommender_id = conn_provider_user) THEN
        RAISE EXCEPTION 'Recommender was not a participant in this connection';
    END IF;

    SELECT user_id INTO provider_owner FROM providers WHERE id = NEW.provider_id;
    IF NEW.recommender_id = provider_owner THEN
        RAISE EXCEPTION 'A provider cannot recommend their own profile';
    END IF;

    RETURN NEW;
END;
$$;

CREATE TRIGGER provider_recommendations_check_eligibility
BEFORE INSERT ON provider_recommendations
FOR EACH ROW
EXECUTE FUNCTION enforce_recommendation_eligibility();

CREATE OR REPLACE FUNCTION refresh_recommendation_count()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    target UUID := COALESCE(NEW.provider_id, OLD.provider_id);
BEGIN
    UPDATE providers
    SET recommendation_count = (
        SELECT COUNT(*)
        FROM provider_recommendations
        WHERE provider_id = target
          AND is_active = true
    )
    WHERE id = target;

    PERFORM recalculate_provider_trust(target);

    RETURN NEW;
END;
$$;

CREATE TRIGGER provider_recommendations_refresh_count
AFTER INSERT OR UPDATE OF is_active ON provider_recommendations
FOR EACH ROW
EXECUTE FUNCTION refresh_recommendation_count();

-- ============================================================
-- ENABLE RLS
-- ============================================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE providers ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE provider_services ENABLE ROW LEVEL SECURITY;
ALTER TABLE locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE provider_availability ENABLE ROW LEVEL SECURITY;
ALTER TABLE requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE request_matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE provider_trust_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE recommendations ENABLE ROW LEVEL SECURITY;
ALTER TABLE provider_recommendations ENABLE ROW LEVEL SECURITY;
ALTER TABLE saved_providers ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- PROFILES RLS
-- ============================================================

CREATE POLICY profiles_select_own
ON profiles
FOR SELECT
USING (id = auth.uid());

CREATE POLICY profiles_insert_own
ON profiles
FOR INSERT
WITH CHECK (id = auth.uid());

CREATE POLICY profiles_update_own
ON profiles
FOR UPDATE
USING (id = auth.uid())
WITH CHECK (id = auth.uid());

-- ============================================================
-- PROVIDERS RLS
-- ============================================================

CREATE POLICY providers_public_read
ON providers
FOR SELECT
USING (is_active = true);

CREATE POLICY providers_owner_insert
ON providers
FOR INSERT
WITH CHECK (user_id = auth.uid());

CREATE POLICY providers_owner_update
ON providers
FOR UPDATE
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- This policy alone would let a provider set completed_jobs, average_rating,
-- response_rate, phone_verified_at, identity_submitted_at, or
-- recommendation_count directly, since RLS only checks row ownership, not
-- which columns changed. See §20a and the column-level GRANT/REVOKE block
-- at the end of this file, which is what actually closes that gap.

-- ============================================================
-- CATEGORY / SERVICE RLS
-- ============================================================

CREATE POLICY categories_public_read
ON categories
FOR SELECT
USING (is_active = true);

CREATE POLICY services_public_read
ON services
FOR SELECT
USING (is_active = true);

CREATE POLICY provider_services_public_read
ON provider_services
FOR SELECT
USING (
    EXISTS (
        SELECT 1
        FROM providers p
        WHERE p.id = provider_services.provider_id
          AND p.is_active = true
    )
);

-- ============================================================
-- LOCATIONS RLS
-- ============================================================

CREATE POLICY locations_owner_read
ON locations
FOR SELECT
USING (
    user_id = auth.uid()
    OR
    provider_id IN (
        SELECT id
        FROM providers
        WHERE user_id = auth.uid()
    )
);

CREATE POLICY locations_owner_insert
ON locations
FOR INSERT
WITH CHECK (
    user_id = auth.uid()
    OR
    provider_id IN (
        SELECT id
        FROM providers
        WHERE user_id = auth.uid()
    )
);

CREATE POLICY locations_owner_update
ON locations
FOR UPDATE
USING (
    user_id = auth.uid()
    OR
    provider_id IN (
        SELECT id
        FROM providers
        WHERE user_id = auth.uid()
    )
);

-- ============================================================
-- AVAILABILITY RLS
-- ============================================================

CREATE POLICY availability_public_read
ON provider_availability
FOR SELECT
USING (
    EXISTS (
        SELECT 1
        FROM providers p
        WHERE p.id = provider_availability.provider_id
          AND p.is_active = true
    )
);

CREATE POLICY availability_owner_insert
ON provider_availability
FOR INSERT
WITH CHECK (
    provider_id IN (
        SELECT id
        FROM providers
        WHERE user_id = auth.uid()
    )
);

CREATE POLICY availability_owner_update
ON provider_availability
FOR UPDATE
USING (
    provider_id IN (
        SELECT id
        FROM providers
        WHERE user_id = auth.uid()
    )
);

-- ============================================================
-- REQUESTS RLS
-- ============================================================

CREATE POLICY requests_owner_select
ON requests
FOR SELECT
USING (
    requester_id = auth.uid()
    OR
    EXISTS (
        SELECT 1
        FROM request_matches rm
        JOIN providers p
          ON p.id = rm.provider_id
        WHERE rm.request_id = requests.id
          AND p.user_id = auth.uid()
    )
);

CREATE POLICY requests_owner_insert
ON requests
FOR INSERT
WITH CHECK (
    requester_id = auth.uid()
);

CREATE POLICY requests_owner_update
ON requests
FOR UPDATE
USING (
    requester_id = auth.uid()
)
WITH CHECK (
    requester_id = auth.uid()
);

CREATE POLICY requests_owner_delete
ON requests
FOR DELETE
USING (
    requester_id = auth.uid()
);

-- ============================================================
-- REQUEST MATCHES RLS
-- ============================================================

CREATE POLICY matches_participants_read
ON request_matches
FOR SELECT
USING (
    provider_id IN (
        SELECT id
        FROM providers
        WHERE user_id = auth.uid()
    )
    OR
    request_id IN (
        SELECT id
        FROM requests
        WHERE requester_id = auth.uid()
    )
);

CREATE POLICY matches_provider_update
ON request_matches
FOR UPDATE
USING (
    provider_id IN (
        SELECT id
        FROM providers
        WHERE user_id = auth.uid()
    )
)
WITH CHECK (
    provider_id IN (
        SELECT id
        FROM providers
        WHERE user_id = auth.uid()
    )
);

-- This policy alone would let a provider rewrite total_match_score,
-- trust_score, or any other scoring column on their own match row — the row
-- ownership check says nothing about which columns changed. Column-level
-- GRANT (end of file) restricts this to status, provider_response, and
-- provider_responded_at only.

-- ============================================================
-- CONNECTIONS RLS
-- ============================================================

CREATE POLICY connections_participant_read
ON connections
FOR SELECT
USING (
    requester_id = auth.uid()
    OR
    provider_id IN (
        SELECT id
        FROM providers
        WHERE user_id = auth.uid()
    )
);

CREATE POLICY connections_requester_insert
ON connections
FOR INSERT
WITH CHECK (
    requester_id = auth.uid()
);

CREATE POLICY connections_participant_update
ON connections
FOR UPDATE
USING (
    requester_id = auth.uid()
    OR
    provider_id IN (
        SELECT id
        FROM providers
        WHERE user_id = auth.uid()
    )
);

-- Column-level GRANT (end of file) restricts direct client UPDATEs on this
-- table to status (non-completion transitions only), cancelled_at, and
-- started_at. requester_confirmed_at, provider_confirmed_at, and completed_at
-- are excluded from the grant — only confirm_connection_completion()
-- (SECURITY DEFINER, §21 "COMPLETION GATE") can write them. The
-- connections_guard_completion trigger additionally rejects any direct
-- attempt to set status = 'completed', closing the gap even if a future
-- migration accidentally widens the column grant.

-- ============================================================
-- REVIEWS RLS
-- ============================================================

CREATE POLICY reviews_public_read
ON reviews
FOR SELECT
USING (true);

CREATE POLICY reviews_participant_insert
ON reviews
FOR INSERT
WITH CHECK (
    reviewer_id = auth.uid()
    AND
    EXISTS (
        SELECT 1
        FROM connections c
        WHERE c.id = reviews.connection_id
          AND c.status = 'completed'
          AND (
              c.requester_id = auth.uid()
              OR
              c.provider_id IN (
                  SELECT id
                  FROM providers
                  WHERE user_id = auth.uid()
              )
          )
    )
);

CREATE POLICY reviews_owner_update
ON reviews
FOR UPDATE
USING (reviewer_id = auth.uid())
WITH CHECK (reviewer_id = auth.uid());

-- ============================================================
-- TRUST RLS
-- ============================================================

CREATE POLICY trust_public_read
ON provider_trust_scores
FOR SELECT
USING (
    EXISTS (
        SELECT 1
        FROM providers p
        WHERE p.id = provider_trust_scores.provider_id
          AND p.is_active = true
    )
);

-- ============================================================
-- RECOMMENDATIONS RLS
-- ============================================================

CREATE POLICY recommendations_owner_read
ON recommendations
FOR SELECT
USING (user_id = auth.uid());

-- Note: `recommendations` above is the unused AI-suggestions table (§16).
-- It intentionally has no INSERT policy — nothing should be writing to it
-- for MVP. The real Community Recommendations feature is below.

-- ============================================================
-- PROVIDER RECOMMENDATIONS RLS (Community Recommendations — §16a)
-- ============================================================

CREATE POLICY provider_recommendations_public_read
ON provider_recommendations
FOR SELECT
USING (
    is_active = true
    AND EXISTS (
        SELECT 1
        FROM providers p
        WHERE p.id = provider_recommendations.provider_id
          AND p.is_active = true
    )
);

CREATE POLICY provider_recommendations_owner_insert
ON provider_recommendations
FOR INSERT
WITH CHECK (recommender_id = auth.uid());

CREATE POLICY provider_recommendations_owner_revoke
ON provider_recommendations
FOR UPDATE
USING (recommender_id = auth.uid())
WITH CHECK (recommender_id = auth.uid());

-- Column-level GRANT (end of file) restricts the revoke UPDATE to the
-- is_active column only — a recommender can deactivate their own
-- recommendation, not rewrite connection_id or provider_id to fake a
-- different one.

-- ============================================================
-- SAVED PROVIDERS RLS
-- ============================================================

CREATE POLICY saved_providers_owner_read
ON saved_providers
FOR SELECT
USING (user_id = auth.uid());

CREATE POLICY saved_providers_owner_insert
ON saved_providers
FOR INSERT
WITH CHECK (user_id = auth.uid());

CREATE POLICY saved_providers_owner_delete
ON saved_providers
FOR DELETE
USING (user_id = auth.uid());

-- ============================================================
-- NOTIFICATIONS RLS
-- ============================================================

CREATE POLICY notifications_owner_read
ON notifications
FOR SELECT
USING (user_id = auth.uid());

CREATE POLICY notifications_owner_update
ON notifications
FOR UPDATE
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- ============================================================
-- COLUMN-LEVEL WRITE PROTECTION (§20a)
-- RLS controls row access; it does not restrict which columns a permitted
-- UPDATE can change. These GRANT statements close that gap for every table
-- where a trust- or score-relevant column would otherwise be writable by
-- the row's own owner. Run after RLS policies are in place. Adjust the
-- `authenticated` role name if your Supabase project uses a different one.
-- ============================================================

-- providers: owner may edit their own listing content, not their own
-- trust/verification/score inputs.
REVOKE UPDATE ON providers FROM authenticated;
GRANT UPDATE (
    display_name, bio, experience_years, service_radius_km, is_active
) ON providers TO authenticated;

-- request_matches: provider may respond to a match, not rewrite its scores.
REVOKE UPDATE ON request_matches FROM authenticated;
GRANT UPDATE (
    status, provider_response, provider_responded_at
) ON request_matches TO authenticated;

-- connections: participants may cancel or start; only
-- confirm_connection_completion() (SECURITY DEFINER) may write the
-- confirmation timestamps or complete the connection.
REVOKE UPDATE ON connections FROM authenticated;
GRANT UPDATE (
    status, cancelled_at, started_at
) ON connections TO authenticated;

-- provider_recommendations: recommender may revoke, not edit what/who was
-- recommended or backdate which connection it references.
REVOKE UPDATE ON provider_recommendations FROM authenticated;
GRANT UPDATE (
    is_active
) ON provider_recommendations TO authenticated;

-- ============================================================
-- END OF SCHEMA
-- ============================================================
```

## 22. Matching Logic — CANONICAL MATCH SCORE FORMULA

This must match TRD §8.4 and Implementation Plan Phase 5 exactly. Earlier drafts of this section used different weights (25/20/15/15/10/15) — this replaces that version.

The matching engine should follow:

```text
User Request
     │
     ▼
AI Parser
     │
     ├── category
     ├── service
     ├── budget
     ├── availability
     └── radius
     │
     ▼
Candidate Filtering
     │
     ├── matching service
     ├── active provider
     ├── within radius
     └── available
     │
     ▼
Scoring
     │
     ├── Skill/Service Match 30%
     ├── Distance            20%
     ├── Budget               15%
     ├── Availability         15%
     ├── Trust                10%
     └── Rating                10%
     │
     ▼
request_matches
```

Formula:

```text
Total Match Score =
    service_score × 0.30
  + distance_score × 0.20
  + price_score × 0.15
  + availability_score × 0.15
  + trust_score × 0.10
  + rating_score × 0.10
```

There is no `experience_score` column and none is planned — see TRD §8.11. Minimum threshold: **40/100** (TRD §8.13).

`rating_score` uses the same dampening as the Trust Score's rating factor: if the provider has fewer than 3 reviews, use 0.5 instead of the raw `average_rating / 5`. `price_score` uses 0.3, not 0 or 1.0, when provider pricing is unknown (TRD §8.7).

## 23. Example Distance Query

Find providers within 5 km:

```sql
SELECT
    p.id,
    p.display_name,
    ST_Distance(
        l.point,
        r.location
    ) / 1000 AS distance_km
FROM requests r
JOIN locations l
    ON l.provider_id IS NOT NULL
JOIN providers p
    ON p.id = l.provider_id
WHERE r.id = 'REQUEST_UUID'
  AND p.is_active = true
  AND ST_DWithin(
      l.point,
      r.location,
      r.radius_km * 1000
  );
```

## 24. Example AI Request

Input:

> "Need a maths tutor for my 12th standard brother. Budget around ₹500. We are available Saturday and Sunday and want someone within 5 km."

AI output:

```json
{
  "category": "education",
  "service": "math tutor",
  "level": "12th",
  "budget": 500,
  "availability": [
    "Saturday",
    "Sunday"
  ],
  "radius_km": 5
}
```

Normalized:

```text
category_id = Education
service_id = Math Tutor
budget_max = 500
radius_km = 5
latitude = user's latitude
longitude = user's longitude
```

## 25. Request Lifecycle

```text
1. Need
   ↓
requests.status = open

2. AI parsing
   ↓
ai_parsed_requirement
   ↓
normalized matching fields

3. Matching
   ↓
request_matches

4. Provider response
   ↓
pending → viewed → interested
              or
            declined

5. Connect
   ↓
request_matches.status = accepted
connections.status = active

6. Complete (dual-confirmation gate — §20a)
   ↓
requester calls confirm_connection_completion()
   ↓
provider calls confirm_connection_completion()
   ↓
(only once BOTH have confirmed)
   ↓
connections.status = completed
requests.status = completed

7. Review
   ↓
provider rating recalculated
   ↓
trust score recalculated

Neither participant can reach step 6 alone. This is deliberate — see §20a for why a
single-party completion toggle was treated as a critical integrity gap.
```

## 26. Seed Data Strategy

For a hackathon demo:

| Data | Target |
|---|---:|
| Categories | 6–8 |
| Services | 20–30 |
| Providers | 30–50 |
| Locations | 30–50 |
| Availability records | 100–150 |
| Reviews | 80–150 |
| Requests | 10–20 |
| Matches | 50–100 |
| Community recommendations (`provider_recommendations`) | 20–40 |

Seed scripts must run as the Supabase `service_role` (which bypasses RLS and the column-level `GRANT`/`REVOKE` restrictions in §21), since `completed_jobs`, `average_rating`, `response_rate`, `phone_verified_at`, `identity_submitted_at`, and `recommendation_count` are no longer directly writable by the `authenticated` role — that restriction is the point (§20a), and it applies during seeding too, not just at runtime. Seed `provider_recommendations` rows against `connections` that are seeded with `status = 'completed'`, so the eligibility trigger (§16a) doesn't reject them.

Suggested categories:

```text
Education
Home Services
Technology
Beauty & Wellness
Events
Automotive
```

Example services:

```text
Math Tutor
Science Tutor
English Tutor
AC Repair
Plumbing
Electrician
Home Cleaning
Web Development
Graphic Design
Laptop Repair
Photography
Video Editing
Event Decoration
```

Use different:

```text
distances: 1 km, 2.5 km, 4 km, 7 km, 10 km
ratings: 3.2 – 5.0
trust scores: 45 – 98
prices: ₹200 – ₹2,500
availability: weekday / weekend / evening / morning
```

## 27. Migration Order

```text
1. Extensions
2. ENUM types
3. profiles
4. categories
5. services
6. providers
7. provider_services
8. locations
9. provider_availability
10. requests
11. request_matches
12. connections
13. reviews
14. provider_trust_scores
15. recommendations
16. provider_recommendations
17. saved_providers
18. notifications
19. triggers/functions
20. RLS
21. column-level GRANT/REVOKE (§20a — must run after RLS, since it further restricts what RLS already permits)
22. seed data (as `service_role`, see §26)
```

## 28. Recommended Supabase Configuration

### Authentication

Recommended MVP providers:

```text
Email/password
Google OAuth
```

Authenticated user ID:

```sql
auth.uid()
```

maps to:

```text
profiles.id
```

### Storage

Recommended buckets:

```text
avatars
provider-documents
service-images
```

Keep verification documents private.

### Database

Enable:

```text
PostGIS
```

Use:

```text
GEOGRAPHY(Point, 4326)
```

for locations.

### Realtime

Useful for:

```text
notifications
request_matches
connections
```

No separate WebSocket server is necessary for the MVP.

## 29. Recommended Hackathon Architecture

```text
                 SUPABASE
                    │
       ┌────────────┼────────────┐
       │            │            │
     Auth       PostgreSQL     Storage
                    │
                 PostGIS
                    │
              Backend/API
                    │
          ┌─────────┴─────────┐
          │                   │
      AI Parser          Match Engine
          │                   │
          └─────────┬─────────┘
                    │
              Need → Match
                    │
                 Connect
```

Do not over-engineer the MVP with:

- microservices
- Redis
- Kafka
- Elasticsearch
- separate authentication server
- separate location server
- separate notification server

## 30. Final Entity Relationship

```text
                    ┌──────────────┐
                    │    USERS     │
                    │   profiles   │
                    └──────┬───────┘
                           │
              ┌────────────┼─────────────┐
              │            │             │
              ▼            ▼             ▼
         PROVIDERS      REQUESTS      SAVED
              │            │
       ┌──────┼──────┐     │
       │      │      │     ▼
       ▼      ▼      ▼  MATCHES
    SERVICES LOCATION AVAILABILITY
       │                   │
       └─────────┬─────────┘
                 │
                 ▼
              MATCHING
                 │
                 ▼
            CONNECTIONS
                 │
                 ▼
               REVIEWS
                 │
                 ▼
          TRUST SCORE
```

### Core architectural principle

> **Requests represent NEED. `request_matches` represents MATCH. `connections` represents CONNECT.**

This keeps the database directly aligned with Local Connect's official tagline:

**Need → Match → Connect**

### Final implementation note

Keep the AI parser and matching engine in the backend/application layer. PostgreSQL should handle durable data, constraints, RLS, indexing and geographic filtering. This is simpler to debug and demonstrate for a 3-person hackathon team.
