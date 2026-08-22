// Automated Standalone Test Runner for Step 3: Conversational Search Refinement
// Run with: node src/tests/test-runner-step3.mjs

const NAGPUR_LANDMARKS = [
  { name: 'Dharampeth', area: 'Dharampeth', city: 'Nagpur', lat: 21.1442, lng: 79.0620, aliases: ['dharampeth', 'dharampet', 'west nagpur', 'coffee house square', 'shankar nagar'] },
  { name: 'Sitabuldi', area: 'Sitabuldi', city: 'Nagpur', lat: 21.1458, lng: 79.0832, aliases: ['sitabuldi', 'burdi', 'buldi', 'main market', 'variety square'] },
  { name: 'Ramdaspeth', area: 'Ramdaspeth', city: 'Nagpur', lat: 21.1352, lng: 79.0718, aliases: ['ramdaspeth', 'ramdas peth', 'central bazar road', 'lokmat square'] },
  { name: 'Civil Lines', area: 'Civil Lines', city: 'Nagpur', lat: 21.1560, lng: 79.0680, aliases: ['civil lines', 'vca stadium', 'high court', 'ladies club'] },
];

function calculateDistanceKm(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10;
}

function resolveLocation(query) {
  const lower = query.toLowerCase();
  for (const l of NAGPUR_LANDMARKS) {
    if (l.aliases.some((a) => lower.includes(a))) return l;
  }
  return NAGPUR_LANDMARKS[0];
}

