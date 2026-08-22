// Backend AI Service with Deterministic Fallback & Natural Language Parsing

const MOCK_PROVIDERS_BACKEND = [
  {
    id: 'prov_math_01',
    name: 'Priya Deshmukh',
    title: 'Senior Mathematics Educator (Class 11–12 & Boards)',
    category: 'Education & Tutors',
    services: ['Class 12 Mathematics', 'Class 11 Mathematics', 'CBSE Board Prep'],
    skills: ['Class 11-12 Maths', 'Calculus', 'Algebra', 'CBSE Syllabus'],
    pricing: { base_rate: 450, currency: 'INR', unit: 'session' },
    location: { name: 'Dharampeth, Nagpur', area: 'Dharampeth', lat: 21.1430, lng: 79.0590 },
    availability: { days: ['Saturday', 'Sunday'], time_slots: ['morning', 'evening'] },
    trust_signals: {
      identity_verified: true,
      completed_jobs_count: 47,
      average_rating: 4.9,
      review_count: 42,
      response_rate_percent: 98,
      avg_response_time_minutes: 12,
    },
    trust_score: 96,
  },
  {
    id: 'prov_math_02',
    name: 'Rahul Sharma',
    title: 'Class 10–12 Mathematics & JEE Foundation Tutor',
    category: 'Education & Tutors',
    services: ['Class 12 Mathematics', 'Class 11 Mathematics', 'Class 10 Maths'],
    skills: ['Class 11-12 Maths', 'Coordinate Geometry', 'CBSE Board'],
    pricing: { base_rate: 500, currency: 'INR', unit: 'session' },
    location: { name: 'Ramdaspeth, Nagpur', area: 'Ramdaspeth', lat: 21.1370, lng: 79.0740 },
    availability: { days: ['Saturday'], time_slots: ['morning', 'evening'] },
    trust_signals: {
      identity_verified: true,
      completed_jobs_count: 36,
      average_rating: 4.8,
      review_count: 36,
      response_rate_percent: 94,
      avg_response_time_minutes: 20,
    },
    trust_score: 91,
  },
  {
    id: 'prov_math_03',
    name: 'Amit Verma',
    title: 'Secondary & Higher Secondary Maths Teacher',
    category: 'Education & Tutors',
    services: ['Class 10 Maths', 'Class 11 Mathematics'],
    skills: ['Class 10 Maths', 'Class 11 Maths', 'Algebra', 'State Board'],
    pricing: { base_rate: 400, currency: 'INR', unit: 'session' },
    location: { name: 'Sitabuldi, Nagpur', area: 'Sitabuldi', lat: 21.1470, lng: 79.0810 },
    availability: { days: ['Sunday', 'Tuesday', 'Thursday'], time_slots: ['evening'] },
    trust_signals: {
      identity_verified: true,
      completed_jobs_count: 22,
      average_rating: 4.6,
      review_count: 19,
      response_rate_percent: 88,
      avg_response_time_minutes: 35,
    },
    trust_score: 84,
  },
  {
    id: 'prov_elec_01',
    name: 'Rajesh Kolhe',
    title: 'Certified Master Electrician & Emergency Wireman',
    category: 'Home Maintenance',
    services: ['Short Circuit Repair', 'Switchboard Repair', 'Inverter Installation'],
    skills: ['Emergency Electrical', 'Short Circuit', 'Wiring Diagnostics'],
    pricing: { base_rate: 300, currency: 'INR', unit: 'job' },
    location: { name: 'Dharampeth, Nagpur', area: 'Dharampeth', lat: 21.1415, lng: 79.0630 },
    availability: { days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'], time_slots: ['flexible'] },
    trust_signals: {
      identity_verified: true,
      completed_jobs_count: 68,
      average_rating: 4.9,
      review_count: 59,
      response_rate_percent: 99,
      avg_response_time_minutes: 8,
    },
    trust_score: 98,
  }
];

function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  return Math.round(R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)) * 10) / 10;
}

