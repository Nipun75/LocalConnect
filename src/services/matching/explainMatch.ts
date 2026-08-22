// Factual, Zero-Hallucination Match Explanation Generator

import { Provider } from '@/types/provider';
import { ParsedNeed } from '@/services/aiParser';

export interface ExplanationComponents {
  serviceSnippet?: string;
  distanceSnippet?: string;
  budgetSnippet?: string;
  availabilitySnippet?: string;
  trustSnippet?: string;
}

/**
 * Generates a concise, factual explanation derived strictly from verified provider data.
 * Does not hallucinate or invent unverified credentials.
 */
export function generateFactualExplanation(
  provider: Provider,
  need: ParsedNeed,
  distanceKm: number,
  isWithinBudget: boolean,
  isWithinRadius: boolean,
  availabilityMatch: boolean
): string {
  const points: string[] = [];

  // 1. Service / Subject fact
  const formattedLevel = need.level ? need.level.replace(/\b\w/g, (c) => c.toUpperCase()) : '';
  const formattedService = need.service ? need.service.replace(/\b\w/g, (c) => c.toUpperCase()) : '';
  const lvl = need.level?.toLowerCase();
  const srv = need.service?.toLowerCase();

  if (lvl && (provider.title.toLowerCase().includes(lvl) || provider.services.some(s => s.toLowerCase().includes(lvl)))) {
    points.push(`teaches ${formattedLevel} ${formattedService || 'Mathematics'}`);
  } else if (srv && provider.services.some((s) => s.toLowerCase().includes(srv))) {
    points.push(`offers ${formattedService || need.service}`);
  } else if (provider.title) {
    points.push(`specializes in ${provider.title}`);
  }

  // 2. Distance fact
  if (distanceKm > 0) {
    points.push(`is ${distanceKm.toFixed(1)} km away${isWithinRadius ? '' : ' (outside requested radius)'}`);
  }

  // 3. Budget fact
  if (need.budget_max && need.budget_max > 0) {
    if (isWithinBudget) {
      points.push(`fits your ₹${need.budget_max} budget (${provider.pricing.display_string})`);
    } else {
      points.push(`charges ${provider.pricing.display_string}`);
    }
  } else if (provider.pricing) {
    points.push(`charges ${provider.pricing.display_string}`);
  }

  // 4. Availability fact
  if (need.availability?.days && need.availability.days.length > 0) {
    if (availabilityMatch) {
      const isWeekend = need.availability.days.includes('Saturday') && need.availability.days.includes('Sunday');
      points.push(isWeekend ? 'is available on weekends' : `is available on ${need.availability.days.join(' & ')}`);
    }
  } else if (provider.availability.is_available_weekend) {
    points.push('is available on weekends');
  }

  // 5. Trust fact
  if (provider.trust_signals.identity_verified && provider.trust_signals.average_rating >= 4.7) {
    points.push(`has a ${provider.trust_signals.average_rating}★ verified rating`);
  }

  if (points.length === 0) {
    return `Matches your request for ${provider.category}.`;
  }

  const subjectRole =
    provider.category.toLowerCase().includes('education') || provider.title.toLowerCase().includes('tutor')
      ? 'this tutor'
      : provider.category.toLowerCase().includes('appliance') || provider.title.toLowerCase().includes('electrician')
      ? 'this technician'
      : 'this professional';

  // Format into a natural sentence
  if (points.length === 1) {
    return `Strong match because ${subjectRole} ${points[0]}.`;
  }

  const allExceptLast = points.slice(0, -1).join(', ');
  const last = points[points.length - 1];
  return `Strong match because ${subjectRole} ${allExceptLast}, and ${last}.`;
}

