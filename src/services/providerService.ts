import { MOCK_PROVIDERS } from '@/data/mockProviders';
import { Provider } from '@/types/provider';
import {
  ParsedRequirement,
  RankingWeights,
  DEFAULT_RANKING_WEIGHTS,
  ProviderMatch,
  RecommendationFeedbackItem,
} from '@/types/ai';
import { rankProviders } from './matching/matchingEngine';
import { aiService } from './ai/AIService';

class ProviderService {
  private providers: Provider[] = [...MOCK_PROVIDERS];
  private feedbackStore: RecommendationFeedbackItem[] = [];

  public getAllProviders(): Provider[] {
    return this.providers;
  }

  public getProviderById(id: string): Provider | undefined {
    return this.providers.find((p) => p.id === id);
  }

  // Pre-filter candidate providers based on category/taxonomy to avoid brute force
  public getCandidateProviders(requirement: ParsedRequirement): Provider[] {
    const targetCategory = requirement.category.toLowerCase();
    const targetService = requirement.service.toLowerCase();

    // 1. Direct category match
    const categoryMatches = this.providers.filter((p) =>
      p.category.toLowerCase().includes(targetCategory) ||
      targetCategory.includes(p.category.toLowerCase()) ||
      p.services.some((s) => s.toLowerCase().includes(targetService) || targetService.includes(s.toLowerCase())) ||
      p.title.toLowerCase().includes(targetService)
    );

    if (categoryMatches.length > 0) {
      return categoryMatches;
    }

    // Fallback: return all providers
    return this.providers;
  }

  // Find and rank matches for a requirement
  public async findMatches(
    requirement: ParsedRequirement,
    weights: RankingWeights = DEFAULT_RANKING_WEIGHTS
  ): Promise<Array<{ provider: Provider; match: ProviderMatch }>> {
    const candidates = this.getCandidateProviders(requirement);
    return await rankProviders(requirement, candidates, weights);
  }

  // Conversational refinement & re-ranking
  public async refineAndRerank(
    currentRequirement: ParsedRequirement,
    followupText: string,
    currentWeights: RankingWeights = DEFAULT_RANKING_WEIGHTS
  ): Promise<{
    updatedRequirement: ParsedRequirement;
    updatedMatches: Array<{ provider: Provider; match: ProviderMatch }>;
    updatedWeights: RankingWeights;
  }> {
    const lower = followupText.toLowerCase();
    const updatedWeights = { ...currentWeights };
    const updatedRequirement = await aiService.refineRequirement(currentRequirement, followupText);

    // Adjust ranking weights dynamically based on user intent
    if (lower.includes('cheaper') || lower.includes('budget') || lower.includes('price') || lower.includes('sasta')) {
      updatedWeights.budget_compatibility = 0.35;
      updatedWeights.skill_relevance = 0.20;
    } else if (lower.includes('closest') || lower.includes('near') || lower.includes('distance') || lower.includes('paas')) {
      updatedWeights.distance = 0.40;
      updatedWeights.skill_relevance = 0.20;
    } else if (lower.includes('best reviews') || lower.includes('top rated') || lower.includes('trust') || lower.includes('reliable')) {
      updatedWeights.trust_reputation = 0.35;
      updatedWeights.response_reliability = 0.15;
    } else if (lower.includes('sunday') || lower.includes('saturday') || lower.includes('weekend') || lower.includes('availability') || lower.includes('tomorrow')) {
      updatedWeights.availability = 0.35;
    }

    const updatedMatches = await this.findMatches(updatedRequirement, updatedWeights);

    return {
      updatedRequirement,
      updatedMatches,
      updatedWeights,
    };
  }

  // Record user recommendation feedback (👍 / 👎)
  public recordFeedback(feedback: Omit<RecommendationFeedbackItem, 'id' | 'timestamp'>): void {
    const item: RecommendationFeedbackItem = {
      ...feedback,
      id: `fb_${Date.now()}`,
      timestamp: new Date().toISOString(),
    };
    this.feedbackStore.push(item);
    console.log('[ProviderService] Feedback recorded:', item);
  }

  public getFeedbackStore(): RecommendationFeedbackItem[] {
    return this.feedbackStore;
  }
}

export const providerService = new ProviderService();
