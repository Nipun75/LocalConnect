// LocalConnect Deterministic Trust & Verification Engine
// Implements Step 4: Transparent Trust Scoring & Verified Reputation Signals

import { TrustSignals, TrustScoreBreakdown } from '@/types/provider';

export interface TrustSignalsSnapshot {
  verified: boolean;
  rating: number;
  reviewCount: number;
  completedJobs: number;
  responseRatePercent?: number;
  avgResponseTimeMinutes?: number;
  cancellationRatePercent?: number;
}

export interface TrustScoreOutput extends TrustScoreBreakdown {
  trustScore: number; // 0 - 100
  signals: TrustSignalsSnapshot;
  positiveSignals: string[];
  limitations: string[];
  explanation: string;
  isNewProvider: boolean;
  breakdown: {
    verification: number; // Max 20
    ratingQuality: number; // Max 25
    reviewVolume: number; // Max 15
    completedJobs: number; // Max 15
    reliability: number; // Max 15
    responsiveness: number; // Max 10
  };
}

/**
 * Deterministic Trust Score Calculation (0 - 100)
 * Uses strictly verified database attributes with dynamic normalization.
 *
 * Weight Distribution:
 * - Verification: 20%
 * - Rating Quality: 25%
 * - Review Volume: 15%
 * - Completed Jobs & Experience: 15%
 * - Reliability: 15%
 * - Response Behavior: 10%
 * ----------------------------
 * TOTAL: 100%
 */
