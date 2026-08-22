// Automated Standalone Test Runner for Step 2: AI Match Scoring & Explainable Recommendations
// Run with: node src/tests/test-runner-step2.mjs

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
    services: ['Short Circuit Repair', 'Switchboard Repair', 'Inverter Installation', 'Emergency Electrical'],
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
    services: ['AC Repair & Service', 'Split AC Gas Charging', 'Jet Pump AC Cleaning', 'Laptop Repair & Maintenance'],
    skills: ['AC Repair', 'Gas Leakage Detection', 'Hardware Diagnostics', 'Laptop Repair'],
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

// Parser (Deterministic Step 1 NLP)
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

// Matching & Scoring Engine (0 - 100)
function calculateMatchScore(provider, need) {
  const matchedRequirements = [];
  const unmatchedRequirements = [];

  const hasBudgetConstraint = need.budget_max !== undefined && need.budget_max > 0;
  const hasAvailabilityConstraint = Boolean(need.availability?.days?.length || need.date || need.time);
  const hasDistanceConstraint = Boolean(need.radius_km);
  const hasLevelConstraint = Boolean(need.level);

  // 1. Service Relevance (30%)
  const pServices = provider.services.join(' ').toLowerCase();
  const pTitle = provider.title.toLowerCase();
  const reqService = (need.service || '').toLowerCase();
  let serviceScore = 80;

  if (pServices.includes(reqService) || pTitle.includes(reqService) ||
      (reqService.includes('math') && (pServices.includes('math') || pTitle.includes('math'))) ||
      (reqService.includes('electric') && (pServices.includes('electric') || pTitle.includes('electric'))) ||
      (reqService.includes('laptop') && (pServices.includes('laptop') || pTitle.includes('laptop'))) ||
      (reqService.includes('photo') && (pServices.includes('photo') || pTitle.includes('photo'))) ||
      (reqService.includes('plumb') && (pServices.includes('plumb') || pTitle.includes('plumb')))) {
    serviceScore = 100;
    matchedRequirements.push(need.service || provider.title);
  } else {
    serviceScore = 40;
    unmatchedRequirements.push(need.service);
  }

  // 2. Requirement / Semantic Match (20%) (Level)
  let reqScore = 90;
  if (hasLevelConstraint && need.level) {
    const lvl = need.level.toLowerCase();
    if (pTitle.includes(lvl) || pServices.includes(lvl)) {
      reqScore = 100;
      matchedRequirements.push(`Level: ${need.level.toUpperCase()}`);
    } else {
      reqScore = 50;
      unmatchedRequirements.push(`Level: ${need.level.toUpperCase()}`);
    }
  }

  // 3. Distance (15%)
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

  if (isWithinRadius) matchedRequirements.push(`Within ${distanceKm.toFixed(1)} km`);
  else if (hasDistanceConstraint) unmatchedRequirements.push(`${distanceKm.toFixed(1)} km (outside radius)`);

  // 4. Availability (10%)
  let availabilityScore = 85;
  let isAvailabilityMatched = true;
  if (hasAvailabilityConstraint) {
    if (need.availability?.days && need.availability.days.length > 0) {
      const matchCount = need.availability.days.filter((d) => provider.availability.days.includes(d)).length;
      if (matchCount === need.availability.days.length) {
        availabilityScore = 100;
        matchedRequirements.push(`Available ${need.availability.days.join(' & ')}`);
      } else if (matchCount > 0) {
        availabilityScore = 75;
        matchedRequirements.push(`Partial availability`);
      } else {
        availabilityScore = 30;
        isAvailabilityMatched = false;
        unmatchedRequirements.push(`Not available on ${need.availability.days.join(' & ')}`);
      }
    } else if (need.date === 'today' && provider.availability.is_available_today) {
      availabilityScore = 100;
      matchedRequirements.push('Available today');
    } else if (need.date === 'tomorrow') {
      availabilityScore = 95;
      matchedRequirements.push('Available tomorrow');
    }
  }

  // 5. Budget (10%)
  let budgetScore = 90;
  let isWithinBudget = true;
  if (hasBudgetConstraint && need.budget_max) {
    const rate = provider.pricing.base_rate;
    if (rate <= need.budget_max) {
      const savings = (need.budget_max - rate) / need.budget_max;
      budgetScore = Math.min(100, Math.round(95 + savings * 5));
      matchedRequirements.push(`Budget fit: ₹${rate}`);
    } else {
      isWithinBudget = false;
      const over = ((rate - need.budget_max) / need.budget_max) * 100;
      if (over <= 15) budgetScore = 70;
      else if (over <= 30) budgetScore = 50;
      else budgetScore = Math.max(10, Math.round(40 - over));
      unmatchedRequirements.push(`₹${rate} (exceeds ₹${need.budget_max})`);
    }
  }

  // 6. Trust (10%)
  const trustScore = provider.trust_breakdown?.total_score || Math.round(provider.trust_signals.average_rating * 19);

  // 7. Reliability (5%)
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

  // DYNAMIC NORMALIZATION
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

  // Generate Explanation
  const points = [];
  const formattedLevel = need.level ? need.level.replace(/\b\w/g, (c) => c.toUpperCase()) : '';
  const formattedService = need.service ? need.service.replace(/\b\w/g, (c) => c.toUpperCase()) : '';

  if (need.level && (provider.title.toLowerCase().includes(need.level.toLowerCase()) || provider.services.some(s => s.toLowerCase().includes(need.level.toLowerCase())))) {
    points.push(`teaches ${formattedLevel} ${formattedService || 'Mathematics'}`);
  } else if (need.service && provider.services.some(s => s.toLowerCase().includes(need.service.toLowerCase()))) {
    points.push(`offers ${formattedService || need.service}`);
  } else {
    points.push(`specializes in ${provider.title}`);
  }

  if (distanceKm > 0) points.push(`is ${distanceKm.toFixed(1)} km away${isWithinRadius ? '' : ' (outside requested radius)'}`);
  if (need.budget_max && need.budget_max > 0) {
    if (isWithinBudget) points.push(`fits your ₹${need.budget_max} budget (${provider.pricing.display_string})`);
    else points.push(`charges ${provider.pricing.display_string}`);
  } else if (provider.pricing) {
    points.push(`charges ${provider.pricing.display_string}`);
  }

  if (need.availability?.days && need.availability.days.length > 0) {
    if (isAvailabilityMatched) {
      const isWeekend = need.availability.days.includes('Saturday') && need.availability.days.includes('Sunday');
      points.push(isWeekend ? 'is available on weekends' : `is available on ${need.availability.days.join(' & ')}`);
    }
  } else if (provider.availability.is_available_weekend) {
    points.push('is available on weekends');
  }

  if (provider.trust_signals.identity_verified && provider.trust_signals.average_rating >= 4.7) {
    points.push(`has a ${provider.trust_signals.average_rating}★ verified rating`);
  }

  const subjectRole =
    provider.category.toLowerCase().includes('education') || provider.title.toLowerCase().includes('tutor')
      ? 'this tutor'
      : provider.category.toLowerCase().includes('appliance') || provider.title.toLowerCase().includes('electrician')
      ? 'this technician'
      : 'this professional';

  const explanation =
    points.length === 1
      ? `Strong match because ${subjectRole} ${points[0]}.`
      : `Strong match because ${subjectRole} ${points.slice(0, -1).join(', ')}, and ${points[points.length - 1]}.`;

  return {
    providerId: provider.id,
    matchScore,
    breakdown,
    matchedRequirements,
    unmatchedRequirements,
    explanation,
    distanceKm,
  };
}

