// LocalConnect AI Provider Assistant Engine
// Helps local providers assess incoming customer requests, view fit scores, and generate factual reply suggestions.

import { Provider } from '@/types/provider';
import { ParsedNeed } from '@/services/aiParser';
import { calculateDistanceKm } from '@/data/locations';
import { resolveLocationFromQuery } from '@/data/locations';

export interface ProviderRequestFit {
  providerId: string;
  fitScore: number; // 0 - 100
  customerSummary: string;
  fitHighlights: string[];
  suggestedReply: string;
  proposedRate: string;
  distanceKm: number;
}

/**
 * Calculates provider fit for an incoming customer requirement
 */
export function calculateProviderFit(
  requirement: ParsedNeed,
  provider: Provider
): ProviderRequestFit {
  const reqService = (requirement.service || '').toLowerCase();
  const pServices = provider.services.map((s) => s.toLowerCase());
  const pSkills = provider.skills.map((s) => s.toLowerCase());

  // 1. Skill & Service Fit
  let skillFit = 75;
  if (
    pServices.some((s) => s.includes(reqService)) ||
    pSkills.some((s) => s.includes(reqService)) ||
    provider.title.toLowerCase().includes(reqService)
  ) {
    skillFit = 100;
  }

  // 2. Proximity
  const userLoc = resolveLocationFromQuery(requirement.raw_query || requirement.location || '');
  const distanceKm = calculateDistanceKm(
    userLoc.lat,
    userLoc.lng,
    provider.location.lat,
    provider.location.lng
  );
  let distanceFit = distanceKm <= 3 ? 100 : distanceKm <= 6 ? 80 : 60;

  // 3. Availability
  let availabilityFit = 85;
  if (requirement.availability?.days && requirement.availability.days.length > 0) {
    const matchCount = requirement.availability.days.filter((d) =>
      provider.availability.days.includes(d)
    ).length;
    availabilityFit = matchCount === requirement.availability.days.length ? 100 : 70;
  }

  // 4. Budget
  let budgetFit = 90;
  if (requirement.budget_max) {
    budgetFit = provider.pricing.base_rate <= requirement.budget_max ? 100 : 75;
  }

  const overallFit = Math.min(
    100,
    Math.round(skillFit * 0.4 + distanceFit * 0.25 + availabilityFit * 0.2 + budgetFit * 0.15)
  );

  // Highlights
  const fitHighlights: string[] = [];
  fitHighlights.push(`Matches your expertise in ${provider.services[0] || provider.category}`);
  fitHighlights.push(`${distanceKm.toFixed(1)} km from your base in ${provider.location.area}`);
  if (provider.pricing.base_rate <= (requirement.budget_max || 999999)) {
    fitHighlights.push(
      `Fits client's ₹${requirement.budget_max || provider.pricing.base_rate} budget (Your rate: ${provider.pricing.display_string})`
    );
  }

  // Customer Summary
  const daysStr = requirement.availability?.days?.join(' & ') || 'Flexible days';
  const customerSummary = `Client in ${requirement.location || userLoc.name} needs a ${requirement.level ? `${requirement.level} ` : ''}${requirement.service || 'service'} (Budget: ₹${requirement.budget_max || 'Flexible'}, ${daysStr}).`;

  // Suggested Reply
  const providerFirstName = provider.name.split(' ')[0];
  const suggestedReply = `Hello! I would be glad to assist you with ${requirement.service || 'this request'}. I have extensive experience in ${provider.skills.slice(0, 2).join(' and ')}. I am located in ${provider.location.area} (~${distanceKm.toFixed(1)} km away) and available ${daysStr}. My rate is ${provider.pricing.display_string}. Please let me know a suitable time to discuss details! - ${providerFirstName}`;

  return {
    providerId: provider.id,
    fitScore: overallFit,
    customerSummary,
    fitHighlights,
    suggestedReply,
    proposedRate: provider.pricing.display_string,
    distanceKm,
  };
}
