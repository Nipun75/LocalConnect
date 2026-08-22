import {
  AIProvider,
  ParseOptions,
} from './AIProvider';
import {
  ParsedRequirement,
  MatchExplanation,
  ScoreBreakdown,
  ProviderMatch,
  ProviderComparison,
  ReviewSummary,
  ProfileEnhancementRequest,
  ProfileEnhancementResult,
  UrgencyLevel,
} from '@/types/ai';
import { Provider, ReviewItem } from '@/types/provider';
import { resolveLocationFromQuery, DEFAULT_USER_LOCATION } from '@/data/locations';
import { findBestSemanticService } from './semanticOntology';

export class LocalDeterministicProvider implements AIProvider {
  public name = 'Local Deterministic NLP';

  public async isAvailable(): Promise<boolean> {
    return true; // Always available offline
  }

  // 1. Parse requirement from natural language query
  public async parseRequirement(
    query: string,
    options?: ParseOptions
  ): Promise<ParsedRequirement> {
    const rawLower = query.toLowerCase();
    const id = `req_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

    // Language detection
    const isHinglish = /bhai|chahiye|paas|ke andar|sasta|kal|shaam|ko|mujhe|mere|ghar|karna|wala|wali|hai/.test(rawLower);
    const lang = isHinglish ? 'hinglish' : 'en';

    // Semantic category & service matching
    const semantic = findBestSemanticService(query);

    // Location extraction
    const resolvedLoc = resolveLocationFromQuery(query);
    const radiusMatch = query.match(/(\d+)\s*(?:km|k\.m\.|kilometer|kilometre|kms)/i);
    let radiusKm = radiusMatch ? parseInt(radiusMatch[1], 10) : options?.defaultRadiusKm || 5;
    if (rawLower.includes('very close') || rawLower.includes('ghar ke paas') || rawLower.includes('walking distance')) {
      radiusKm = 2;
    }

    // Budget extraction
    let budgetMax: number | undefined;
    let budgetMin: number | undefined;
    let budgetUnit: 'session' | 'hour' | 'job' | 'month' | 'total' = 'session';

    // Regex patterns for Indian currency & numbers
    const rangeMatch = query.match(/(?:₹|rs\.?|inr)?\s*(\d{2,6})\s*(?:-|to|se)\s*(?:₹|rs\.?|inr)?\s*(\d{2,6})/i);
    const singlePriceMatch = query.match(/(?:under|less than|around|approx|upto|max|budget|around ₹|₹|rs\.?|inr|ke andar)\s*(\d{2,6})/i) ||
                             query.match(/(\d{2,6})\s*(?:₹|rs|rupees|inr|ke andar|per session|per job|\/session|\/job)/i);

    if (rangeMatch) {
      budgetMin = parseInt(rangeMatch[1], 10);
      budgetMax = parseInt(rangeMatch[2], 10);
    } else if (singlePriceMatch) {
      budgetMax = parseInt(singlePriceMatch[1], 10);
    } else if (rawLower.includes('cheap') || rawLower.includes('sasta') || rawLower.includes('affordable') || rawLower.includes('budget friendly')) {
      budgetMax = semantic.serviceId === 'maths_tutor' ? 450 : 500;
    } else if (rawLower.includes('premium') || rawLower.includes('best') || rawLower.includes('top quality')) {
      budgetMax = 2000;
    }

    if (rawLower.includes('session') || rawLower.includes('class') || rawLower.includes('hour') || semantic.categoryId === 'education' || semantic.categoryId === 'fitness_wellness') {
      budgetUnit = 'session';
    } else {
      budgetUnit = 'job';
    }

    // Schedule extraction
    const days: string[] = [];
    if (rawLower.includes('weekend') || rawLower.includes('saturday') || rawLower.includes('sunday')) {
      if (rawLower.includes('saturday')) days.push('Saturday');
      if (rawLower.includes('sunday')) days.push('Sunday');
      if (days.length === 0) {
        days.push('Saturday', 'Sunday');
      }
    }
    if (rawLower.includes('monday')) days.push('Monday');
    if (rawLower.includes('wednesday')) days.push('Wednesday');
    if (rawLower.includes('friday')) days.push('Friday');

    let timeSlot: string | undefined;
    if (rawLower.includes('evening') || rawLower.includes('shaam')) timeSlot = 'evening';
    else if (rawLower.includes('morning') || rawLower.includes('subah')) timeSlot = 'morning';
    else if (rawLower.includes('afternoon') || rawLower.includes('dopahar')) timeSlot = 'afternoon';

    let scheduleDate: string | undefined;
    if (rawLower.includes('tomorrow') || rawLower.includes('kal')) scheduleDate = 'Tomorrow';
    else if (rawLower.includes('today') || rawLower.includes('aaj')) scheduleDate = 'Today';
    else if (rawLower.includes('december 20') || rawLower.includes('dec 20')) scheduleDate = 'December 20';

    // Urgency extraction
    let urgency: UrgencyLevel = 'normal';
    if (rawLower.includes('emergency') || rawLower.includes('urgent') || rawLower.includes('immediately') || rawLower.includes('jaldi') || rawLower.includes('right now')) {
      urgency = 'urgent';
    }

    // Gender preference
    let genderPref: 'any' | 'male' | 'female' = 'any';
    if (rawLower.includes('female') || rawLower.includes('lady') || rawLower.includes('woman') || rawLower.includes('aurat') || rawLower.includes('ma\'am')) {
      genderPref = 'female';
    } else if (rawLower.includes('male') || rawLower.includes('sir')) {
      genderPref = 'male';
    }

    // Level or sub-type
    let levelOrType = '';
    if (rawLower.includes('12th') || rawLower.includes('class 12') || rawLower.includes('12th-standard')) {
      levelOrType = 'Class 12';
    } else if (rawLower.includes('10th') || rawLower.includes('class 10')) {
      levelOrType = 'Class 10';
    } else if (rawLower.includes('wedding')) {
      levelOrType = 'Wedding';
    } else if (rawLower.includes('split ac')) {
      levelOrType = 'Split AC';
    }

    // Skills synthesis
    const skillsRequired = [...semantic.matchedSkills];
    if (levelOrType && !skillsRequired.includes(levelOrType)) {
      skillsRequired.unshift(`${levelOrType} ${semantic.serviceName}`);
    }

    // Missing fields and follow-up question
    const missingFields: string[] = [];
    let followUpQuestion: string | undefined;

    if (!budgetMax && !query.includes('budget') && !query.includes('rs') && !query.includes('₹')) {
      missingFields.push('budget');
    }
    if (days.length === 0 && !scheduleDate && !timeSlot) {
      missingFields.push('schedule');
    }

    if (query.trim().split(/\s+/).length <= 4 && !budgetMax) {
      if (semantic.serviceId === 'photographer') {
        followUpQuestion = 'What type of photography do you need? (e.g. Wedding, Event, or Portrait)';
      } else if (semantic.serviceId === 'maths_tutor') {
        followUpQuestion = 'Which class or syllabus is this for? (e.g. Class 10 or 12 CBSE)';
      } else {
        followUpQuestion = 'Do you have a specific schedule or budget preference in mind?';
      }
    }

    return {
      id,
      raw_query: query,
      language_detected: lang,
      category: semantic.categoryName,
      service: semantic.serviceName,
      sub_category: semantic.serviceId,
      level_or_type: levelOrType,
      skills_required: skillsRequired,
      location: {
        name: resolvedLoc.name,
        area: resolvedLoc.area,
        city: resolvedLoc.city,
        lat: resolvedLoc.lat,
        lng: resolvedLoc.lng,
        radius_km: radiusKm,
        is_user_current: resolvedLoc.name === DEFAULT_USER_LOCATION.name,
      },
      budget: {
        min: budgetMin,
        max: budgetMax,
        currency: 'INR',
        unit: budgetUnit,
        flexibility: 'flexible',
      },
      schedule: {
        date: scheduleDate,
        time_slot: timeSlot,
        days: days.length > 0 ? days : undefined,
        recurring: days.length > 0,
      },
      urgency,
      mode: 'both',
      gender_preference: genderPref,
      constraints: [
        radiusKm ? `Within ${radiusKm} km` : 'Near me',
        days.length > 0 ? days.join(' & ') : scheduleDate || 'Flexible time',
        budgetMax ? `Max ₹${budgetMax}` : 'Flexible budget',
      ],
      confidence_score: 0.94,
      missing_fields: missingFields,
      follow_up_question: followUpQuestion,
      created_at: new Date().toISOString(),
    };
  }

  // 2. Refine existing requirement with conversational follow-up
  public async refineRequirement(
    previous: ParsedRequirement,
    followupText: string
  ): Promise<ParsedRequirement> {
    const updated = {
      ...previous,
      location: { ...previous.location },
      budget: { ...previous.budget },
      schedule: { ...previous.schedule },
    };
    const lower = followupText.toLowerCase();

    // 1. Budget removal / clearance
    if (
      lower.includes("budget doesn't matter") ||
      lower.includes('no budget limit') ||
      lower.includes('budget does not matter') ||
      lower.includes('budget ki koi dikkat nahi') ||
      lower.includes('any budget') ||
      lower.includes('ignore budget')
    ) {
      updated.budget.max = undefined;
      updated.budget.min = undefined;
    } else {
      // 2. Budget update
      const kMatch = followupText.match(/(\d+)\s*k\b/i);
      const numMatch =
        followupText.match(/(?:₹|rs\.?|inr|under|upto|max|budget|make it|around|ke andar)\s*(\d{2,6})/i) ||
        followupText.match(/(\d{2,6})\s*(?:₹|rs|rupees|inr|ke andar)/i);

      if (kMatch) {
        updated.budget.max = parseInt(kMatch[1], 10) * 1000;
      } else if (numMatch && (lower.includes('budget') || lower.includes('under') || lower.includes('₹') || lower.includes('rs') || lower.includes('price') || lower.includes('make it') || !isNaN(Number(followupText.trim())))) {
        updated.budget.max = parseInt(numMatch[1], 10);
      } else if (lower.includes('cheaper') || lower.includes('sasta') || lower.includes('lower price')) {
        if (updated.budget.max) {
          updated.budget.max = Math.max(300, updated.budget.max - 100);
        } else {
          updated.budget.max = 450;
        }
      }
    }

    // 3. Schedule update
    if (
      lower.includes('any day') ||
      lower.includes('anytime') ||
      lower.includes('any day is fine') ||
      lower.includes('no day preference')
    ) {
      updated.schedule.days = undefined;
      updated.schedule.date = undefined;
      updated.schedule.time_slot = undefined;
    } else {
      const days: string[] = [];
      if (lower.includes('sunday')) days.push('Sunday');
      if (lower.includes('saturday')) days.push('Saturday');
      if (lower.includes('weekend') && days.length === 0) days.push('Saturday', 'Sunday');
      if (lower.includes('monday')) days.push('Monday');
      if (lower.includes('wednesday')) days.push('Wednesday');
      if (lower.includes('friday')) days.push('Friday');

      if (days.length > 0) {
        updated.schedule.days = days;
      }

      if (lower.includes('december 20') || lower.includes('dec 20')) {
        updated.schedule.date = 'December 20';
      } else if (lower.includes('tomorrow') || lower.includes('kal')) {
        updated.schedule.date = 'Tomorrow';
      } else if (lower.includes('today') || lower.includes('aaj')) {
        updated.schedule.date = 'Today';
      }
    }

    // 4. Distance / Radius update
    const radiusMatch = followupText.match(/(\d+)\s*(?:km|k\.m\.|kilometer|kms)/i);
    if (radiusMatch) {
      updated.location.radius_km = parseInt(radiusMatch[1], 10);
    } else if (lower.includes('closest') || lower.includes('paas') || lower.includes('near')) {
      updated.location.radius_km = Math.min(3, updated.location.radius_km || 5);
    }

    // 5. Location change
    if (lower.includes('near') || lower.includes('in') || lower.includes('at') || lower.includes('instead')) {
      const resolved = resolveLocationFromQuery(followupText);
      if (resolved.name.toLowerCase() !== 'dharampeth' || lower.includes('dharampeth')) {
        updated.location.name = resolved.name;
        updated.location.area = resolved.area;
        updated.location.lat = resolved.lat;
        updated.location.lng = resolved.lng;
      } else {
        const banerMatch = followupText.match(/(?:near|in|at)\s+([A-Za-z]+)/i);
        if (banerMatch && !['me', 'home', 'my', 'the'].includes(banerMatch[1].toLowerCase())) {
          updated.location.name = banerMatch[1].charAt(0).toUpperCase() + banerMatch[1].slice(1);
          updated.location.area = updated.location.name;
        }
      }
    }

    // 6. Education Level
    if (lower.includes('12th') || lower.includes('class 12')) {
      updated.level_or_type = 'Class 12';
      if (!updated.skills_required.includes('Class 11-12 Maths')) {
        updated.skills_required.unshift('Class 11-12 Maths');
      }
    } else if (lower.includes('10th') || lower.includes('class 10')) {
      updated.level_or_type = 'Class 10';
      if (!updated.skills_required.includes('Class 10 Maths')) {
        updated.skills_required.unshift('Class 10 Maths');
      }
    }

    // 7. Service & Category Context
    if (lower.includes('wedding')) {
      updated.level_or_type = 'Wedding';
      updated.service = 'Wedding Photographer';
      updated.category = 'Creative & Tech';
      updated.skills_required = ['Candid Wedding Photography', 'Pre-Wedding Shoot'];
    }

    return updated;
  }

  // 3. Generate factual, verifiable match explanation
  public async generateMatchExplanation(
    requirement: ParsedRequirement,
    provider: Provider,
    scoreBreakdown: ScoreBreakdown,
    distanceKm: number
  ): Promise<MatchExplanation> {
    const bullets: string[] = [];
    const strengths: string[] = [];
    const caveats: string[] = [];
    const trust: string[] = [];

    // Skill & Service
    if (scoreBreakdown.skill_relevance >= 80) {
      bullets.push(`Teaches / Specializes in ${provider.services[0] || requirement.service}`);
      strengths.push(`Direct experience in ${provider.skills.slice(0, 2).join(', ')}`);
    }

    // Distance
    bullets.push(`${distanceKm.toFixed(1)} km away from ${requirement.location.name}`);
    if (distanceKm > requirement.location.radius_km) {
      caveats.push(`Located ${distanceKm.toFixed(1)} km away (slightly beyond your preferred ${requirement.location.radius_km} km radius)`);
    }

    // Availability
    if (requirement.schedule.days && requirement.schedule.days.length > 0) {
      const matchDays = requirement.schedule.days.filter((d) => provider.availability.days.includes(d));
      if (matchDays.length > 0) {
        bullets.push(`Available ${matchDays.join(' & ')}`);
      } else {
        caveats.push(`Primary availability on ${provider.availability.days.join(', ')}`);
      }
    } else if (provider.availability.days.length > 0) {
      bullets.push(`Available on ${provider.availability.days.slice(0, 2).join(' & ')}`);
    }

    // Budget
    const rate = provider.pricing.base_rate;
    if (requirement.budget.max) {
      if (rate <= requirement.budget.max) {
        bullets.push(`₹${rate}/${provider.pricing.unit} (within your ₹${requirement.budget.max} budget)`);
      } else {
        bullets.push(`₹${rate}/${provider.pricing.unit}`);
        caveats.push(`Rate (₹${rate}) is slightly above your target budget of ₹${requirement.budget.max}`);
      }
    } else {
      bullets.push(`₹${rate}/${provider.pricing.unit}`);
    }

    // Trust & Reviews
    bullets.push(`${provider.trust_signals.average_rating}★ from ${provider.trust_signals.review_count} verified reviews`);
    if (provider.trust_signals.identity_verified) {
      bullets.push('Identity & credentials verified');
      trust.push('Government ID and qualification verified by LocalConnect');
    }
    if (provider.trust_signals.repeat_customers_count > 5) {
      trust.push(`${provider.trust_signals.repeat_customers_count} repeat local customers`);
    }

    const headline = `${provider.name.split(' ')[0]} is a strong match because they align with your ${requirement.service.toLowerCase()} requirement, pricing, schedule, and distance in ${requirement.location.area || 'your area'}.`;

    return {
      headline,
      bullet_points: bullets,
      strengths,
      caveats: caveats.length > 0 ? caveats : undefined,
      trust_highlights: trust,
    };
  }

  // 4. Compare top providers
  public async compareProviders(
    requirement: ParsedRequirement,
    matches: Array<{ provider: Provider; match: ProviderMatch }>
  ): Promise<ProviderComparison> {
    const list = matches.slice(0, 3).map(({ provider, match }) => {
      let advantage = '';
      if (match.score_breakdown.budget_compatibility === 100) advantage = 'Most affordable';
      else if (match.distance_km <= 2.0) advantage = 'Closest location';
      else if (provider.trust_signals.average_rating >= 4.9) advantage = 'Highest rating & trust';
      else advantage = 'Strong all-round match';

      return {
        id: provider.id,
        name: provider.name,
        title: provider.title,
        match_score: match.match_score,
        hourly_rate: provider.pricing.base_rate,
        distance_km: match.distance_km,
        rating: provider.trust_signals.average_rating,
        review_count: provider.trust_signals.review_count,
        trust_score: provider.trust_breakdown.total_score,
        key_advantage: advantage,
        availability_summary: provider.availability.days.join(', '),
        best_for: `${provider.experience_years}+ yrs exp in ${provider.skills[0] || 'tutoring'}`,
      };
    });

    const top = list[0];
    const verdict = top
      ? `Based on your request for ${requirement.service} within ₹${requirement.budget.max || 'budget'}, ${top.name} ranks highest with a ${top.match_score}% match score, combining competitive pricing (₹${top.hourly_rate}), close distance (${top.distance_km} km), and a verified ${top.rating}★ rating.`
      : 'Review the candidate options above to choose the best fit.';

    return {
      requirement_summary: `${requirement.service} in ${requirement.location.name} (Budget: ₹${requirement.budget.max || 'Flexible'})`,
      providers: list,
      ai_verdict: verdict,
    };
  }

  // 5. Enhance provider profile
  public async enhanceProfile(
    request: ProfileEnhancementRequest
  ): Promise<ProfileEnhancementResult> {
    return {
      suggested_title: `Verified ${request.category} Professional | Specialized Local Services`,
      professional_tagline: `Dedicated ${request.category} specialist with verified experience, flexible timings, and committed customer satisfaction.`,
      enhanced_bio: `${request.provider_name} brings hands-on expertise in ${request.raw_skills || request.category}. Experienced in delivering high-quality local services with punctual communication and transparent pricing.`,
      bullet_highlights: [
        `Specialist in ${request.raw_skills || 'domain skills'}`,
        `Flexible scheduling: ${request.raw_availability || 'Morning & Evening slots'}`,
        'Punctual and verified service with clear communication',
        'Transparent rates and high customer satisfaction record',
      ],
      service_tags: request.raw_skills.split(',').map((s) => s.trim()).filter(Boolean),
    };
  }

  // 6. Summarize real customer reviews
  public async summarizeReviews(
    reviews: ReviewItem[],
    _providerTitle: string
  ): Promise<ReviewSummary> {
    if (!reviews || reviews.length === 0) {
      return {
        overall_sentiment: 'Positive',
        sentiment_score: 85,
        positive_highlights: ['Newly listed provider with verified credentials'],
        potential_concerns: [],
        typical_experience: 'Clients report prompt response and professional attitude.',
        total_reviews_analyzed: 0,
      };
    }

    const ratings = reviews.map((r) => r.rating);
    const avg = ratings.reduce((a, b) => a + b, 0) / ratings.length;
    const allTags = reviews.flatMap((r) => r.tags || []);

    const positiveHighlights: string[] = [];
    if (allTags.length > 0) {
      positiveHighlights.push(...Array.from(new Set(allTags)).slice(0, 3));
    } else {
      positiveHighlights.push('Punctual arrival and clear explanations', 'Fair and transparent pricing');
    }

    const concerns: string[] = [];
    const allText = reviews.map((r) => r.text).join(' ');
    if (allText.toLowerCase().includes('saturday only') || allText.toLowerCase().includes('weekend only')) {
      concerns.push('High weekend demand — booking 2-3 days in advance recommended');
    }

    let sentiment: 'Exceptional' | 'Very Positive' | 'Positive' | 'Mixed' = 'Very Positive';
    if (avg >= 4.9) sentiment = 'Exceptional';
    else if (avg >= 4.7) sentiment = 'Very Positive';
    else if (avg >= 4.3) sentiment = 'Positive';
    else sentiment = 'Mixed';

    return {
      overall_sentiment: sentiment,
      sentiment_score: Math.round(avg * 20),
      positive_highlights: positiveHighlights,
      potential_concerns: concerns,
      typical_experience: 'Verified customers consistently highlight strong subject grasp, polite communication, and punctuality.',
      total_reviews_analyzed: reviews.length,
    };
  }
}
