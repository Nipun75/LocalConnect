import {
  ParsedRequirement,
  ProviderMatch,
  MatchExplanation,
  ScoreBreakdown,
  ProviderComparison,
  ReviewSummary,
  ProfileEnhancementRequest,
  ProfileEnhancementResult,
} from '@/types/ai';
import { Provider, ReviewItem } from '@/types/provider';

export interface ParseOptions {
  userLocationName?: string;
  defaultRadiusKm?: number;
}

export interface AIProvider {
  name: string;
  isAvailable(): Promise<boolean>;

  // 1. Parse natural language requirement (English, Hinglish, vague requests)
  parseRequirement(
    query: string,
    options?: ParseOptions
  ): Promise<ParsedRequirement>;

  // 2. Refine existing requirement with conversational follow-up
  refineRequirement(
    previous: ParsedRequirement,
    followupText: string
  ): Promise<ParsedRequirement>;

  // 3. Generate honest, verifiable explanation for why a provider matches
  generateMatchExplanation(
    requirement: ParsedRequirement,
    provider: Provider,
    scoreBreakdown: ScoreBreakdown,
    distanceKm: number
  ): Promise<MatchExplanation>;

  // 4. Compare top matched providers side-by-side
  compareProviders(
    requirement: ParsedRequirement,
    matches: Array<{ provider: Provider; match: ProviderMatch }>
  ): Promise<ProviderComparison>;

  // 5. Enhance provider profile from raw inputs without inventing qualifications
  enhanceProfile(
    request: ProfileEnhancementRequest
  ): Promise<ProfileEnhancementResult>;

  // 6. Summarize provider reviews into strengths, concerns, and overall sentiment
  summarizeReviews(
    reviews: ReviewItem[],
    providerTitle: string
  ): Promise<ReviewSummary>;
}
