import { AIProvider } from './AIProvider';
import { GeminiProvider } from './GeminiProvider';
import { LocalDeterministicProvider } from './LocalDeterministicProvider';
import {
  ParsedRequirement,
  MatchExplanation,
  ScoreBreakdown,
  ProviderMatch,
  ProviderComparison,
  ReviewSummary,
  ProfileEnhancementRequest,
  ProfileEnhancementResult,
} from '@/types/ai';
import { Provider, ReviewItem } from '@/types/provider';

class AIServiceManager {
  private activeProvider: AIProvider;
  private localFallbackProvider: LocalDeterministicProvider;
  private queryCache: Map<string, ParsedRequirement> = new Map();
  private demoMode: boolean = true;

  constructor() {
    this.localFallbackProvider = new LocalDeterministicProvider();
    // Default to Gemini if key exists, otherwise Local
    const gemini = new GeminiProvider();
    this.activeProvider = gemini;
  }

  public setProvider(provider: AIProvider) {
    this.activeProvider = provider;
  }

  public getActiveProviderName(): string {
    return this.activeProvider.name;
  }

  public setDemoMode(enabled: boolean) {
    this.demoMode = enabled;
  }

  public isDemoMode(): boolean {
    return this.demoMode;
  }

  // Parse Requirement with in-memory caching and fallback
  public async parseRequirement(query: string, options?: { defaultRadiusKm?: number }): Promise<ParsedRequirement> {
    const cacheKey = query.trim().toLowerCase();
    if (this.queryCache.has(cacheKey)) {
      return { ...this.queryCache.get(cacheKey)!, id: `req_${Date.now()}` };
    }

    try {
      const result = await this.activeProvider.parseRequirement(query, options);
      this.queryCache.set(cacheKey, result);
      return result;
    } catch (err) {
      console.warn('[AIService] Provider failed, using local NLP:', err);
      const fallbackResult = await this.localFallbackProvider.parseRequirement(query, options);
      this.queryCache.set(cacheKey, fallbackResult);
      return fallbackResult;
    }
  }

  // Refine Requirement
  public async refineRequirement(previous: ParsedRequirement, followupText: string): Promise<ParsedRequirement> {
    try {
      return await this.activeProvider.refineRequirement(previous, followupText);
    } catch (err) {
      return await this.localFallbackProvider.refineRequirement(previous, followupText);
    }
  }

  // Generate Match Explanation
  public async generateMatchExplanation(
    requirement: ParsedRequirement,
    provider: Provider,
    scoreBreakdown: ScoreBreakdown,
    distanceKm: number
  ): Promise<MatchExplanation> {
    return this.activeProvider.generateMatchExplanation(requirement, provider, scoreBreakdown, distanceKm);
  }

  // Compare Providers
  public async compareProviders(
    requirement: ParsedRequirement,
    matches: Array<{ provider: Provider; match: ProviderMatch }>
  ): Promise<ProviderComparison> {
    return this.activeProvider.compareProviders(requirement, matches);
  }

  // Enhance Profile
  public async enhanceProfile(request: ProfileEnhancementRequest): Promise<ProfileEnhancementResult> {
    return this.activeProvider.enhanceProfile(request);
  }

  // Summarize Reviews
  public async summarizeReviews(reviews: ReviewItem[], providerTitle: string): Promise<ReviewSummary> {
    return this.activeProvider.summarizeReviews(reviews, providerTitle);
  }
}

export const aiService = new AIServiceManager();
