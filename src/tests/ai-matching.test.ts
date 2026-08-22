import { describe, it, expect } from 'vitest';
import { LocalDeterministicProvider } from '../services/ai/LocalDeterministicProvider';
import { calculateProviderMatchScore, rankProviders } from '../services/matching/matchingEngine';
import { calculateTrustScore } from '../services/matching/trustEngine';
import { evaluateBudgetScore } from '../services/matching/budgetEngine';
import { evaluateDistanceScore } from '../services/matching/locationEngine';
import { findBestSemanticService } from '../services/ai/semanticOntology';
import { MOCK_PROVIDERS } from '../data/mockProviders';
import { DEFAULT_RANKING_WEIGHTS } from '../types/ai';

describe('LocalConnect AI Intelligence Layer Test Suite', () => {
  const parser = new LocalDeterministicProvider();

  describe('1. Natural Language Intent Parsing', () => {
    it('should parse standard English requirement (Class 10 maths under 500)', async () => {
      const result = await parser.parseRequirement('I need a tutor for class 10 maths under 500');
      expect(result.category).toContain('Education');
      expect(result.service).toBe('Maths Tutor');
      expect(result.level_or_type).toBe('Class 10');
      expect(result.budget.max).toBe(500);
    });

    it('should extract location and custom radius (electrician within 3 km)', async () => {
      const result = await parser.parseRequirement('Need an electrician within 3 km in Dharampeth');
      expect(result.service).toBe('Electrician');
      expect(result.location.radius_km).toBe(3);
      expect(result.location.name).toContain('Dharampeth');
    });

    it('should parse Hinglish requests (500 ke andar koi electrician chahiye)', async () => {
      const result = await parser.parseRequirement('500 ke andar koi electrician chahiye');
      expect(result.language_detected).toBe('hinglish');
      expect(result.service).toBe('Electrician');
      expect(result.budget.max).toBe(500);
    });

    it('should parse complex multi-constraint requirement (Hackathon Wow scenario)', async () => {
      const result = await parser.parseRequirement(
        'I need a maths tutor for my 12th-standard brother, weekends, within 3 km, budget ₹500.'
      );
      expect(result.service).toBe('Maths Tutor');
      expect(result.level_or_type).toBe('Class 12');
      expect(result.budget.max).toBe(500);
      expect(result.location.radius_km).toBe(3);
      expect(result.schedule.days).toContain('Saturday');
      expect(result.schedule.days).toContain('Sunday');
    });
  });

  describe('2. Semantic Matching (Not just exact keywords)', () => {
    it('should match "AC isn\'t cooling" to AC Repair & Service', () => {
      const match = findBestSemanticService("AC isn't cooling");
      expect(match.serviceId).toBe('ac_technician');
      expect(match.serviceName).toBe('AC Repair & Service');
    });

    it('should match "teach coding to my kid" to Coding & Programming Tutor', () => {
      const match = findBestSemanticService('teach coding to my kid');
      expect(match.serviceId).toBe('coding_instructor');
      expect(match.serviceName).toBe('Coding & Programming Tutor');
    });

    it('should match "short circuit in kitchen" to Electrician', () => {
      const match = findBestSemanticService('short circuit in kitchen');
      expect(match.serviceId).toBe('electrician');
    });
  });

  describe('3. Multi-Factor 7-Weighted Ranking Engine', () => {
    it('should rank Priya (96%) > Rahul (92%) > Amit (87%) for the Class 12 Maths Tutor scenario', async () => {
      const req = await parser.parseRequirement(
        'I need a maths tutor for my 12th-standard brother, weekends, within 3 km, budget ₹500.'
      );
      const mathProviders = MOCK_PROVIDERS.filter((p) => p.category === 'Education & Tutors');
      const ranked = await rankProviders(req, mathProviders, DEFAULT_RANKING_WEIGHTS);

      expect(ranked.length).toBeGreaterThanOrEqual(3);
      expect(ranked[0].provider.name).toBe('Priya Deshmukh');
      expect(ranked[0].match.match_score).toBeGreaterThanOrEqual(94);
      expect(ranked[1].provider.name).toBe('Rahul Sharma');
      expect(ranked[1].match.match_score).toBeGreaterThanOrEqual(88);
      expect(ranked[2].provider.name).toBe('Amit Verma');
    });

    it('should dynamically prioritize budget when user asks for someone cheaper', async () => {
      const initialReq = await parser.parseRequirement('Maths tutor in Dharampeth');
      const cheaperReq = await parser.refineRequirement(initialReq, 'Show me someone cheaper under 400');
      expect(cheaperReq.budget.max).toBe(400);

      const budgetScoreAmit = evaluateBudgetScore(cheaperReq.budget, { base_rate: 400, currency: 'INR', unit: 'session', display_string: '₹400' });
      const budgetScoreRahul = evaluateBudgetScore(cheaperReq.budget, { base_rate: 500, currency: 'INR', unit: 'session', display_string: '₹500' });
      expect(budgetScoreAmit.score).toBeGreaterThan(budgetScoreRahul.score);
    });
  });

  describe('4. Explainable AI & Verifiable Trust Scoring', () => {
    it('should calculate transparent Trust Score (0-100) using only actual provider signals', () => {
      const signals = {
        identity_verified: true,
        address_verified: true,
        skill_certified: true,
        completed_jobs_count: 47,
        average_rating: 4.9,
        review_count: 42,
        response_rate_percent: 98,
        avg_response_time_minutes: 12,
        repeat_customers_count: 16,
        cancellation_rate_percent: 1,
        community_endorsements_count: 24,
        account_age_months: 18,
      };
      const breakdown = calculateTrustScore(signals);
      expect(breakdown.totalScore).toBeGreaterThanOrEqual(95);
      expect(breakdown.identity_points).toBe(25);
      expect(breakdown.badges).toContain('Identity Verified');
      expect(breakdown.verification_reasons.length).toBeGreaterThan(0);
    });

    it('should generate honest explanations with no fabricated data', async () => {
      const req = await parser.parseRequirement('Maths tutor within 3 km budget 500');
      const priya = MOCK_PROVIDERS[0];
      const match = await calculateProviderMatchScore(req, priya, DEFAULT_RANKING_WEIGHTS);

      expect(match.explanation.headline).toContain('Priya');
      expect(match.explanation.bullet_points.some((b) => b.includes('450'))).toBe(true);
      expect(match.explanation.bullet_points.some((b) => b.includes('km away'))).toBe(true);
    });
  });

  describe('5. Resilience & Offline Fallback', () => {
    it('should guarantee deterministic execution without network or API keys', async () => {
      const isAvailable = await parser.isAvailable();
      expect(isAvailable).toBe(true);
      const parsed = await parser.parseRequirement('Emergency plumber right now near Sitabuldi');
      expect(parsed.service).toBe('Plumber');
      expect(parsed.urgency).toBe('urgent');
      expect(parsed.location.name).toContain('Sitabuldi');
    });
  });
});
