// LocalConnect AI Configuration, Security Guards, and Observability
// Central configuration for feature flags, input sanitization, timeouts, and logging

export interface AIConfiguration {
  AI_PARSER_ENABLED: boolean;
  AI_MATCHING_ENABLED: boolean;
  AI_REFINEMENT_ENABLED: boolean;
  AI_TRUST_ENABLED: boolean;
  AI_PROVIDER_ASSISTANT_ENABLED: boolean;
  DEMO_MODE: boolean;
  API_TIMEOUT_MS: number;
  MAX_RETRIES: number;
}

export const AI_CONFIG: AIConfiguration = {
  AI_PARSER_ENABLED: true,
  AI_MATCHING_ENABLED: true,
  AI_REFINEMENT_ENABLED: true,
  AI_TRUST_ENABLED: true,
  AI_PROVIDER_ASSISTANT_ENABLED: true,
  DEMO_MODE: true,
  API_TIMEOUT_MS: 5000,
  MAX_RETRIES: 1,
};

/**
 * Input Sanitizer & Prompt Injection Guard
 * Treats user queries as untrusted data, enforcing bounds and trimming excessive payloads.
 */
export function sanitizeAIInput(rawInput: string): string {
  if (!rawInput) return '';

  let sanitized = rawInput
    .replace(/[<>{}|\\]/g, '') // strip potential code injection characters
    .trim();

  // Enforce max string length (500 chars)
  if (sanitized.length > 500) {
    sanitized = sanitized.substring(0, 500);
  }

  return sanitized;
}

/**
 * Validate numeric constraints to prevent absurd parameters
 */
export function validateConstraints(params: {
  budgetMax?: number | null;
  radiusKm?: number | null;
}): { budgetMax?: number; radiusKm?: number } {
  const result: { budgetMax?: number; radiusKm?: number } = {};

  if (params.budgetMax !== undefined && params.budgetMax !== null) {
    // Budget bound: ₹50 to ₹500,000
    const clampedBudget = Math.max(50, Math.min(500000, params.budgetMax));
    result.budgetMax = clampedBudget;
  }

  if (params.radiusKm !== undefined && params.radiusKm !== null) {
    // Radius bound: 0.5 km to 50 km
    const clampedRadius = Math.max(0.5, Math.min(50, params.radiusKm));
    result.radiusKm = clampedRadius;
  }

  return result;
}

/**
 * Structured AI Observability & Performance Logger
 */
export function logAIOperation(logData: {
  feature: 'parser' | 'matching' | 'refinement' | 'trust' | 'provider_assistant';
  status: 'success' | 'fallback' | 'error';
  latencyMs: number;
  details?: string;
}) {
  const isDev = Boolean(
    ((import.meta as any).env && (import.meta as any).env.DEV) ||
    ((globalThis as any).process && (globalThis as any).process.env && (globalThis as any).process.env.NODE_ENV !== 'production') ||
    AI_CONFIG.DEMO_MODE
  );

  if (isDev) {
    console.log(
      `[AI_LOG] feature=${logData.feature} status=${logData.status} latency=${logData.latencyMs}ms ${
        logData.details ? `details="${logData.details}"` : ''
      }`
    );
  }
}

/**
 * Safe AI Call Wrapper with Timeout, Retries, and Fallback
 */
export async function executeAICallWithFallback<T>(
  operation: () => Promise<T>,
  fallback: () => T | Promise<T>,
  featureName: 'parser' | 'matching' | 'refinement' | 'trust' | 'provider_assistant'
): Promise<T> {
  const startTime = Date.now();

  const timeoutPromise = new Promise<never>((_, reject) =>
    setTimeout(() => reject(new Error('AI request timed out')), AI_CONFIG.API_TIMEOUT_MS)
  );

  let attempts = 0;
  while (attempts <= AI_CONFIG.MAX_RETRIES) {
    attempts++;
    try {
      const result = await Promise.race([operation(), timeoutPromise]);
      logAIOperation({
        feature: featureName,
        status: 'success',
        latencyMs: Date.now() - startTime,
      });
      return result;
    } catch (err) {
      if (attempts > AI_CONFIG.MAX_RETRIES) {
        logAIOperation({
          feature: featureName,
          status: 'fallback',
          latencyMs: Date.now() - startTime,
          details: (err as Error)?.message || 'Fallback engaged',
        });
        return await fallback();
      }
    }
  }

  return await fallback();
}