const MOCK_PROVIDERS = [
  {
    id: 'prov_math_01',
    name: 'Priya Deshmukh',
    title: 'Senior Mathematics Educator (Class 11–12 & Boards)',
    category: 'Education & Tutors',
    services: ['Class 12 Mathematics', 'Class 11 Mathematics', 'CBSE Board Prep'],
    skills: ['Class 11-12 Maths', 'Calculus', 'Algebra', 'CBSE Syllabus'],
    pricing: { base_rate: 450, currency: 'INR', unit: 'session', display_string: '₹450 / session' },
    location: { name: 'Dharampeth, Nagpur', area: 'Dharampeth', lat: 21.1430, lng: 79.0590 },
    availability: { days: ['Saturday', 'Sunday'], time_slots: ['morning', 'evening'], is_available_today: true, is_available_weekend: true },
    trust_signals: { identity_verified: true, completed_jobs_count: 47, average_rating: 4.9, review_count: 42, response_rate_percent: 98, cancellation_rate_percent: 1 },
    trust_breakdown: { total_score: 96 },
  },
  {
    id: 'prov_math_02',
    name: 'Rahul Sharma',
    title: 'Class 10–12 Mathematics & JEE Foundation Tutor',
    category: 'Education & Tutors',
    services: ['Class 12 Mathematics', 'Class 11 Mathematics', 'Class 10 Maths'],
    skills: ['Class 11-12 Maths', 'Coordinate Geometry', 'CBSE Board'],
    pricing: { base_rate: 500, currency: 'INR', unit: 'session', display_string: '₹500 / session' },
    location: { name: 'Ramdaspeth, Nagpur', area: 'Ramdaspeth', lat: 21.1370, lng: 79.0740 },
    availability: { days: ['Saturday'], time_slots: ['morning', 'evening'], is_available_today: true, is_available_weekend: true },
    trust_signals: { identity_verified: true, completed_jobs_count: 36, average_rating: 4.8, review_count: 36, response_rate_percent: 94, cancellation_rate_percent: 3 },
    trust_breakdown: { total_score: 91 },
  },
  {
    id: 'prov_math_03',
    name: 'Amit Verma',
    title: 'Secondary & Higher Secondary Maths Teacher',
    category: 'Education & Tutors',
    services: ['Class 10 Maths', 'Class 11 Mathematics'],
    skills: ['Class 10 Maths', 'Class 11 Maths', 'Algebra', 'State Board'],
    pricing: { base_rate: 400, currency: 'INR', unit: 'session', display_string: '₹400 / session' },
    location: { name: 'Sitabuldi, Nagpur', area: 'Sitabuldi', lat: 21.1470, lng: 79.0810 },
    availability: { days: ['Sunday', 'Tuesday', 'Thursday'], time_slots: ['evening'], is_available_today: false, is_available_weekend: true },
    trust_signals: { identity_verified: true, completed_jobs_count: 22, average_rating: 4.6, review_count: 19, response_rate_percent: 88, cancellation_rate_percent: 4 },
    trust_breakdown: { total_score: 84 },
  },
  {
    id: 'prov_elec_01',
    name: 'Rajesh Kolhe',
    title: 'Certified Master Electrician & Emergency Wireman',
    category: 'Home Maintenance',
    services: ['Short Circuit Repair', 'Switchboard Repair', 'Inverter Installation'],
    skills: ['Emergency Electrical', 'Short Circuit', 'Wiring Diagnostics'],
    pricing: { base_rate: 300, currency: 'INR', unit: 'job', display_string: '₹300 / visit' },
    location: { name: 'Dharampeth, Nagpur', area: 'Dharampeth', lat: 21.1415, lng: 79.0630 },
    availability: { days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'], time_slots: ['flexible'], is_available_today: true, is_available_weekend: true, emergency_service: true },
    trust_signals: { identity_verified: true, completed_jobs_count: 68, average_rating: 4.9, review_count: 59, response_rate_percent: 99, cancellation_rate_percent: 0 },
    trust_breakdown: { total_score: 98 },
  },
  {
    id: 'prov_ac_01',
    name: 'Imran Sheikh',
    title: 'HVAC & Split AC Specialist (Cooling & PCB Expert)',
    category: 'Appliance Repair',
    services: ['AC Repair & Service', 'Split AC Gas Charging', 'Laptop Repair & Maintenance'],
    skills: ['AC Repair', 'Gas Leakage Detection', 'Laptop Repair'],
    pricing: { base_rate: 500, currency: 'INR', unit: 'job', display_string: '₹500 / service' },
    location: { name: 'Ramdaspeth, Nagpur', area: 'Ramdaspeth', lat: 21.1380, lng: 79.0690 },
    availability: { days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'], time_slots: ['morning', 'afternoon', 'evening'], is_available_today: true, is_available_weekend: true },
    trust_signals: { identity_verified: true, completed_jobs_count: 52, average_rating: 4.8, review_count: 48, response_rate_percent: 95, cancellation_rate_percent: 2 },
    trust_breakdown: { total_score: 93 },
  },
  {
    id: 'prov_photo_01',
    name: 'Sneha Kulkarni',
    title: 'Candid Wedding, Pre-Wedding & Portrait Photographer',
    category: 'Creative & Tech',
    services: ['Wedding Photography', 'Pre-Wedding Shoot', 'Candid Event Coverage'],
    skills: ['Candid Wedding', 'Sony Alpha Master', 'Natural Light Portraits'],
    pricing: { base_rate: 12000, currency: 'INR', unit: 'job', display_string: '₹12,000 / day event' },
    location: { name: 'Civil Lines, Nagpur', area: 'Civil Lines', lat: 21.1550, lng: 79.0710 },
    availability: { days: ['Friday', 'Saturday', 'Sunday', 'Monday'], time_slots: ['flexible'], is_available_today: true, is_available_weekend: true },
    trust_signals: { identity_verified: true, completed_jobs_count: 28, average_rating: 4.9, review_count: 26, response_rate_percent: 92, cancellation_rate_percent: 0 },
    trust_breakdown: { total_score: 94 },
  },
];

// Step 1 Initial Parser
function parseNeedLocally(query) {
  const lower = query.toLowerCase();
  let category = 'general';
  let service = 'general service';
  let level;

  if (lower.includes('math') || lower.includes('ganit') || lower.includes('tutor')) {
    category = 'Education & Tutors';
    service = 'Maths Tutor';
  } else if (lower.includes('electric') || lower.includes('bijli')) {
    category = 'Home Maintenance';
    service = 'Electrician';
  } else if (lower.includes('laptop')) {
    category = 'Appliance Repair';
    service = 'Laptop Repair';
  } else if (lower.includes('photo')) {
    category = 'Creative & Tech';
    service = 'Photographer';
  } else if (lower.includes('plumb')) {
    category = 'Home Maintenance';
    service = 'Plumber';
  }

  if (lower.includes('class 12') || lower.includes('12th')) level = 'class 12';
  else if (lower.includes('class 10') || lower.includes('10th')) level = 'class 10';

  let budgetMax;
  const kMatch = query.match(/(\d+)\s*k\b/i);
  if (kMatch) {
    budgetMax = parseInt(kMatch[1], 10) * 1000;
  } else {
    const single = query.match(/(?:under|less than|around|approx|upto|max|budget|around ₹|₹|rs\.?|inr|ke andar)\s*(\d{2,6})/i) ||
                  query.match(/(\d{2,6})\s*(?:₹|rs|rupees|inr|ke andar)/i);
    if (single) budgetMax = parseInt(single[1], 10);
  }

  let radiusKm;
  const radMatch = query.match(/(\d+)\s*(?:km|k\.m\.|kilometer|kms)/i);
  if (radMatch) radiusKm = parseInt(radMatch[1], 10);
  else if (lower.includes('near me') || lower.includes('paas')) radiusKm = 5;

  const days = [];
  if (lower.includes('weekend') || lower.includes('saturday') || lower.includes('sunday')) {
    if (lower.includes('saturday')) days.push('Saturday');
    if (lower.includes('sunday')) days.push('Sunday');
    if (days.length === 0) days.push('Saturday', 'Sunday');
  }

  let date;
  if (lower.includes('tomorrow') || lower.includes('kal')) date = 'tomorrow';
  else if (lower.includes('today') || lower.includes('aaj')) date = 'today';

  let time;
  if (lower.includes('evening') || lower.includes('shaam')) time = 'evening';
  else if (lower.includes('morning') || lower.includes('subah')) time = 'morning';

  return {
    raw_query: query,
    category,
    service,
    level,
    budget_max: budgetMax,
    radius_km: radiusKm,
    date,
    time,
    availability: days.length > 0 ? { days } : undefined,
  };
}

// Step 3 Refinement Delta Extractor & Deterministic Merge Layer
function extractRefinementDeltaLocally(current, input) {
  const query = input.trim();
  const lower = query.toLowerCase();
  const changes = {};
  const removed = [];
  let reason = 'User refined search criteria';

  // 1. Removals
  if (
    lower.includes("budget doesn't matter") ||
    lower.includes('no budget limit') ||
    lower.includes('budget does not matter') ||
    lower.includes('budget ki koi dikkat nahi') ||
    lower.includes('any budget') ||
    lower.includes('ignore budget')
  ) {
    removed.push('budget_max', 'budget_min');
    reason = 'Removed budget constraint';
  }

  if (
    lower.includes('any day') ||
    lower.includes('anytime') ||
    lower.includes('any day is fine') ||
    lower.includes('no day preference')
  ) {
    removed.push('availability', 'date', 'time');
    reason = 'Removed schedule constraint';
  }

  // 2. Budget Changes
  if (!removed.includes('budget_max')) {
    const kMatch = query.match(/(\d+)\s*k\b/i);
    const numMatch =
      query.match(/(?:₹|rs\.?|inr|under|upto|max|budget|make it|around|ke andar)\s*(\d{2,6})/i) ||
      query.match(/(\d{2,6})\s*(?:₹|rs|rupees|inr|ke andar)/i);

    if (kMatch) {
      changes.budget_max = parseInt(kMatch[1], 10) * 1000;
      reason = `Updated maximum budget to ₹${changes.budget_max}`;
    } else if (numMatch) {
      changes.budget_max = parseInt(numMatch[1], 10);
      reason = `Updated maximum budget to ₹${changes.budget_max}`;
    } else if (lower.includes('cheaper') || lower.includes('sasta') || lower.includes('lower price')) {
      if (current.budget_max) {
        changes.budget_max = Math.max(300, current.budget_max - 100);
      } else {
        changes.budget_max = 450;
      }
      reason = 'Adjusted preference for more affordable rates';
    }
  }

  // 3. Schedule & Availability
  if (!removed.includes('availability')) {
    const days = [];
    if (lower.includes('sunday')) days.push('Sunday');
    if (lower.includes('saturday')) days.push('Saturday');
    if (lower.includes('weekend') && days.length === 0) days.push('Saturday', 'Sunday');

    if (days.length > 0) {
      changes.availability = { days };
      reason = `Set availability requirement to ${days.join(' & ')}`;
    }
  }

  // 4. Distance & Radius
  if (!removed.includes('radius_km')) {
    const radiusMatch = query.match(/(\d+)\s*(?:km|k\.m\.|kilometer|kms)/i);
    if (radiusMatch) {
      changes.radius_km = parseInt(radiusMatch[1], 10);
      reason = `Set search radius to ${changes.radius_km} km`;
    }
  }

  // 5. Service & Level Context
  if (lower.includes('wedding')) {
    changes.level = 'wedding';
    changes.service = 'wedding photographer';
    changes.category = 'creative & tech';
    reason = 'Refined service to Wedding Photography';
  } else if (lower.includes('12th') || lower.includes('class 12')) {
    changes.level = 'class 12';
    reason = 'Added Class 12 requirement';
  }

  return {
    action: 'update_search',
    changes,
    removed: removed.length > 0 ? removed : undefined,
    reason,
  };
}

function mergeRequirements(current, delta) {
  const updated = { ...current };

  if (delta.removed && delta.removed.length > 0) {
    for (const key of delta.removed) {
      delete updated[key];
    }
  }

  if (delta.changes) {
    for (const [key, value] of Object.entries(delta.changes)) {
      if (value !== undefined) {
        updated[key] = value;
      }
    }
  }

  updated.raw_query = `${current.raw_query} → [Refined: ${delta.reason || 'Criteria updated'}]`;
  return updated;
}

// Step 2 Matching Engine (0 - 100)
function calculateMatchScore(provider, need) {
  const hasBudgetConstraint = need.budget_max !== undefined && need.budget_max > 0;
  const hasAvailabilityConstraint = Boolean(need.availability?.days?.length || need.date || need.time);
  const hasDistanceConstraint = Boolean(need.radius_km);
  const hasLevelConstraint = Boolean(need.level);

  // Service Relevance (30%)
  const pServices = provider.services.join(' ').toLowerCase();
  const pTitle = provider.title.toLowerCase();
  const reqService = (need.service || '').toLowerCase();
  let serviceScore = 80;

  if (pServices.includes(reqService) || pTitle.includes(reqService) ||
      (reqService.includes('math') && (pServices.includes('math') || pTitle.includes('math'))) ||
      (reqService.includes('electric') && (pServices.includes('electric') || pTitle.includes('electric'))) ||
      (reqService.includes('laptop') && (pServices.includes('laptop') || pTitle.includes('laptop'))) ||
      (reqService.includes('photo') && (pServices.includes('photo') || pTitle.includes('photo')))) {
    serviceScore = 100;
  } else {
    serviceScore = 40;
  }

  // Level Match (20%)
  let reqScore = 90;
  if (hasLevelConstraint && need.level) {
    const lvl = need.level.toLowerCase();
    if (pTitle.includes(lvl) || pServices.includes(lvl)) {
      reqScore = 100;
    } else {
      reqScore = 50;
    }
  }

  // Distance (15%)
  const userLoc = resolveLocation(need.raw_query || '');
  const distanceKm = calculateDistanceKm(userLoc.lat, userLoc.lng, provider.location.lat, provider.location.lng);
  const radiusKm = need.radius_km || 5;
  const isWithinRadius = distanceKm <= radiusKm;

  let distanceScore = 100;
  if (distanceKm <= 1.5) distanceScore = 100;
  else if (distanceKm <= radiusKm) distanceScore = Math.round(100 - ((distanceKm - 1.5) / Math.max(1, radiusKm - 1.5)) * 20);
  else {
    const overageKm = distanceKm - radiusKm;
    distanceScore = Math.max(0, Math.round(45 - overageKm * 8));
  }

  // Availability (10%)
  let availabilityScore = 85;
  if (hasAvailabilityConstraint) {
    if (need.availability?.days && need.availability.days.length > 0) {
      const matchCount = need.availability.days.filter((d) => provider.availability.days.includes(d)).length;
      if (matchCount === need.availability.days.length) {
        availabilityScore = 100;
      } else if (matchCount > 0) {
        availabilityScore = 75;
      } else {
        availabilityScore = 30;
      }
    }
  }

  // Budget (10%)
  let budgetScore = 90;
  let isWithinBudget = true;
  if (hasBudgetConstraint && need.budget_max) {
    const rate = provider.pricing.base_rate;
    if (rate <= need.budget_max) {
      const savings = (need.budget_max - rate) / need.budget_max;
      budgetScore = Math.min(100, Math.round(95 + savings * 5));
    } else {
      isWithinBudget = false;
      const over = ((rate - need.budget_max) / need.budget_max) * 100;
      if (over <= 15) budgetScore = 70;
      else if (over <= 30) budgetScore = 50;
      else budgetScore = Math.max(10, Math.round(40 - over));
    }
  }

  // Trust (10%)
  const trustScore = provider.trust_breakdown?.total_score || Math.round(provider.trust_signals.average_rating * 19);

  // Reliability (5%)
  const reliabilityScore = Math.round(
    provider.trust_signals.response_rate_percent * 0.7 +
    (100 - provider.trust_signals.cancellation_rate_percent * 10) * 0.3
  );

  const breakdown = {
    service: serviceScore,
    requirements: reqScore,
    distance: distanceScore,
    availability: availabilityScore,
    budget: budgetScore,
    trust: trustScore,
    reliability: reliabilityScore,
  };

  // Dynamic Normalization
  let weights = {
    service: 0.30,
    requirements: 0.20,
    distance: 0.15,
    availability: hasAvailabilityConstraint ? 0.10 : 0,
    budget: hasBudgetConstraint ? 0.10 : 0,
    trust: 0.10,
    reliability: 0.05,
  };

  const sum = Object.values(weights).reduce((a, b) => a + b, 0);
  for (const k in weights) {
    weights[k] = weights[k] / sum;
  }

  let rawScore =
    breakdown.service * weights.service +
    breakdown.requirements * weights.requirements +
    breakdown.distance * weights.distance +
    breakdown.availability * weights.availability +
    breakdown.budget * weights.budget +
    breakdown.trust * weights.trust +
    breakdown.reliability * weights.reliability;

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

  const matchScore = Math.min(100, Math.max(10, Math.round(rawScore - hardPenalty)));

  return {
    providerId: provider.id,
    matchScore,
    breakdown,
    distanceKm,
  };
}

function rankCandidates(candidates, parsedNeed) {
  if (!candidates || candidates.length === 0) return [];
  const scored = candidates.map((provider) => ({
    provider,
    match: calculateMatchScore(provider, parsedNeed),
  }));
  scored.sort((a, b) => b.match.matchScore - a.match.matchScore);
  return scored;
}

// STEP 3 TEST SUITE
async function runStep3Tests() {
  console.log('========================================================================');
  console.log('🎯 Running Step 3: Conversational Search Refinement Tests');
  console.log('========================================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(condition, name, details = '') {
    if (condition) {
      console.log(`  ✅ PASS: ${name} ${details}`);
      passed++;
    } else {
      console.error(`  ❌ FAIL: ${name} ${details}`);
      failed++;
    }
  }

  // TEST 1 — Addition / Filter
  console.log('1. TEST 1 — Initial: Maths tutor for class 12 → Refinement: under ₹500');
  const init1 = parseNeedLocally('Maths tutor for class 12');
  const delta1 = extractRefinementDeltaLocally(init1, 'under ₹500');
  const updated1 = mergeRequirements(init1, delta1);

  assert(updated1.service === 'Maths Tutor', 'Preserves original service: Maths Tutor');
  assert(updated1.level === 'class 12', 'Preserves original level: class 12');
  assert(updated1.budget_max === 500, 'Correctly adds budget_max = 500');

  // TEST 2 — Availability Refinement & Score Recalculation
  console.log('\n2. TEST 2 — Initial: Maths tutor under ₹500 → Refinement: Sunday only');
  const init2 = parseNeedLocally('Maths tutor under ₹500');
  const delta2 = extractRefinementDeltaLocally(init2, 'Sunday only');
  const updated2 = mergeRequirements(init2, delta2);

  assert(updated2.availability?.days?.includes('Sunday'), 'Sets availability to Sunday');
  assert(updated2.budget_max === 500, 'Preserves budget_max = 500');

  // Verify match scores update after refinement
  const mathCandidates = MOCK_PROVIDERS.filter((p) => p.category === 'Education & Tutors');
  const rankedInit = rankCandidates(mathCandidates, init2);
  const rankedRefined = rankCandidates(mathCandidates, updated2);

  // Priya (Sunday available) vs Rahul (Saturday only)
  const rahulBefore = rankedInit.find((r) => r.provider.name === 'Rahul Sharma');
  const rahulAfter = rankedRefined.find((r) => r.provider.name === 'Rahul Sharma');
  assert(rahulAfter.match.matchScore < rahulBefore.match.matchScore, 'Rahul (Saturday only) match score drops when user requests Sunday only');

  // TEST 3 — Contextual Refinement (Pronoun / Modifier)
  console.log('\n3. TEST 3 — Initial: Photographer near me → Refinement: Actually wedding photographer');
  const init3 = parseNeedLocally('Photographer near me');
  const delta3 = extractRefinementDeltaLocally(init3, 'Actually wedding photographer');
  const updated3 = mergeRequirements(init3, delta3);

  assert(updated3.service === 'wedding photographer', 'Refines service to wedding photographer');
  assert(updated3.level === 'wedding', 'Sets level to wedding');

  // TEST 4 — Override / Change
  console.log('\n4. TEST 4 — Initial: Electrician within 5 km → Refinement: make it 2 km');
  const init4 = parseNeedLocally('Electrician within 5 km');
  assert(init4.radius_km === 5, 'Initial radius_km is 5');
  const delta4 = extractRefinementDeltaLocally(init4, 'make it 2 km');
  const updated4 = mergeRequirements(init4, delta4);

  assert(updated4.radius_km === 2, 'Updates radius_km to 2');
  assert(updated4.service === 'Electrician', 'Preserves service: Electrician');

  // TEST 5 — Removal ("Budget doesn't matter")
  console.log('\n5. TEST 5 — Initial: Laptop repair under ₹1000 → Refinement: budget doesn\'t matter');
  const init5 = parseNeedLocally('Laptop repair under ₹1000');
  assert(init5.budget_max === 1000, 'Initial budget_max is 1000');
  const delta5 = extractRefinementDeltaLocally(init5, "budget doesn't matter");
  const updated5 = mergeRequirements(init5, delta5);

  assert(updated5.budget_max === undefined, 'Budget constraint successfully removed');
  assert(updated5.service === 'Laptop Repair', 'Preserves service: Laptop Repair');

  // TEST 6 — Hinglish Refinement
  console.log('\n6. TEST 6 (Hinglish) — Initial: Maths tutor → Refinement: bhai Sunday ko available hona chahiye');
  const init6 = parseNeedLocally('bhai ek maths tutor chahiye');
  const delta6 = extractRefinementDeltaLocally(init6, 'bhai Sunday ko available hona chahiye');
  const updated6 = mergeRequirements(init6, delta6);

  assert(updated6.availability?.days?.includes('Sunday'), 'Extracts Sunday availability from Hinglish');
  assert(updated6.service === 'Maths Tutor', 'Preserves service: Maths Tutor');

  // TEST 7 — Offline Fallback / AI API Disabled
  console.log('\n7. TEST 7 — Fallback & Resilience (No AI API)');
  const dummyQuery = 'Under 400';
  const deltaOffline = extractRefinementDeltaLocally(init1, dummyQuery);
  const updatedOffline = mergeRequirements(init1, deltaOffline);

  assert(updatedOffline.budget_max === 400, 'Offline deterministic refinement succeeds without API');
  assert(updatedOffline.service === 'Maths Tutor', 'Existing search requirements are never destroyed');

  console.log('\n========================================================================');
  console.log(`📊 Step 3 Test Results: ${passed} PASSED, ${failed} FAILED`);
  console.log('========================================================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runStep3Tests();
