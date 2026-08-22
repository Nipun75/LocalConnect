# LocalConnect AI Intelligence Subsystem

The `ai/` directory is the dedicated home for all artificial intelligence, natural language processing, semantic matching, and trust evaluation modules within LocalConnect.

---

## Folder Structure & Responsibilities

```
ai/
├── parser/                 # Step 1: Natural language need parser
├── matching/               # Step 2: 7-factor weighted scoring & ranking
├── refinement/             # Step 3: Conversational search refinement
├── trust/                  # Step 4a: 4-factor verified trust scorecard
├── review_intelligence/    # Step 4b: Review sentiment & theme analysis
├── provider_assistant/     # Step 5: Provider fit score & suggested reply generator
├── services/               # GeminiProvider, LocalDeterministicProvider, AIService
├── schemas/                # Data contracts and JSON schemas
├── shared/                 # Semantic ontology and dictionary
├── prompts/                # Structured LLM system prompts
└── README.md
```

---

## Module Breakdown

### 1. `ai/parser/`
Responsible for converting free-form natural language and Hinglish queries into structured requirement schemas.
- **Inputs**: User text (e.g., *"I need a maths tutor for class 12 under ₹500 near me, preferably Sunday."*)
- **Outputs**:
  ```json
  {
    "service": "Maths Tutor",
    "level": "Class 12",
    "budget_max": 500,
    "location": "Dharampeth, Nagpur",
    "availability": { "days": ["Sunday"] }
  }
  ```

### 2. `ai/matching/`
7-factor transparent provider matching and ranking engine:
- Skill Fit (30%)
- Semantic Similarity (20%)
- Distance Proximity (15%)
- Availability Match (10%)
- Budget Compatibility (10%)
- Trust Score (10%)
- Response Rate (5%)

### 3. `ai/refinement/`
Maintains conversational continuity and applies stateful criteria updates.
- **Example**: *"Only show Sunday available ones"* -> Preserves original service, class level, and budget while updating the availability filter.

### 4. `ai/trust/` & `ai/review_intelligence/`
Factual trust score calculation out of 100 based on verified Aadhaar ID, completed jobs count, ratings, and response rate. Extracts positive praise themes and transparent caveats without hallucination.

### 5. `ai/provider_assistant/`
Assists service providers by evaluating incoming customer requirements:
- Computes **Request Fit Score** (0–100%)
- Highlights why the match fits or flags mismatches
- Generates a **draft reply suggestion** grounded strictly in provider profile rates

### 6. `ai/services/`
Multi-engine architecture with **Google Gemini 1.5/2.0** and **Local Deterministic Fallback** ensuring zero downtime and 100% test reliability.