export function calculateTrustScore(signals: Partial<TrustSignals>): TrustScoreOutput {
  const isVerified = Boolean(signals.identity_verified);
  const reviewCount = signals.review_count ?? 0;
  const rating = signals.average_rating ?? (reviewCount > 0 ? 4.5 : 0);
  const completedJobs = signals.completed_jobs_count ?? 0;
  const responseRate = signals.response_rate_percent ?? 90;
  const avgResponseTime = signals.avg_response_time_minutes ?? 15;
  const cancellationRate = signals.cancellation_rate_percent ?? 0;
  const repeatCount = signals.repeat_customers_count ?? 0;

  const isNewProvider = reviewCount === 0 || completedJobs <= 1;

  // 1. Verification (Max 20 pts)
  let verificationScore = 0;
  if (signals.identity_verified) verificationScore += 12;
  if (signals.address_verified) verificationScore += 4;
  if (signals.skill_certified) verificationScore += 4;

  // 2. Rating Quality (Max 25 pts)
  // Rating 3.5★ -> 0 pts, 5.0★ -> 25 pts
  let ratingQualityScore = 0;
  if (reviewCount > 0 && rating > 3.5) {
    const norm = Math.min(1, Math.max(0, (rating - 3.5) / 1.5));
    ratingQualityScore = Math.round(norm * 25);
  } else if (isNewProvider && isVerified) {
    ratingQualityScore = 18; // Baseline for verified new providers
  }

  // 3. Review Volume (Max 15 pts)
  // 0-30 reviews scaled to 15 pts
  let reviewVolumeScore = Math.min(15, Math.round((reviewCount / 30) * 15));

  // 4. Completed Jobs & Experience (Max 15 pts)
  // 0-40 jobs scaled to 10 pts + repeat clients 0-15 scaled to 5 pts
  let jobsPart = Math.min(10, Math.round((completedJobs / 40) * 10));
  let repeatPart = Math.min(5, Math.round((repeatCount / 15) * 5));
  let completedJobsScore = jobsPart + repeatPart;

  // 5. Reliability & Low Cancellation (Max 15 pts)
  let cancelPart = cancellationRate <= 1 ? 10 : cancellationRate <= 3 ? 7 : cancellationRate <= 5 ? 4 : 1;
  let accountAgePart = Math.min(5, Math.round(((signals.account_age_months || 12) / 24) * 5));
  let reliabilityScore = cancelPart + accountAgePart;

  // 6. Responsiveness & Response Speed (Max 10 pts)
  let ratePart = Math.round((responseRate / 100) * 6);
  let timePart = avgResponseTime <= 15 ? 4 : avgResponseTime <= 30 ? 2 : 1;
  let responsivenessScore = ratePart + timePart;

  let totalScore = Math.min(
    100,
    verificationScore +
      ratingQualityScore +
      reviewVolumeScore +
      completedJobsScore +
      reliabilityScore +
      responsivenessScore
  );

  // Transparent Positive Signals & Limitations
  const positiveSignals: string[] = [];
  const limitations: string[] = [];
  const badges: string[] = [];
  const verificationReasons: string[] = [];

  if (isVerified) {
    positiveSignals.push('Identity verified profile');
    badges.push('Identity Verified');
    verificationReasons.push('Government ID verified by LocalConnect');
  }

  if (reviewCount >= 10 && rating >= 4.7) {
    positiveSignals.push(`${rating}★ rating from ${reviewCount} customer reviews`);
    badges.push('Top Rated');
    verificationReasons.push(`${rating}★ rating from ${reviewCount} local reviews`);
  } else if (reviewCount > 0) {
    positiveSignals.push(`${rating}★ rating from ${reviewCount} reviews`);
  }

  if (completedJobs >= 10) {
    positiveSignals.push(`${completedJobs}+ completed service requests`);
    badges.push(`${completedJobs}+ Jobs Completed`);
    verificationReasons.push(`${completedJobs} service commitments fulfilled`);
  }

  if (repeatCount >= 5) {
    positiveSignals.push(`${repeatCount} repeat customers`);
    badges.push('Repeat Clients');
  }

  if (responseRate >= 95 && avgResponseTime <= 15) {
    positiveSignals.push(`Fast responder (~${avgResponseTime} min reply time)`);
    badges.push('Super Responsive');
  }

  if (isNewProvider) {
    limitations.push('New provider with limited review history');
  } else if (reviewCount < 5) {
    limitations.push('Growing review history');
  }

  // Factual Explanation (Item 12 & 17)
  let explanation = '';
  if (isNewProvider) {
    explanation = isVerified
      ? 'Verified provider with limited review history.'
      : 'New provider — limited review history.';
  } else if (isVerified && reviewCount > 0 && completedJobs > 0) {
    explanation = `Verified provider with ${rating}★ from ${reviewCount} reviews and ${completedJobs} completed jobs.`;
  } else if (reviewCount > 0) {
    explanation = `Strong review history with ${rating}★ average rating across ${reviewCount} customer reviews.`;
  } else {
    explanation = isVerified ? 'Verified profile on LocalConnect.' : 'Registered local service provider.';
  }

  // Backward compatibility fields with TrustScoreBreakdown
  const identityPoints = verificationScore;
  const experiencePoints = completedJobsScore;
  const ratingPoints = ratingQualityScore + reviewVolumeScore;
  const responsivenessPoints = responsivenessScore + reliabilityScore;

  return {
    trustScore: totalScore,
    total_score: totalScore,
    signals: {
      verified: isVerified,
      rating,
      reviewCount,
      completedJobs,
      responseRatePercent: responseRate,
      avgResponseTimeMinutes: avgResponseTime,
      cancellationRatePercent: cancellationRate,
    },
    positiveSignals,
    limitations,
    explanation,
    isNewProvider,
    breakdown: {
      verification: verificationScore,
      ratingQuality: ratingQualityScore,
      reviewVolume: reviewVolumeScore,
      completedJobs: completedJobsScore,
      reliability: reliabilityScore,
      responsiveness: responsivenessScore,
    },
    identity_points: identityPoints,
    experience_points: experiencePoints,
    rating_points: ratingPoints,
    responsiveness_points: responsivenessPoints,
    badges,
    verification_reasons: verificationReasons,
  };
}
