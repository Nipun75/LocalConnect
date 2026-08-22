// LocalConnect AI Schemas & JSON Data Contracts

export interface ParsedNeedSchema {
  service: string;
  category?: string;
  level?: string;
  budget_max?: number;
  location?: string;
  availability?: {
    days?: string[];
    time_of_day?: 'morning' | 'afternoon' | 'evening' | 'flexible';
  };
  urgency?: 'immediate' | 'today' | 'this_week' | 'flexible';
  constraints?: string[];
  raw_query?: string;
}

export interface MatchScorecardSchema {
  provider_id: string;
  match_score: number; // 0 - 100
  distance_km: number;
  factor_scores: {
    skill_fit: number;
    similarity: number;
    distance: number;
    availability: number;
    budget: number;
    trust: number;
    response_rate: number;
  };
  explanation: string;
  match_highlights: string[];
}

export interface TrustScorecardSchema {
  provider_id: string;
  trust_score: number; // 0 - 100
  identity_points: number; // / 25
  experience_points: number; // / 25
  rating_points: number; // / 30
  responsiveness_points: number; // / 20
  verified_signals: string[];
  caveats_or_notes?: string[];
}

export interface ProviderFitSchema {
  provider_id: string;
  fit_score: number; // 0 - 100
  customer_summary: string;
  fit_highlights: string[];
  suggested_reply: string;
  proposed_rate: string;
}