function parseNeedQuery(query) {
  const raw = query.toLowerCase();

  // Category & service
  let category = 'Education & Tutors';
  let service = 'Maths Tutor';
  let level = 'Class 12';

  if (raw.includes('electrician') || raw.includes('bijli') || raw.includes('short circuit')) {
    category = 'Home Maintenance';
    service = 'Electrician';
    level = 'Emergency';
  } else if (raw.includes('ac') || raw.includes('cooling') || raw.includes('split ac')) {
    category = 'Appliance Repair';
    service = 'AC Repair & Service';
    level = 'Split AC';
  } else if (raw.includes('photo') || raw.includes('wedding')) {
    category = 'Creative & Tech';
    service = 'Photographer';
    level = 'Wedding';
  }

  // Budget
  let maxBudget = 500;
  const budgetMatch = query.match(/(?:₹|rs\.?|inr|under|budget|around|ke andar)\s*(\d{2,6})/i) ||
                      query.match(/(\d{2,6})\s*(?:₹|rs|rupees|ke andar)/i);
  if (budgetMatch) {
    maxBudget = parseInt(budgetMatch[1], 10);
  }

  // Days
  const days = [];
  if (raw.includes('weekend') || raw.includes('saturday') || raw.includes('sunday')) {
    days.push('Saturday', 'Sunday');
  }

  return {
    id: `req_${Date.now()}`,
    raw_query: query,
    category,
    service,
    level_or_type: level,
    skills_required: [`${level} ${service}`],
    location: {
      name: 'Dharampeth, Nagpur',
      lat: 21.1442,
      lng: 79.0620,
      radius_km: 3,
    },
    budget: { max: maxBudget, currency: 'INR', unit: 'session' },
    schedule: { days: days.length > 0 ? days : ['Saturday', 'Sunday'] },
    urgency: raw.includes('emergency') || raw.includes('urgent') ? 'urgent' : 'normal',
  };
}

function rankBackendProviders(requirement) {
  return MOCK_PROVIDERS_BACKEND.map((provider, index) => {
    const dist = calculateDistance(
      requirement.location.lat,
      requirement.location.lng,
      provider.location.lat,
      provider.location.lng
    );

    let matchScore = 85;
    if (index === 0) matchScore = 96;
    else if (index === 1) matchScore = 92;
    else if (index === 2) matchScore = 87;

    return {
      provider,
      match: {
        provider_id: provider.id,
        match_score: matchScore,
        distance_km: dist,
        is_top_match: index === 0,
        explanation: {
          headline: `${provider.name.split(' ')[0]} matches your subject, budget, distance, and schedule preferences.`,
          bullet_points: [
            `Teaches / Specializes in ${provider.services[0]}`,
            `${dist} km away from ${requirement.location.name}`,
            `Available ${provider.availability.days.join(' & ')}`,
            `₹${provider.pricing.base_rate}/${provider.pricing.unit} (within your ₹${requirement.budget.max} budget)`,
            `${provider.trust_signals.average_rating}★ from ${provider.trust_signals.review_count} verified reviews`,
          ],
        },
      },
    };
  });
}

function refineBackendRequirement(current, followupText) {
  const lower = followupText.toLowerCase();
  const updated = {
    ...current,
    location: { ...current.location },
    budget: { ...current.budget },
    schedule: { ...current.schedule },
  };

  // 1. Budget removals
  if (
    lower.includes("budget doesn't matter") ||
    lower.includes('no budget limit') ||
    lower.includes('budget does not matter') ||
    lower.includes('budget ki koi dikkat nahi') ||
    lower.includes('any budget')
  ) {
    delete updated.budget.max;
    delete updated.budget.min;
  } else {
    // 2. Budget update
    const numMatch =
      followupText.match(/(?:₹|rs\.?|inr|under|upto|max|budget|make it|around|ke andar)\s*(\d{2,6})/i) ||
      followupText.match(/(\d{2,6})\s*(?:₹|rs|rupees|inr|ke andar)/i);
    const kMatch = followupText.match(/(\d+)\s*k\b/i);

    if (kMatch) {
      updated.budget.max = parseInt(kMatch[1], 10) * 1000;
    } else if (numMatch) {
      updated.budget.max = parseInt(numMatch[1], 10);
    } else if (lower.includes('cheaper') || lower.includes('sasta')) {
      updated.budget.max = Math.max(300, (updated.budget.max || 500) - 50);
    }
  }

  // 3. Schedule update
  if (lower.includes('any day') || lower.includes('anytime')) {
    delete updated.schedule.days;
  } else {
    const days = [];
    if (lower.includes('sunday')) days.push('Sunday');
    if (lower.includes('saturday')) days.push('Saturday');
    if (lower.includes('weekend') && days.length === 0) days.push('Saturday', 'Sunday');
    if (days.length > 0) updated.schedule.days = days;
  }

  // 4. Distance / Radius
  const radiusMatch = followupText.match(/(\d+)\s*(?:km|k\.m\.|kilometer|kms)/i);
  if (radiusMatch) {
    updated.location.radius_km = parseInt(radiusMatch[1], 10);
  }

  // 5. Service & Level context
  if (lower.includes('wedding')) {
    updated.level_or_type = 'Wedding';
    updated.service = 'Wedding Photographer';
    updated.category = 'Creative & Tech';
  } else if (lower.includes('12th') || lower.includes('class 12')) {
    updated.level_or_type = 'Class 12';
  }

  return updated;
}

module.exports = {
  parseNeedQuery,
  rankBackendProviders,
  refineBackendRequirement,
  getAllBackendProviders: () => MOCK_PROVIDERS_BACKEND,
};

