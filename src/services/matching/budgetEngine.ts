import { BudgetRequirement } from '@/types/ai';
import { ProviderPricing } from '@/types/provider';

export interface BudgetScoreResult {
  score: number; // 0 - 100
  isWithinBudget: boolean;
  variancePercentage: number; // +ve if over budget, -ve if under budget
}

export function evaluateBudgetScore(
  userBudget: BudgetRequirement,
  providerPricing: ProviderPricing
): BudgetScoreResult {
  const providerRate = providerPricing.base_rate;
  const userMax = userBudget.max;

  if (!userMax || userMax <= 0) {
    // If user has not specified a budget, standard baseline compatibility
    return {
      score: 90,
      isWithinBudget: true,
      variancePercentage: 0,
    };
  }

  if (providerRate <= userMax) {
    // Perfect fit within budget
    // Give bonus points for being well within budget without being unrealistically low
    const savingsRatio = (userMax - providerRate) / userMax;
    const score = Math.min(100, Math.round(95 + savingsRatio * 5));
    return {
      score,
      isWithinBudget: true,
      variancePercentage: -Math.round(savingsRatio * 100),
    };
  }

  // Provider rate exceeds user budget
  const overage = providerRate - userMax;
  const overagePercent = (overage / userMax) * 100;

  let score = 100;
  if (overagePercent <= 10) {
    score = 80; // 10% over budget
  } else if (overagePercent <= 25) {
    score = 60; // 25% over budget
  } else if (overagePercent <= 50) {
    score = 40;
  } else {
    score = Math.max(10, Math.round(40 - (overagePercent - 50)));
  }

  return {
    score,
    isWithinBudget: false,
    variancePercentage: Math.round(overagePercent),
  };
}
