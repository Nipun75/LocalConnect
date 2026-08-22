// LocalConnect AI Provider Match Scoring Engine

import { Provider } from '@/types/provider';
import { ParsedNeed } from '@/services/aiParser';
import { calculateDistanceKm, resolveLocationFromQuery } from '@/data/locations';
import { calculateSemanticOverlap } from '@/services/ai/semanticOntology';
import { generateFactualExplanation } from './explainMatch';

export interface ScoreBreakdown {
  service: number;
  requirements: number;
  distance: number;
  availability: number;
  budget: number;
  trust: number;
  reliability: number;
}

export interface MatchScoreResult {
  providerId: string;
  matchScore: number; // 0 - 100
  breakdown: ScoreBreakdown;
  matchedRequirements: string[];
  unmatchedRequirements: string[];
  explanation: string;
  distanceKm: number;
}

export interface RankingWeightsConfig {
  service: number;
  requirements: number;
  distance: number;
  availability: number;
  budget: number;
  trust: number;
  reliability: number;
}

export const BASE_WEIGHTS: RankingWeightsConfig = {
  service: 0.30,
  requirements: 0.20,
  distance: 0.15,
  availability: 0.10,
  budget: 0.10,
  trust: 0.10,
  reliability: 0.05,
};

/**
 * Calculates a 0-100 match score for a candidate provider against user's parsed need.
 * Features Dynamic Normalization: Unspecified criteria (e.g. no budget) do not penalize the score.
 */
