import { calculateDistanceKm } from '@/data/locations';
import { ProviderLocation } from '@/types/provider';
import { LocationRequirement } from '@/types/ai';

export interface DistanceScoreResult {
  distanceKm: number;
  score: number; // 0 - 100
  isWithinRadius: boolean;
}

export function evaluateDistanceScore(
  userLoc: LocationRequirement,
  providerLoc: ProviderLocation
): DistanceScoreResult {
  const userLat = userLoc.lat || 21.1442;
  const userLng = userLoc.lng || 79.0620;
  const distanceKm = calculateDistanceKm(userLat, userLng, providerLoc.lat, providerLoc.lng);

  const radius = userLoc.radius_km || 5;
  const isWithinRadius = distanceKm <= radius;

  // Scoring function:
  // 0 - 1.5 km -> 100 points
  // 1.5 - radius km -> decays smoothly from 100 down to 70
  // radius to radius + 3 km -> decays from 70 down to 30
  // > radius + 5 km -> minimum 10 points
  let score = 100;
  if (distanceKm <= 1.5) {
    score = 100;
  } else if (distanceKm <= radius) {
    const ratio = (distanceKm - 1.5) / Math.max(1, radius - 1.5);
    score = Math.round(100 - ratio * 30); // 100 -> 70
  } else if (distanceKm <= radius + 3) {
    const ratio = (distanceKm - radius) / 3;
    score = Math.round(70 - ratio * 40); // 70 -> 30
  } else {
    score = Math.max(10, Math.round(30 - (distanceKm - radius - 3) * 5));
  }

  return {
    distanceKm,
    score,
    isWithinRadius,
  };
}
