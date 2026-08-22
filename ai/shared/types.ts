// AI Domain Types and Data Contracts
export * from '../schemas/schemas';
export type {
  ParsedRequirement,
  ScoreBreakdown,
  ProviderMatch,
  RankingWeights,
  MatchExplanation,
  ProviderComparison,
  ReviewSummary,
  ProfileEnhancementRequest,
  ProfileEnhancementResult,
  ConversationalMessage,
  RecommendationFeedbackItem,
} from '../../src/types/ai';
export { DEFAULT_RANKING_WEIGHTS } from '../../src/types/ai';
