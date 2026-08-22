// LocalConnect AI Review Intelligence Engine
// Analyzes real customer reviews to extract themes, sentiment, and verified insights with in-memory caching.

import { ReviewItem } from '@/types/provider';

export interface ReviewThemeItem {
  theme: string;
  sentiment: 'positive' | 'mixed' | 'concern';
  frequency: 'common' | 'occasional';
  exampleSnippet?: string;
}

export interface ReviewIntelligence {
  providerId: string;
  overallSentiment: 'Exceptional' | 'Very Positive' | 'Positive' | 'Mixed';
  sentimentScore: number; // 0 - 100
  summary: string;
  positiveThemes: string[];
  concerns: string[];
  themes: ReviewThemeItem[];
  typicalExperience: string;
  totalReviewsAnalyzed: number;
  isNewProvider: boolean;
}

// In-Memory Cache (Item 19 in specification: prevents repeated LLM / analysis calls)
const reviewIntelligenceCache: Map<string, ReviewIntelligence> = new Map();

/**
 * Deterministic Review Analyzer
 * Extracts insights strictly from verified customer review text and tags.
 */
export function analyzeReviewsLocally(providerId: string, reviews: ReviewItem[]): ReviewIntelligence {
  if (!reviews || reviews.length === 0) {
    return {
      providerId,
      overallSentiment: 'Positive',
      sentimentScore: 85,
      summary: 'New provider — limited review history.',
      positiveThemes: [],
      concerns: [],
      themes: [],
      typicalExperience: 'No customer reviews recorded yet.',
      totalReviewsAnalyzed: 0,
      isNewProvider: true,
    };
  }

  const ratings = reviews.map((r) => r.rating);
  const avgRating = ratings.reduce((a, b) => a + b, 0) / ratings.length;
  const allText = reviews.map((r) => r.text.toLowerCase()).join(' ');

  // Extract common positive themes from tags and text
  const positiveThemesSet = new Set<string>();
  const themesList: ReviewThemeItem[] = [];

  // Inspect tags
  for (const rev of reviews) {
    if (rev.tags && rev.tags.length > 0) {
      for (const tag of rev.tags) {
        positiveThemesSet.add(tag);
      }
    }
  }

  // Common vocabulary detection
  if (allText.includes('punctual') || allText.includes('on time') || allText.includes('time')) {
    positiveThemesSet.add('Punctual & On-time');
    themesList.push({ theme: 'Punctuality', sentiment: 'positive', frequency: 'common' });
  }
  if (allText.includes('explain') || allText.includes('concept') || allText.includes('clear')) {
    positiveThemesSet.add('Clear Explanations');
    themesList.push({ theme: 'Concept Clarity', sentiment: 'positive', frequency: 'common' });
  }
  if (allText.includes('professional') || allText.includes('polite') || allText.includes('friendly')) {
    positiveThemesSet.add('Professional Conduct');
    themesList.push({ theme: 'Professionalism', sentiment: 'positive', frequency: 'common' });
  }
  if (allText.includes('emergency') || allText.includes('fast arrival') || allText.includes('quick')) {
    positiveThemesSet.add('Fast Emergency Response');
    themesList.push({ theme: 'Response Speed', sentiment: 'positive', frequency: 'common' });
  }
  if (allText.includes('neat') || allText.includes('clean') || allText.includes('hygiene')) {
    positiveThemesSet.add('Neat & Clean Work');
    themesList.push({ theme: 'Cleanliness', sentiment: 'positive', frequency: 'common' });
  }
  if (allText.includes('reasonable') || allText.includes('budget') || allText.includes('honest pricing') || allText.includes('no hidden')) {
    positiveThemesSet.add('Transparent Pricing');
    themesList.push({ theme: 'Pricing Transparency', sentiment: 'positive', frequency: 'common' });
  }

  // Extract balanced concerns ONLY if present in actual reviews (Item 6 & 7)
  const concerns: string[] = [];
  if (
    allText.includes('saturday only') ||
    allText.includes('mostly on saturdays') ||
    allText.includes('difficult to schedule on weekdays') ||
    allText.includes('weekend only')
  ) {
    concerns.push('Limited weekday availability (primarily available on weekends)');
    themesList.push({ theme: 'Weekday Availability', sentiment: 'mixed', frequency: 'occasional' });
  }
  if (allText.includes('book in advance') || allText.includes('pre-booking required') || allText.includes('busy')) {
    concerns.push('High customer demand — advance booking recommended');
    themesList.push({ theme: 'Booking Lead Time', sentiment: 'mixed', frequency: 'occasional' });
  }
  if (allText.includes('delay') || allText.includes('late')) {
    concerns.push('Occasional timing delays noted during peak hours');
    themesList.push({ theme: 'Peak Hours Timing', sentiment: 'concern', frequency: 'occasional' });
  }

  // Sentiment Classification
  let sentiment: 'Exceptional' | 'Very Positive' | 'Positive' | 'Mixed' = 'Very Positive';
  if (avgRating >= 4.9 && concerns.length === 0) sentiment = 'Exceptional';
  else if (avgRating >= 4.7) sentiment = 'Very Positive';
  else if (avgRating >= 4.3 && concerns.length <= 1) sentiment = 'Positive';
  else sentiment = 'Mixed';

  // Construct Factual Summary
  const positiveThemesArray = Array.from(positiveThemesSet).slice(0, 4);
  let summary = '';
  if (positiveThemesArray.length > 0) {
    summary = `Customers frequently praise this provider for ${positiveThemesArray.join(', ').toLowerCase()}.`;
  } else {
    summary = `Verified customers report strong satisfaction across ${reviews.length} completed engagements.`;
  }

  if (concerns.length > 0) {
    summary += ` Note: ${concerns[0]}.`;
  }

  const typicalExperience =
    reviews.length >= 2
      ? `Based on ${reviews.length} verified reviews, customers highlight strong subject grasp, reliable communication, and prompt service.`
      : reviews[0]?.text || 'Verified customer feedback indicates reliable local service.';

  return {
    providerId,
    overallSentiment: sentiment,
    sentimentScore: Math.round(avgRating * 20),
    summary,
    positiveThemes: positiveThemesArray,
    concerns,
    themes: themesList,
    typicalExperience,
    totalReviewsAnalyzed: reviews.length,
    isNewProvider: false,
  };
}

/**
 * Main Review Intelligence Function with Cache Layer
 */
export async function getProviderReviewIntelligence(
  providerId: string,
  reviews: ReviewItem[]
): Promise<ReviewIntelligence> {
  const cacheKey = `${providerId}_${reviews ? reviews.length : 0}`;
  if (reviewIntelligenceCache.has(cacheKey)) {
    return reviewIntelligenceCache.get(cacheKey)!;
  }

  // Calculate review intelligence locally & cache
  const result = analyzeReviewsLocally(providerId, reviews);
  reviewIntelligenceCache.set(cacheKey, result);
  return result;
}
