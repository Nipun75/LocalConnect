// Automated Standalone Test Runner for Step 4: AI Trust + Review Intelligence
// Run with: node src/tests/test-runner-step4.mjs

// 1. Trust Engine Logic
function calculateTrustScore(signals) {
  const isVerified = Boolean(signals.identity_verified);
  const reviewCount = signals.review_count ?? 0;
  const rating = signals.average_rating ?? (reviewCount > 0 ? 4.5 : 0);
  const completedJobs = signals.completed_jobs_count ?? 0;
  const responseRate = signals.response_rate_percent ?? 90;
  const avgResponseTime = signals.avg_response_time_minutes ?? 15;
  const cancellationRate = signals.cancellation_rate_percent ?? 0;
  const repeatCount = signals.repeat_customers_count ?? 0;

  const isNewProvider = reviewCount === 0 || completedJobs <= 1;

  // Verification (Max 20 pts)
  let verificationScore = 0;
  if (signals.identity_verified) verificationScore += 12;
  if (signals.address_verified) verificationScore += 4;
  if (signals.skill_certified) verificationScore += 4;

  // Rating Quality (Max 25 pts)
  let ratingQualityScore = 0;
  if (reviewCount > 0 && rating > 3.5) {
    const norm = Math.min(1, Math.max(0, (rating - 3.5) / 1.5));
    ratingQualityScore = Math.round(norm * 25);
  } else if (isNewProvider && isVerified) {
    ratingQualityScore = 18;
  }

  // Review Volume (Max 15 pts)
  let reviewVolumeScore = Math.min(15, Math.round((reviewCount / 30) * 15));

  // Completed Jobs (Max 15 pts)
  let jobsPart = Math.min(10, Math.round((completedJobs / 40) * 10));
  let repeatPart = Math.min(5, Math.round((repeatCount / 15) * 5));
  let completedJobsScore = jobsPart + repeatPart;

  // Reliability (Max 15 pts)
  let cancelPart = cancellationRate <= 1 ? 10 : cancellationRate <= 3 ? 7 : cancellationRate <= 5 ? 4 : 1;
  let accountAgePart = Math.min(5, Math.round(((signals.account_age_months || 12) / 24) * 5));
  let reliabilityScore = cancelPart + accountAgePart;

  // Responsiveness (Max 10 pts)
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

  const positiveSignals = [];
  const limitations = [];

  if (isVerified) positiveSignals.push('Identity verified profile');
  if (reviewCount >= 10 && rating >= 4.7) positiveSignals.push(`${rating}★ rating from ${reviewCount} customer reviews`);
  else if (reviewCount > 0) positiveSignals.push(`${rating}★ rating from ${reviewCount} reviews`);

  if (completedJobs >= 10) positiveSignals.push(`${completedJobs}+ completed service requests`);
  if (repeatCount >= 5) positiveSignals.push(`${repeatCount} repeat customers`);

  if (isNewProvider) {
    limitations.push('New provider with limited review history');
  }

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

  return {
    trustScore: totalScore,
    signals: {
      verified: isVerified,
      rating,
      reviewCount,
      completedJobs,
    },
    positiveSignals,
    limitations,
    explanation,
    isNewProvider,
  };
}

// 2. Review Engine Logic
function analyzeReviewsLocally(providerId, reviews) {
  if (!reviews || reviews.length === 0) {
    return {
      providerId,
      overallSentiment: 'Positive',
      sentimentScore: 85,
      summary: 'New provider — limited review history.',
      positiveThemes: [],
      concerns: [],
      totalReviewsAnalyzed: 0,
      isNewProvider: true,
    };
  }

  const ratings = reviews.map((r) => r.rating);
  const avgRating = ratings.reduce((a, b) => a + b, 0) / ratings.length;
  const allText = reviews.map((r) => r.text.toLowerCase()).join(' ');

  const positiveThemesSet = new Set();

  for (const rev of reviews) {
    if (rev.tags && rev.tags.length > 0) {
      for (const tag of rev.tags) {
        positiveThemesSet.add(tag);
      }
    }
  }

  if (allText.includes('punctual') || allText.includes('on time') || allText.includes('time')) {
    positiveThemesSet.add('Punctuality');
  }
  if (allText.includes('explain') || allText.includes('concept') || allText.includes('clear')) {
    positiveThemesSet.add('Clear Explanations');
  }
  if (allText.includes('professional') || allText.includes('polite')) {
    positiveThemesSet.add('Professionalism');
  }

  const concerns = [];
  if (
    allText.includes('saturday only') ||
    allText.includes('mostly on saturdays') ||
    allText.includes('difficult to schedule on weekdays') ||
    allText.includes('weekend only')
  ) {
    concerns.push('Limited weekday availability');
  }
  if (allText.includes('delay') || allText.includes('late')) {
    concerns.push('Occasional timing delays noted');
  }

  let sentiment = 'Very Positive';
  if (avgRating >= 4.9 && concerns.length === 0) sentiment = 'Exceptional';
  else if (avgRating >= 4.7) sentiment = 'Very Positive';
  else if (concerns.length > 0) sentiment = 'Mixed';

  const positiveThemes = Array.from(positiveThemesSet);
  let summary = '';
  if (positiveThemes.length > 0) {
    summary = `Customers frequently praise this provider for ${positiveThemes.join(', ').toLowerCase()}.`;
  } else {
    summary = `Verified customers report strong satisfaction across ${reviews.length} reviews.`;
  }

  if (concerns.length > 0) {
    summary += ` Note: ${concerns.join(', ')}.`;
  }

  return {
    providerId,
    overallSentiment: sentiment,
    sentimentScore: Math.round(avgRating * 20),
    summary,
    positiveThemes,
    concerns,
    totalReviewsAnalyzed: reviews.length,
    isNewProvider: false,
  };
}