function rankCandidates(candidates, parsedNeed) {
  if (!candidates || candidates.length === 0) return [];
  if (!parsedNeed || !parsedNeed.service) {
    return candidates
      .sort((a, b) => b.trust_signals.average_rating - a.trust_signals.average_rating)
      .map((provider) => ({
        provider,
        match: {
          providerId: provider.id,
          matchScore: Math.round(provider.trust_signals.average_rating * 19),
          breakdown: { service: 90, requirements: 85, distance: 85, availability: 80, budget: 85, trust: 90, reliability: 90 },
          matchedRequirements: [provider.title, `${provider.trust_signals.average_rating}★ Rating`],
          unmatchedRequirements: [],
          explanation: `Top-rated provider for ${provider.category}.`,
          distanceKm: 2.0,
        },
      }));
  }

  const scored = candidates.map((provider) => ({
    provider,
    match: calculateMatchScore(provider, parsedNeed),
  }));

  scored.sort((a, b) => b.match.matchScore - a.match.matchScore);
  return scored;
}

// TEST SUITE
async function runTests() {
  console.log('========================================================================');
  console.log('🎯 Running Step 2: AI Match Scoring & Explainable Recommendations Tests');
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

  // TEST 1 — Tutor Scenario
  console.log('1. TEST 1 — Class 12 Maths Tutor under ₹500 within 3km on weekends');
  const need1 = parseNeedLocally('I need a maths tutor for class 12 under ₹500 within 3 km on weekends.');
  const mathCandidates = MOCK_PROVIDERS.filter((p) => p.category === 'Education & Tutors');
  const ranked1 = rankCandidates(mathCandidates, need1);

  assert(ranked1.length >= 3, 'Returns all matching math candidates');
  assert(ranked1[0].provider.name === 'Priya Deshmukh', '🥇 Top match is Priya Deshmukh', `(Score: ${ranked1[0].match.matchScore}%)`);
  assert(ranked1[0].match.matchScore >= 94, 'Priya match score is >= 94%');
  assert(ranked1[1].provider.name === 'Rahul Sharma', '🥈 Second match is Rahul Sharma', `(Score: ${ranked1[1].match.matchScore}%)`);
  assert(ranked1[2].provider.name === 'Amit Verma', '🥉 Third match is Amit Verma', `(Score: ${ranked1[2].match.matchScore}%)`);
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

  const topPhoto = ranked4[0];
  assert(topPhoto.match.matchScore >= 88, `Top photographer has high match score (${topPhoto.match.matchScore}%) without budget penalty`);

  // TEST 5 — Hard Distance Requirement
  console.log('\n5. TEST 5 — Hard Distance Constraint ("Need a plumber within 2 km")');
  const need5 = parseNeedLocally('Need a plumber within 2 km');
  const plumberNear = {
    ...MOCK_PROVIDERS[4],
    name: 'Near Plumber',
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

  // TEST 6 — Fallback / Non-AI Search
  console.log('\n6. TEST 6 — Fallback / Non-AI Search');
  const ranked6 = rankCandidates(mathCandidates, null);
  assert(ranked6.length === mathCandidates.length, 'Returns all candidates without AI parsing');
  assert(ranked6[0].match.matchScore > 0, 'Generates default rating-based score');

  console.log('\n========================================================================');
  console.log(`📊 Step 2 Test Results: ${passed} PASSED, ${failed} FAILED`);
  console.log('========================================================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runTests();
