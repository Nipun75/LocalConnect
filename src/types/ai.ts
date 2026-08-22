// AI Types for LocalConnect Intelligence Layer

export type UrgencyLevel = 'low' | 'normal' | 'urgent' | 'immediate';
export type ServiceMode = 'in_person' | 'online' | 'both';

export interface BudgetRequirement {
  min?: number;
  max?: number;
  currency: string;
  unit: 'session' | 'hour' | 'job' | 'month' | 'total';
  raw_text?: string;
  flexibility?: 'strict' | 'flexible' | 'approximate';
}

export interface ScheduleRequirement {
  date?: string; // e.g. "tomorrow", "2026-08-23", "December 20"
  time_slot?: string; // e.g. "evening", "morning", "afternoon", "immediate"
  days?: string[]; // e.g. ["Saturday", "Sunday"]
  recurring?: boolean;
}

export interface LocationRequirement {
  name: string;
  area?: string;
  city?: string;
  lat?: number;
  lng?: number;
  radius_km: number;
  is_user_current?: boolean;
}

export interface ParsedRequirement {
  id: string;
  raw_query: string;
  language_detected: 'en' | 'hi' | 'hinglish';
  category: string; // e.g. "Education", "Home Maintenance", "Creative & Tech", "Events & Catering", "Appliance Repair"
  service: string; // e.g. "Maths Tutor", "Electrician", "Wedding Photographer", "AC Repair"
  sub_category?: string;
  level_or_type?: string; // e.g. "Class 12", "CBSE", "Split AC", "Candid Wedding"
  skills_required: string[]; // e.g. ["Class 11-12 Maths", "Calculus", "CBSE"]
  location: LocationRequirement;
  budget: BudgetRequirement;
  schedule: ScheduleRequirement;
  urgency: UrgencyLevel;
  mode: ServiceMode;
  experience_min_years?: number;
  gender_preference?: 'any' | 'male' | 'female';
  language_preference?: string;
  constraints: string[]; // e.g. ["near home", "weekend only", "female tutor"]
  confidence_score: number; // 0 - 1
  missing_fields: string[]; // e.g. ["budget", "schedule"]
  follow_up_question?: string; // Concise question if critical info is missing
  created_at: string;
}

export interface RankingWeights {
  skill_relevance: number; // default: 0.30
  requirement_similarity: number; // default: 0.20
  distance: number; // default: 0.15
  availability: number; // default: 0.10
  budget_compatibility: number; // default: 0.10
  trust_reputation: number; // default: 0.10
  response_reliability: number; // default: 0.05
}

export const DEFAULT_RANKING_WEIGHTS: RankingWeights = {
  skill_relevance: 0.30,
  requirement_similarity: 0.20,
  distance: 0.15,
  availability: 0.10,
  budget_compatibility: 0.10,
  trust_reputation: 0.10,
  response_reliability: 0.05,
};

export interface ScoreBreakdown {
  skill_relevance: number; // 0 - 100
  requirement_similarity: number; // 0 - 100
  distance: number; // 0 - 100
  availability: number; // 0 - 100
  budget_compatibility: number; // 0 - 100
  trust_reputation: number; // 0 - 100
  response_reliability: number; // 0 - 100
}

export interface MatchExplanation {
  headline: string; // e.g. "Rahul matches your subject, budget, weekend schedule, and preferred distance."
  bullet_points: string[]; // e.g. ["Teaches Class 11–12 Mathematics", "2.1 km away", "Available Saturday & Sunday", "₹450/session (within ₹500 budget)"]
  strengths: string[];
  caveats?: string[]; // e.g. ["Slightly outside 3km radius (3.2 km)", "Budget ₹550 is slightly above target"]
  trust_highlights: string[];
}

export interface ProviderMatch {
  provider_id: string;
  match_score: number; // 0 - 100 (weighted)
  score_breakdown: ScoreBreakdown;
  distance_km: number;
  explanation: MatchExplanation;
  rank: number;
  is_top_match: boolean;
}

export interface ConversationalMessage {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: string;
  parsed_requirement?: ParsedRequirement;
  suggested_actions?: Array<{
    label: string;
    action_type: 'find_matches' | 'refine' | 'filter' | 'compare';
    payload?: any;
  }>;
}

export interface ProviderComparison {
  requirement_summary: string;
  providers: Array<{
    id: string;
    name: string;
    title: string;
    match_score: number;
    hourly_rate: number;
    distance_km: number;
    rating: number;
    review_count: number;
    trust_score: number;
    key_advantage: string;
    availability_summary: string;
    best_for: string;
  }>;
  ai_verdict: string;
}

export interface ReviewSummary {
  overall_sentiment: 'Exceptional' | 'Very Positive' | 'Positive' | 'Mixed';
  sentiment_score: number; // 0 - 100
  positive_highlights: string[];
  potential_concerns: string[];
  typical_experience: string;
  total_reviews_analyzed: number;
}

export interface ProfileEnhancementRequest {
  provider_name: string;
  category: string;
  raw_skills: string;
  raw_experience: string;
  raw_availability: string;
  target_audience?: string;
}

export interface ProfileEnhancementResult {
  suggested_title: string;
  professional_tagline: string;
  enhanced_bio: string;
  bullet_highlights: string[];
  service_tags: string[];
}

export interface RecommendationFeedbackItem {
  id: string;
  request_id: string;
  provider_id: string;
  useful: boolean; // true = thumbs up, false = thumbs down
  feedback_reason?: string;
  timestamp: string;
}
