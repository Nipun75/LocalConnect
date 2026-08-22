import {
  ParsedRequirement,
  RankingWeights,
  DEFAULT_RANKING_WEIGHTS,
  ScoreBreakdown,
  ProviderMatch,
} from '@/types/ai';
import { Provider } from '@/types/provider';
import { evaluateDistanceScore } from './locationEngine';
import { evaluateBudgetScore } from './budgetEngine';
import { calculateSemanticOverlap } from '../ai/semanticOntology';
import { aiService } from '../ai/AIService';

export async function calculateProviderMatchScore(
  requirement: ParsedRequirement,
  provider: Provider,
  weights: RankingWeights = DEFAULT_RANKING_WEIGHTS
): Promise<ProviderMatch> {
  // 1. Service & Skill Relevance (0 - 100)
  const providerServicesStr = provider.services.join(' ').toLowerCase();
  const providerSkillsStr = provider.skills.join(' ').toLowerCase();
  const reqServiceLower = requirement.service.toLowerCase();

  let directServiceMatch = false;
  if (
    providerServicesStr.includes(reqServiceLower) ||
    provider.title.toLowerCase().includes(reqServiceLower) ||
    (reqServiceLower.includes('math') && (providerServicesStr.includes('math') || provider.title.toLowerCase().includes('math'))) ||
    (reqServiceLower.includes('electric') && (providerServicesStr.includes('electric') || provider.title.toLowerCase().includes('electric'))) ||
    (reqServiceLower.includes('ac') && (providerServicesStr.includes('ac') || provider.title.toLowerCase().includes('ac'))) ||
    (reqServiceLower.includes('photo') && (providerServicesStr.includes('photo') || provider.title.toLowerCase().includes('photo'))) ||
    (reqServiceLower.includes('yoga') && (providerServicesStr.includes('yoga') || provider.title.toLowerCase().includes('yoga'))) ||
    (reqServiceLower.includes('chef') && (providerServicesStr.includes('chef') || provider.title.toLowerCase().includes('cook')))
  ) {
    directServiceMatch = true;
  }

  const serviceOverlap = directServiceMatch
    ? 1.0
    : calculateSemanticOverlap(requirement.service, [
        ...provider.services,
        provider.title,
        provider.category,
      ]);

  let skillMatchCount = 0;
  if (requirement.skills_required.length > 0) {
    for (const reqSkill of requirement.skills_required) {
      const sLower = reqSkill.toLowerCase();
      if (
        providerSkillsStr.includes(sLower) ||
        providerServicesStr.includes(sLower) ||
        provider.title.toLowerCase().includes(sLower) ||
        (sLower.includes('12') && (providerSkillsStr.includes('12') || provider.title.includes('12') || providerServicesStr.includes('12'))) ||
        (sLower.includes('10') && (providerSkillsStr.includes('10') || provider.title.includes('10') || providerServicesStr.includes('10'))) ||
        (sLower.includes('calculus') && (providerSkillsStr.includes('calculus') || providerServicesStr.includes('calculus'))) ||
        (sLower.includes('cbse') && (providerSkillsStr.includes('cbse') || providerServicesStr.includes('cbse'))) ||
        (sLower.includes('math') && (providerSkillsStr.includes('math') || providerServicesStr.includes('math')))
      ) {
        skillMatchCount++;
      }
    }
  }

  const skillRatio =
    requirement.skills_required.length > 0
      ? skillMatchCount / requirement.skills_required.length
      : 1;

  let skillRelevance = Math.round(serviceOverlap * 60 + skillRatio * 40);
  skillRelevance = Math.min(100, Math.max(10, skillRelevance));

  // 2. Requirement Similarity (0 - 100) (mode, level/sub-type, gender)
  let reqSimilarity = 85;
  if (requirement.level_or_type) {
    const levelLower = requirement.level_or_type.toLowerCase();
    if (
      provider.title.toLowerCase().includes(levelLower) ||
      providerServicesStr.includes(levelLower) ||
      providerSkillsStr.includes(levelLower) ||
      provider.bio.toLowerCase().includes(levelLower)
    ) {
      reqSimilarity = 100;
    } else {
      reqSimilarity = 70;
    }
  }

  if (requirement.gender_preference && requirement.gender_preference !== 'any') {
    if (provider.gender === requirement.gender_preference) {
      reqSimilarity = Math.min(100, reqSimilarity + 10);
    } else {
      reqSimilarity = Math.max(20, reqSimilarity - 40);
    }
  }
  reqSimilarity = Math.min(100, Math.max(10, reqSimilarity));

  // 3. Distance Score (0 - 100)
  const distResult = evaluateDistanceScore(requirement.location, provider.location);
  const distanceScore = distResult.score;

  // 4. Availability Score (0 - 100)
  let availabilityScore = 70; // baseline
  if (requirement.schedule.days && requirement.schedule.days.length > 0) {
    const matchedDays = requirement.schedule.days.filter((day) =>
      provider.availability.days.includes(day)
    );
    if (matchedDays.length === requirement.schedule.days.length) {
      availabilityScore = 100; // All requested days available
    } else if (matchedDays.length > 0) {
      availabilityScore = 80; // Partial days available
    } else {
      availabilityScore = 30; // Requested days not available
    }
  } else if (requirement.schedule.date === 'Today' && provider.availability.is_available_today) {
    availabilityScore = 100;
  } else if (requirement.schedule.date === 'Tomorrow') {
    availabilityScore = 95;
  } else if (provider.availability.days.length >= 4) {
    availabilityScore = 90;
  }

  // 5. Budget Compatibility (0 - 100)
  const budgetResult = evaluateBudgetScore(requirement.budget, provider.pricing);
  const budgetScore = budgetResult.score;

  // 6. Trust & Reputation (0 - 100)
  const trustScore = provider.trust_breakdown.total_score;

  // 7. Response & Reliability History (0 - 100)
  const responseScore = Math.round(
    provider.trust_signals.response_rate_percent * 0.7 +
      (100 - provider.trust_signals.cancellation_rate_percent * 10) * 0.3
  );

  const breakdown: ScoreBreakdown = {
    skill_relevance: skillRelevance,
    requirement_similarity: reqSimilarity,
    distance: distanceScore,
    availability: availabilityScore,
    budget_compatibility: budgetScore,
    trust_reputation: trustScore,
    response_reliability: responseScore,
  };

  // Calculate Weighted Total Match Score
  const totalWeight =
    weights.skill_relevance +
    weights.requirement_similarity +
    weights.distance +
    weights.availability +
    weights.budget_compatibility +
    weights.trust_reputation +
    weights.response_reliability;

  const rawWeightedScore =
    breakdown.skill_relevance * weights.skill_relevance +
    breakdown.requirement_similarity * weights.requirement_similarity +
    breakdown.distance * weights.distance +
    breakdown.availability * weights.availability +
    breakdown.budget_compatibility * weights.budget_compatibility +
    breakdown.trust_reputation * weights.trust_reputation +
    breakdown.response_reliability * weights.response_reliability;

  const matchScore = Math.round(rawWeightedScore / (totalWeight || 1));

  // Generate explanation
  const explanation = await aiService.generateMatchExplanation(
    requirement,
    provider,
    breakdown,
    distResult.distanceKm
  );

  return {
    provider_id: provider.id,
    match_score: Math.min(99, Math.max(20, matchScore)),
    score_breakdown: breakdown,
    distance_km: distResult.distanceKm,
    explanation,
    rank: 1,
    is_top_match: false,
  };
}

export async function rankProviders(
  requirement: ParsedRequirement,
  providers: Provider[],
  weights: RankingWeights = DEFAULT_RANKING_WEIGHTS
): Promise<Array<{ provider: Provider; match: ProviderMatch }>> {
  const matchPromises = providers.map(async (provider) => {
    const match = await calculateProviderMatchScore(requirement, provider, weights);
    return { provider, match };
  });

  const scoredList = await Promise.all(matchPromises);

  // Sort by match score descending
  scoredList.sort((a, b) => b.match.match_score - a.match.match_score);

  // Assign ranks
  scoredList.forEach((item, index) => {
    item.match.rank = index + 1;
    item.match.is_top_match = index === 0;
  });

  return scoredList;
}