// STEP 4 TEST SUITE
async function runStep4Tests() {
  console.log('========================================================================');
  console.log('🎯 Running Step 4: AI Trust + Review Intelligence Tests');
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

  // TEST 1 — Strong Provider (Rating 4.8, 36 reviews, verified, 47 completed jobs)
  console.log('1. TEST 1 — Strong Established Provider Trust Signals');
  const strongProvider = {
    identity_verified: true,
    address_verified: true,
    skill_certified: true,
    average_rating: 4.8,
    review_count: 36,
    completed_jobs_count: 47,
    response_rate_percent: 94,
    avg_response_time_minutes: 15,
    cancellation_rate_percent: 1,
    repeat_customers_count: 14,
    account_age_months: 18,
  };
  const trust1 = calculateTrustScore(strongProvider);

  assert(trust1.trustScore >= 90, 'High trust score (>= 90/100)', `(Got: ${trust1.trustScore}/100)`);
  assert(trust1.signals.verified === true, 'Verified status is true');
  assert(trust1.positiveSignals.some((s) => s.includes('4.8★')), 'Includes 4.8★ rating signal');
  assert(trust1.positiveSignals.some((s) => s.includes('47+ completed')), 'Includes 47+ completed jobs signal');
  assert(trust1.explanation.includes('Verified provider with 4.8★'), 'Factual explanation mentions rating and jobs');

  // TEST 2 — New Provider Handling (Verified, 0 reviews)
  console.log('\n2. TEST 2 — New Verified Provider with 0 Reviews');
  const newProvider = {
    identity_verified: true,
    average_rating: 0,
    review_count: 0,
    completed_jobs_count: 0,
    response_rate_percent: 100,
  };
  const trust2 = calculateTrustScore(newProvider);

  assert(trust2.isNewProvider === true, 'Identified as isNewProvider = true');
  assert(trust2.explanation.includes('Verified provider with limited review history'), 'Explanation is fair and constructive');
  assert(!trust2.explanation.toLowerCase().includes('untrustworthy'), 'Never labeled as untrustworthy');
  assert(trust2.limitations.includes('New provider with limited review history'), 'Lists limited review history limitation');

  // TEST 3 — Many Positive Reviews & Themes
  console.log('\n3. TEST 3 — Positive Review Intelligence & Themes Extraction');
  const reviewsPriya = [
    { id: '1', rating: 5, text: 'Very punctual and explained calculus concepts clearly. Great board prep.', tags: ['Concept Clarity', 'Punctual'] },
    { id: '2', rating: 5, text: 'Friendly, patient, and highly professional tutor.', tags: ['Professional'] },
    { id: '3', rating: 4.8, text: 'Priya maam is always on time and gives great concept clarity.', tags: ['Concept Clarity'] },
  ];
  const reviewIntel3 = analyzeReviewsLocally('prov_math_01', reviewsPriya);

  assert(reviewIntel3.totalReviewsAnalyzed === 3, 'Analyzed 3 reviews');
  assert(reviewIntel3.positiveThemes.some((t) => t.toLowerCase().includes('punctual')), 'Extracted punctuality theme');
  assert(reviewIntel3.positiveThemes.some((t) => t.toLowerCase().includes('concept') || t.toLowerCase().includes('clear')), 'Extracted concept clarity theme');
  assert(reviewIntel3.positiveThemes.some((t) => t.toLowerCase().includes('professional')), 'Extracted professionalism theme');
  assert(reviewIntel3.summary.toLowerCase().includes('praise'), 'Summary highlights positive praise');

  // TEST 4 — Mixed Reviews (Positive + Real Caveat)
  console.log('\n4. TEST 4 — Balanced Mixed Review Analysis');
  const reviewsRahul = [
    { id: '1', rating: 5, text: 'Rahul sir is very clear with concepts. Great maths mastery.', tags: ['Great Tutor'] },
    { id: '2', rating: 4.5, text: 'Good teacher, only limitation is he is available mostly on Saturdays.', tags: ['Saturday Only'] },
  ];
  const reviewIntel4 = analyzeReviewsLocally('prov_math_02', reviewsRahul);

  assert(reviewIntel4.concerns.length > 0, 'Extracted real caveat from review text');
  assert(reviewIntel4.concerns[0].toLowerCase().includes('weekday availability'), 'Mentions limited weekday availability caveat');
  assert(reviewIntel4.summary.includes('Note:'), 'Summary transparently notes the scheduling limitation without hiding it');

  // TEST 5 — No Reviews Handling
  console.log('\n5. TEST 5 — Provider with No Reviews');
  const reviewIntel5 = analyzeReviewsLocally('prov_empty', []);

  assert(reviewIntel5.isNewProvider === true, 'Correctly flags isNewProvider = true');
  assert(reviewIntel5.totalReviewsAnalyzed === 0, 'Analyzed 0 reviews');
  assert(reviewIntel5.summary.includes('New provider'), 'Summary states clean new provider notice');
  assert(reviewIntel5.concerns.length === 0, 'No hallucinated concerns');

  // TEST 6 — Fallback & Resilience
  console.log('\n6. TEST 6 — Fallback & Deterministic Reliability');
  const reviewIntel6 = analyzeReviewsLocally('prov_math_01', reviewsPriya);
  assert(reviewIntel6.sentimentScore >= 90, 'Deterministic sentiment score computed offline');

  console.log('\n========================================================================');
  console.log(`📊 Step 4 Test Results: ${passed} PASSED, ${failed} FAILED`);
  console.log('========================================================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runStep4Tests();
