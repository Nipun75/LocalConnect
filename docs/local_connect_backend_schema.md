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
verification_status
response_rate
completed_jobs
average_rating
total_reviews
service_radius_km
is_active
```

Trust score is not manually entered. It is calculated from provider activity.

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

Store the inputs:

```text
verification_score
rating_score
completion_score
response_score
review_score
trust_score
calculated_at
```

Example formula:

```text
Trust Score =
    Verification Score × 0.25
  + Rating Score       × 0.30
  + Completion Score   × 0.20
  + Response Score     × 0.15
  + Review Score       × 0.10
```

`provider_trust_scores` is a **derived/cache table**. The source of truth remains:

```text
providers
reviews
connections
```

The score is recalculated using a database function.

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

CREATE TYPE verification_status AS ENUM (
    'unverified',
    'pending',
    'verified',
    'rejected'
);

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

    verification_status verification_status
        NOT NULL DEFAULT 'unverified',

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
        CHECK (service_radius_km > 0)
);

CREATE INDEX idx_providers_user
ON providers(user_id);

CREATE INDEX idx_providers_active
ON providers(is_active);

CREATE INDEX idx_providers_verification
ON providers(verification_status);

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

    verification_score NUMERIC(5,2) NOT NULL DEFAULT 0,
    rating_score NUMERIC(5,2) NOT NULL DEFAULT 0,
    completion_score NUMERIC(5,2) NOT NULL DEFAULT 0,
    response_score NUMERIC(5,2) NOT NULL DEFAULT 0,
    review_score NUMERIC(5,2) NOT NULL DEFAULT 0,

    trust_score NUMERIC(5,2) NOT NULL DEFAULT 0,

    calculation_version TEXT NOT NULL DEFAULT 'v1',

    calculated_at TIMESTAMPTZ NOT NULL DEFAULT now(),

    CONSTRAINT trust_verification_check
        CHECK (verification_score BETWEEN 0 AND 100),

    CONSTRAINT trust_rating_check
        CHECK (rating_score BETWEEN 0 AND 100),

    CONSTRAINT trust_completion_check
        CHECK (completion_score BETWEEN 0 AND 100),

    CONSTRAINT trust_response_check
        CHECK (response_score BETWEEN 0 AND 100),

    CONSTRAINT trust_review_check
        CHECK (review_score BETWEEN 0 AND 100),

    CONSTRAINT trust_score_check
        CHECK (trust_score BETWEEN 0 AND 100)
);

CREATE INDEX idx_trust_score
ON provider_trust_scores(trust_score DESC);

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

CREATE OR REPLACE FUNCTION recalculate_provider_trust(
    target_provider UUID
)
RETURNS NUMERIC
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    verification NUMERIC := 0;
    rating NUMERIC := 0;
    completion NUMERIC := 0;
    response NUMERIC := 0;
    review_score NUMERIC := 0;
    final_score NUMERIC := 0;

    provider_rating NUMERIC := 0;
    completed_count INTEGER := 0;
    review_count INTEGER := 0;
    provider_response NUMERIC := 0;
    verification_state verification_status;
BEGIN

    SELECT
        verification_status,
        average_rating,
        completed_jobs,
        total_reviews,
        response_rate
    INTO
        verification_state,
        provider_rating,
        completed_count,
        review_count,
        provider_response
    FROM providers
    WHERE id = target_provider;

    IF verification_state = 'verified' THEN
        verification := 100;
    ELSIF verification_state = 'pending' THEN
        verification := 40;
    ELSE
        verification := 0;
    END IF;

    rating :=
        LEAST(
            100,
            (COALESCE(provider_rating, 0) / 5.0) * 100
        );

    completion :=
        LEAST(
            100,
            completed_count * 5
        );

    response :=
        LEAST(
            100,
            COALESCE(provider_response, 0)
        );

    review_score :=
        LEAST(
            100,
            review_count * 10
        );

    final_score :=
          verification * 0.25
        + rating * 0.30
        + completion * 0.20
        + response * 0.15
        + review_score * 0.10;

    INSERT INTO provider_trust_scores (
        provider_id,
        verification_score,
        rating_score,
        completion_score,
        response_score,
        review_score,
        trust_score,
        calculation_version,
        calculated_at
    )
    VALUES (
        target_provider,
        verification,
        rating,
        completion,
        response,
        review_score,
        ROUND(final_score, 2),
        'v1',
        now()
    )
    ON CONFLICT (provider_id)
    DO UPDATE SET
        verification_score = EXCLUDED.verification_score,
        rating_score = EXCLUDED.rating_score,
        completion_score = EXCLUDED.completion_score,
        response_score = EXCLUDED.response_score,
        review_score = EXCLUDED.review_score,
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
-- END OF SCHEMA
-- ============================================================
```

## 22. Matching Logic

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
     ├── Service Match       25%
     ├── Distance            20%
     ├── Availability        15%
     ├── Price               15%
     ├── Rating              10%
     └── Trust               15%
     │
     ▼
request_matches
```

Formula:

```text
Total Match Score =
    service_score × 0.25
  + distance_score × 0.20
  + availability_score × 0.15
  + price_score × 0.15
  + rating_score × 0.10
  + trust_score × 0.15
```

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

6. Complete
   ↓
connections.status = completed
requests.status = completed

7. Review
   ↓
provider rating recalculated
   ↓
trust score recalculated
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
16. saved_providers
17. notifications
18. triggers/functions
19. RLS
20. seed data
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
