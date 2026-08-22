// ESM Standalone Test Runner for Node.js

import { NAGPUR_LANDMARKS, calculateDistanceKm, resolveLocationFromQuery, DEFAULT_USER_LOCATION } from '../data/locations.ts';
import { CATEGORIES } from '../data/categories.ts';
import { MOCK_PROVIDERS } from '../data/mockProviders.ts';
import { DEFAULT_RANKING_WEIGHTS } from '../types/ai.ts';
import { LocalDeterministicProvider } from '../services/ai/LocalDeterministicProvider.ts';
import { calculateTrustScore } from '../services/matching/trustEngine.ts';
import { evaluateBudgetScore } from '../services/matching/budgetEngine.ts';
import { evaluateDistanceScore } from '../services/matching/locationEngine.ts';
import { findBestSemanticService } from '../services/ai/semanticOntology.ts';
import { calculateProviderMatchScore, rankProviders } from '../services/matching/matchingEngine.ts';

async function main() {
  console.log('====================================================');
  console.log('🚀 Running LocalConnect AI Intelligence Layer Tests');
  console.log('====================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(condition, testName) {
    if (condition) {
      console.log(`  ✅ PASS: ${testName}`);
      passed++;
    } else {
      console.error(`  ❌ FAIL: ${testName}`);
      failed++;
    }
  }

  const parser = new LocalDeterministicProvider();

  // Test 1: Intent Parsing English
  console.log('1. Testing Natural Language Intent Parsing...');
  const res1 = await parser.parseRequirement('I need a tutor for class 10 maths under 500');
  assert(res1.category.includes('Education'), 'Extracts category: Education & Tutors');
  assert(res1.service === 'Maths Tutor', 'Extracts service: Maths Tutor');
  assert(res1.level_or_type === 'Class 10', 'Extracts level: Class 10');
  assert(res1.budget.max === 500, 'Extracts budget.max: 500');

  // Test 2: Location & Radius
  console.log('\n2. Testing Location & Radius Parsing...');
  const res2 = await parser.parseRequirement('Need an electrician within 3 km in Dharampeth');
  assert(res2.service === 'Electrician', 'Extracts service: Electrician');
  assert(res2.location.radius_km === 3, 'Extracts radius_km: 3');
  assert(res2.location.name.includes('Dharampeth'), 'Resolves location: Dharampeth');

  // Test 3: Hinglish Parsing
  console.log('\n3. Testing Hinglish Parsing...');
  const res3 = await parser.parseRequirement('500 ke andar koi electrician chahiye');
  assert(res3.language_detected === 'hinglish', 'Detects language: hinglish');
  assert(res3.service === 'Electrician', 'Extracts service: Electrician from Hinglish');
  assert(res3.budget.max === 500, 'Extracts budget.max: 500 from "500 ke andar"');

  // Test 4: Hackathon Scenario (Priya > Rahul > Amit)
  console.log('\n4. Testing Multi-Factor Weighted Ranking (Hackathon Demo Flow)...');
  const req4 = await parser.parseRequirement(
    'I need a maths tutor for my 12th-standard brother, weekends, within 3 km, budget ₹500.'
  );
  const mathProviders = MOCK_PROVIDERS.filter((p) => p.category === 'Education & Tutors');
  const ranked = await rankProviders(req4, mathProviders, DEFAULT_RANKING_WEIGHTS);

  assert(ranked.length >= 3, 'Ranks at least 3 matching math providers');
  assert(ranked[0].provider.name === 'Priya Deshmukh', `Top match is Priya Deshmukh (${ranked[0].match.match_score}%)`);
  assert(ranked[0].match.match_score >= 94, 'Priya match score is >= 94%');
  assert(ranked[1].provider.name === 'Rahul Sharma', `Second match is Rahul Sharma (${ranked[1].match.match_score}%)`);
  assert(ranked[2].provider.name === 'Amit Verma', `Third match is Amit Verma (${ranked[2].match.match_score}%)`);

  // Test 5: Semantic Matching (AC cooling -> AC repair)
  console.log('\n5. Testing Semantic Matching...');
  const sem1 = findBestSemanticService("AC isn't cooling");
  assert(sem1.serviceId === 'ac_technician', '"AC isn\'t cooling" semantically matches AC Repair & Service');

  const sem2 = findBestSemanticService('teach coding to my kid');
  assert(sem2.serviceId === 'coding_instructor', '"teach coding to my kid" semantically matches Coding Tutor');

  // Test 6: Trust Score Calculation
  console.log('\n6. Testing Verifiable Trust Engine...');
  const trustRes = calculateTrustScore(MOCK_PROVIDERS[0].trust_signals);
  assert(trustRes.totalScore >= 95, `Priya trust score is ${trustRes.totalScore}/100`);
  assert(trustRes.identity_points === 25, 'Identity verification points: 25/25');
  assert(trustRes.badges.includes('Identity Verified'), 'Includes badge: Identity Verified');

  // Test 7: Offline Fallback Resilience
  console.log('\n7. Testing Fallback Resilience...');
  const isAvail = await parser.isAvailable();
  assert(isAvail === true, 'Deterministic parser is always available offline');

  console.log('\n====================================================');
  console.log(`📊 Test Results: ${passed} PASSED, ${failed} FAILED`);
  console.log('====================================================\n');
}

main().catch(console.error);
