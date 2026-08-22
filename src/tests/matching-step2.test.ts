// Automated Test Suite for LocalConnect Step 2 (Match Scoring + Explainable Recommendations)

import { parseNeedLocally } from '../services/aiParser';
import { calculateMatchScore } from '../services/matching/matchScore';
import { rankCandidates } from '../services/matching/rankProviders';
import { MOCK_PROVIDERS } from '../data/mockProviders';

export async function runStep2Tests() {
  console.log('========================================================================');
  console.log('🎯 Running Step 2: AI Match Scoring & Explainable Recommendations Tests');
  console.log('========================================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, testName: string, actual?: any) {
    if (condition) {
      console.log(`  ✅ PASS: ${testName}`);
      passed++;
    } else {
      console.error(`  ❌ FAIL: ${testName} -> got:`, actual);
      failed++;
    }
  }

  // TEST 1 — Tutor Scenario
  console.log('1. TEST 1 — Class 12 Maths Tutor under ₹500 within 3km on weekends');
  const need1 = parseNeedLocally('I need a maths tutor for class 12 under ₹500 within 3 km on weekends.');
  const mathCandidates = MOCK_PROVIDERS.filter((p) => p.category === 'Education & Tutors');
  const ranked1 = rankCandidates(mathCandidates, need1);

  assert(ranked1.length >= 3, 'Returns all matching math candidates');
  assert(ranked1[0].provider.name === 'Priya Deshmukh', `🥇 Top match is Priya Deshmukh (${ranked1[0].match.matchScore}%)`);
  assert(ranked1[0].match.matchScore >= 94, 'Priya match score is >= 94%');
  assert(ranked1[1].provider.name === 'Rahul Sharma', `🥈 Second match is Rahul Sharma (${ranked1[1].match.matchScore}%)`);
  assert(ranked1[2].provider.name === 'Amit Verma', `🥉 Third match is Amit Verma (${ranked1[2].match.matchScore}%)`);
  assert(ranked1[0].match.explanation.includes('Class 12') || ranked1[0].match.explanation.includes('Mathematics'), 'Priya explanation mentions subject/class');
  assert(ranked1[0].match.explanation.includes('1.8') || ranked1[0].match.explanation.includes('km away'), 'Priya explanation mentions distance');
  assert(ranked1[0].match.explanation.includes('weekends') || ranked1[0].match.explanation.includes('Saturday'), 'Priya explanation mentions availability');

  // TEST 2 — Electrician Scenario
  console.log('\n2. TEST 2 — Electrician near me tomorrow evening');
  const need2 = parseNeedLocally('I need an electrician near me tomorrow evening.');
  const elecCandidates = MOCK_PROVIDERS.filter((p) => p.category === 'Home Maintenance');
  const ranked2 = rankCandidates(elecCandidates, need2);

  assert(ranked2.length > 0, 'Finds electrician candidates');
  assert(ranked2[0].provider.title.toLowerCase().includes('electrician'), 'Top candidate is an electrician');
  assert(need2.date === 'tomorrow', 'Extracted date is tomorrow');
  assert(need2.time === 'evening', 'Extracted time is evening');

  // TEST 3 — Hinglish Laptop Repair
  console.log('\n3. TEST 3 (Hinglish) — bhai 500 ke andar laptop repair wala chahiye');
  const need3 = parseNeedLocally('bhai 500 ke andar laptop repair wala chahiye');
  const laptopCandidates = MOCK_PROVIDERS.filter((p) => p.category === 'Appliance Repair');
  const ranked3 = rankCandidates(laptopCandidates, need3);

  assert(ranked3[0].provider.services.some((s) => s.toLowerCase().includes('laptop')), 'Top match is laptop specialist');
  assert(need3.budget_max === 500, 'Extracted budget_max = 500');
  assert(ranked3[0].match.matchScore >= 80, 'Match score is high for matching repair specialist');

  // TEST 4 — No Budget (Dynamic Normalization)
  console.log('\n4. TEST 4 — No Budget Specified ("I need a good photographer near me")');
  const need4 = parseNeedLocally('I need a good photographer near me.');
  const photoCandidates = MOCK_PROVIDERS.filter((p) => p.category === 'Creative & Tech');
  const ranked4 = rankCandidates(photoCandidates, need4);

  // Check that budget score is NOT penalizing the provider
  const topPhoto = ranked4[0];
  assert(topPhoto.match.matchScore >= 88, `Top photographer has high match score (${topPhoto.match.matchScore}%) without budget penalty`);

  // TEST 5 — Hard Distance Requirement
  console.log('\n5. TEST 5 — Hard Distance Constraint ("Need a plumber within 2 km")');
  const need5 = parseNeedLocally('Need a plumber within 2 km');
  const plumberNear = {
    ...MOCK_PROVIDERS[4], // Imran
    location: { ...MOCK_PROVIDERS[4].location, lat: 21.1442, lng: 79.0700 }, // ~0.8 km
  };
  const plumberFar = {
    ...MOCK_PROVIDERS[4],
    id: 'prov_far',
    name: 'Far Plumber',
    location: { ...MOCK_PROVIDERS[4].location, lat: 21.2200, lng: 79.1500 }, // ~12 km
  };
  const ranked5 = rankCandidates([plumberFar, plumberNear], need5);
  assert(ranked5[0].provider.name === plumberNear.name, 'Plumber ~0.8 km ranks strictly above plumber ~12 km');
  assert(ranked5[0].match.matchScore > ranked5[1].match.matchScore + 20, 'Close plumber has significantly higher score (+20pts)');

  // TEST 6 — No AI (Standard Fallback Search)
  console.log('\n6. TEST 6 — Fallback / Non-AI Search');
  const ranked6 = rankCandidates(mathCandidates, null);
  assert(ranked6.length === mathCandidates.length, 'Returns all candidates without AI parsing');
  assert(ranked6[0].match.matchScore > 0, 'Generates default rating-based score');

  console.log('\n========================================================================');
  console.log(`📊 Step 2 Test Results: ${passed} PASSED, ${failed} FAILED`);
  console.log('========================================================================\n');

  if (failed > 0) {
    throw new Error(`${failed} tests failed!`);
  }
}

runStep2Tests().catch(console.error);
