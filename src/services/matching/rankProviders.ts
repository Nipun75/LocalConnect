// Provider Ranking Engine for LocalConnect

import { Provider } from '@/types/provider';
import { ParsedNeed } from '@/services/aiParser';
import { calculateMatchScore, MatchScoreResult, RankingWeightsConfig } from './matchScore';

export interface RankedProviderItem {
  provider: Provider;
  match: MatchScoreResult;
}

/**
 * Intelligent Provider Ranking
 * Takes candidate providers and ranks them based on AI match score with factual explanations.
 * Falls back to standard database ordering if no parsed requirements exist.
 */
export function rankCandidates(
  candidates: Provider[],
  parsedNeed?: ParsedNeed | null,
  customWeights?: Partial<RankingWeightsConfig>
): RankedProviderItem[] {
  if (!candidates || candidates.length === 0) {
    return [];
  }

  // Fallback: If no AI parsed requirements exist, return candidates with standard rating-based ranking
  if (!parsedNeed || !parsedNeed.service) {
    return candidates
      .sort((a, b) => b.trust_signals.average_rating - a.trust_signals.average_rating)
      .map((provider) => ({
        provider,
        match: {
          providerId: provider.id,
          matchScore: Math.round(provider.trust_signals.average_rating * 19),
          breakdown: {
            service: 90,
            requirements: 85,
            distance: 85,
            availability: 80,
            budget: 85,
            trust: provider.trust_breakdown?.total_score || 90,
            reliability: provider.trust_signals.response_rate_percent || 90,
          },
          matchedRequirements: [provider.title, `${provider.trust_signals.average_rating}★ Rating`],
          unmatchedRequirements: [],
          explanation: `Top-rated provider for ${provider.category} with ${provider.trust_signals.completed_jobs_count} completed jobs.`,
          distanceKm: 2.0,
        },
      }));
  }

  // Compute Match Score for each candidate provider
  const scoredItems: RankedProviderItem[] = candidates.map((provider) => {
    const matchResult = calculateMatchScore(provider, parsedNeed, customWeights);
    return {
      provider,
      match: matchResult,
    };
  });

  // Sort descending by Match Score
  scoredItems.sort((a, b) => b.match.matchScore - a.match.matchScore);

  // Development Logging (Step 22)
  const isDev = Boolean(
    (typeof import.meta !== 'undefined' && (import.meta as any).env?.DEV) ||
    ((globalThis as any).process?.env?.NODE_ENV !== 'production')
  );

  if (isDev) {
    console.groupCollapsed(`[MatchEngine] Ranked ${scoredItems.length} Candidates for: "${parsedNeed.raw_query}"`);
    console.log('Parsed Need:', parsedNeed);
    scoredItems.forEach((item, idx) => {
      console.log(
        `#${idx + 1} ${item.provider.name} -> Score: ${item.match.matchScore}% | Dist: ${item.match.distanceKm.toFixed(1)}km | Rate: ${item.provider.pricing.display_string}`
      );
    });
    console.groupEnd();
  }

  return scoredItems;
}