export function calculateMatchScore(
  provider: Provider,
  need: ParsedNeed,
  customWeights: Partial<RankingWeightsConfig> = {}
): MatchScoreResult {
  const matchedRequirements: string[] = [];
  const unmatchedRequirements: string[] = [];

  // Determine active constraints specified by the user
  const hasBudgetConstraint = need.budget_max !== undefined && need.budget_max !== null && need.budget_max > 0;
  const hasAvailabilityConstraint =
    (need.availability?.days && need.availability.days.length > 0) ||
    need.date !== null && need.date !== undefined ||
    need.time !== null && need.time !== undefined;
  const hasDistanceConstraint = need.radius_km !== undefined && need.radius_km !== null && need.radius_km > 0;
  const hasLevelConstraint = Boolean(need.level);

  // 1. Service / Skill Relevance (0 - 100)
  const providerServicesStr = provider.services.join(' ').toLowerCase();
  const providerSkillsStr = provider.skills.join(' ').toLowerCase();
  const reqService = (need.service || '').toLowerCase();

  let directServiceMatch = false;
  if (
    providerServicesStr.includes(reqService) ||
    provider.title.toLowerCase().includes(reqService) ||
    (reqService.includes('math') && (providerServicesStr.includes('math') || provider.title.toLowerCase().includes('math'))) ||
    (reqService.includes('electric') && (providerServicesStr.includes('electric') || provider.title.toLowerCase().includes('electric'))) ||
    (reqService.includes('ac') && (providerServicesStr.includes('ac') || provider.title.toLowerCase().includes('ac'))) ||
    (reqService.includes('plumb') && (providerServicesStr.includes('plumb') || provider.title.toLowerCase().includes('plumb'))) ||
    (reqService.includes('laptop') && (providerServicesStr.includes('laptop') || provider.title.toLowerCase().includes('laptop'))) ||
    (reqService.includes('photo') && (providerServicesStr.includes('photo') || provider.title.toLowerCase().includes('photo'))) ||
    (reqService.includes('cook') && (providerServicesStr.includes('cook') || provider.title.toLowerCase().includes('chef'))) ||
    (reqService.includes('chef') && (providerServicesStr.includes('chef') || provider.title.toLowerCase().includes('cook')))
  ) {
    directServiceMatch = true;
  }

  const serviceOverlap = directServiceMatch
    ? 1.0
    : calculateSemanticOverlap(need.service || '', [...provider.services, provider.title, provider.category]);

  let skillMatchCount = 0;
  const requiredSkills = need.skills || [];
  if (requiredSkills.length > 0) {
    for (const reqSkill of requiredSkills) {
      const sLower = reqSkill.toLowerCase();
      if (
        providerSkillsStr.includes(sLower) ||
        providerServicesStr.includes(sLower) ||
        provider.title.toLowerCase().includes(sLower) ||
        (sLower.includes('12') && (providerSkillsStr.includes('12') || provider.title.includes('12') || providerServicesStr.includes('12'))) ||
        (sLower.includes('10') && (providerSkillsStr.includes('10') || provider.title.includes('10') || providerServicesStr.includes('10')))
      ) {
        skillMatchCount++;
      }
    }
  }

  const skillRatio = requiredSkills.length > 0 ? skillMatchCount / requiredSkills.length : 1;
  const serviceScore = Math.min(100, Math.max(10, Math.round(serviceOverlap * 60 + skillRatio * 40)));

  if (serviceScore >= 80) {
    matchedRequirements.push(need.service || provider.title);
  } else {
    unmatchedRequirements.push(need.service || 'Service specialization');
  }

  // 2. Requirement / Semantic Match (0 - 100) (level, specific subtype)
  let reqScore = 90;
  if (hasLevelConstraint && need.level) {
    const lvlLower = need.level.toLowerCase();
    if (
      provider.title.toLowerCase().includes(lvlLower) ||
      providerServicesStr.includes(lvlLower) ||
      providerSkillsStr.includes(lvlLower) ||
      provider.bio.toLowerCase().includes(lvlLower)
    ) {
      reqScore = 100;
      matchedRequirements.push(`Level: ${need.level.toUpperCase()}`);
    } else {
      reqScore = 50; // Hard requirement penalty
      unmatchedRequirements.push(`Level: ${need.level.toUpperCase()}`);
    }
  }

  // 3. Distance Score (0 - 100)
  const userOrigin = resolveLocationFromQuery(need.location || need.raw_query || '');
  const userLat = userOrigin.lat;
  const userLng = userOrigin.lng;
  const distanceKm = calculateDistanceKm(userLat, userLng, provider.location.lat, provider.location.lng);

  const radiusKm = need.radius_km || 5;
  const isWithinRadius = distanceKm <= radiusKm;

  let distanceScore = 100;
  if (distanceKm <= 1.5) {
    distanceScore = 100;
  } else if (distanceKm <= radiusKm) {
    const ratio = (distanceKm - 1.5) / Math.max(1, radiusKm - 1.5);
    distanceScore = Math.round(100 - ratio * 20); // 100 -> 80
  } else {
    // Hard constraint distance penalty: Drops significantly if outside requested radius
    const overageKm = distanceKm - radiusKm;
    distanceScore = Math.max(0, Math.round(45 - overageKm * 8));
  }

  if (isWithinRadius) {
    matchedRequirements.push(`Within ${distanceKm.toFixed(1)} km (${provider.location.area})`);
  } else if (hasDistanceConstraint) {
    unmatchedRequirements.push(`${distanceKm.toFixed(1)} km away (outside ${radiusKm} km radius)`);
  }

  // 4. Availability Score (0 - 100)
  let availabilityScore = 85;
  let isAvailabilityMatched = true;

  if (hasAvailabilityConstraint) {
    if (need.availability?.days && need.availability.days.length > 0) {
      const matchCount = need.availability.days.filter((d) => provider.availability.days.includes(d)).length;
      if (matchCount === need.availability.days.length) {
        availabilityScore = 100;
        matchedRequirements.push(`Available ${need.availability.days.join(' & ')}`);
      } else if (matchCount > 0) {
        availabilityScore = 75;
        matchedRequirements.push(`Partial availability (${matchCount}/${need.availability.days.length} days)`);
      } else {
        availabilityScore = 30; // Hard availability mismatch
        isAvailabilityMatched = false;
        unmatchedRequirements.push(`Not available on ${need.availability.days.join(' & ')}`);
      }
    } else if (need.date === 'today' && provider.availability.is_available_today) {
      availabilityScore = 100;
      matchedRequirements.push('Available today');
    } else if (need.date === 'tomorrow') {
      availabilityScore = 95;
      matchedRequirements.push('Available tomorrow');
    }
  }

  // 5. Budget Compatibility (0 - 100)
  let budgetScore = 90;
  let isWithinBudget = true;

  if (hasBudgetConstraint && need.budget_max) {
    const providerRate = provider.pricing.base_rate;
    if (providerRate <= need.budget_max) {
      const savingsRatio = (need.budget_max - providerRate) / need.budget_max;
      budgetScore = Math.min(100, Math.round(95 + savingsRatio * 5));
      matchedRequirements.push(`Budget fit: ₹${providerRate} (under ₹${need.budget_max})`);
    } else {
      isWithinBudget = false;
      const overagePercent = ((providerRate - need.budget_max) / need.budget_max) * 100;
      if (overagePercent <= 15) {
        budgetScore = 70;
      } else if (overagePercent <= 30) {
        budgetScore = 50;
      } else {
        budgetScore = Math.max(10, Math.round(40 - overagePercent));
      }
      unmatchedRequirements.push(`₹${providerRate} (exceeds budget ₹${need.budget_max})`);
    }
  }

  // 6. Trust & Reputation Score (0 - 100)
  const trustScore = provider.trust_breakdown?.total_score || Math.round(provider.trust_signals.average_rating * 19);
  if (provider.trust_signals.identity_verified) {
    matchedRequirements.push('Identity Verified');
  }

  // 7. Reliability / Response History (0 - 100)
  const reliabilityScore = Math.round(
    provider.trust_signals.response_rate_percent * 0.7 +
      (100 - Math.min(100, provider.trust_signals.cancellation_rate_percent * 10)) * 0.3
  );

  const breakdown: ScoreBreakdown = {
    service: serviceScore,
    requirements: reqScore,
    distance: distanceScore,
    availability: availabilityScore,
    budget: budgetScore,
    trust: trustScore,
    reliability: reliabilityScore,
  };

  // DYNAMIC NORMALIZATION OF WEIGHTS
  // If user didn't specify budget/availability, do not penalize provider; renormalize active weights
  let activeWeights: RankingWeightsConfig = {
    service: customWeights.service ?? BASE_WEIGHTS.service,
    requirements: customWeights.requirements ?? BASE_WEIGHTS.requirements,
    distance: customWeights.distance ?? BASE_WEIGHTS.distance,
    availability: hasAvailabilityConstraint ? (customWeights.availability ?? BASE_WEIGHTS.availability) : 0,
    budget: hasBudgetConstraint ? (customWeights.budget ?? BASE_WEIGHTS.budget) : 0,
    trust: customWeights.trust ?? BASE_WEIGHTS.trust,
    reliability: customWeights.reliability ?? BASE_WEIGHTS.reliability,
  };

  const sumWeights = Object.values(activeWeights).reduce((a, b) => a + b, 0);
  if (sumWeights > 0) {
    activeWeights = {
      service: activeWeights.service / sumWeights,
      requirements: activeWeights.requirements / sumWeights,
      distance: activeWeights.distance / sumWeights,
      availability: activeWeights.availability / sumWeights,
      budget: activeWeights.budget / sumWeights,
      trust: activeWeights.trust / sumWeights,
      reliability: activeWeights.reliability / sumWeights,
    };
  }

  let rawMatchScore =
    breakdown.service * activeWeights.service +
    breakdown.requirements * activeWeights.requirements +
    breakdown.distance * activeWeights.distance +
    breakdown.availability * activeWeights.availability +
    breakdown.budget * activeWeights.budget +
    breakdown.trust * activeWeights.trust +
    breakdown.reliability * activeWeights.reliability;

  // Hard constraints penalty (Item 12 in specification)
  let hardPenalty = 0;
  if (hasDistanceConstraint && !isWithinRadius) {
    const overage = distanceKm - radiusKm;
    hardPenalty += Math.min(30, Math.round(15 + overage * 2));
  }
  if (hasBudgetConstraint && !isWithinBudget && need.budget_max) {
    const overagePercent = ((provider.pricing.base_rate - need.budget_max) / need.budget_max) * 100;
    if (overagePercent > 20) {
      hardPenalty += Math.min(25, Math.round(overagePercent * 0.4));
    }
  }

  const matchScore = Math.min(100, Math.max(10, Math.round(rawMatchScore - hardPenalty)));

  // Generate factual, zero-hallucination explanation
  const explanation = generateFactualExplanation(
    provider,
    need,
    distanceKm,
    isWithinBudget,
    isWithinRadius,
    isAvailabilityMatched
  );

  return {
    providerId: provider.id,
    matchScore,
    breakdown,
    matchedRequirements,
    unmatchedRequirements,
    explanation,
    distanceKm,
  };
}
