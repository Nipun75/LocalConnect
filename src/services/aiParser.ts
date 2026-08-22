// LocalConnect AI Natural Language Requirement Parser

export interface ParsedNeed {
  category?: string;
  service?: string;
  skills?: string[];
  level?: string;
  location?: string;
  radius_km?: number | null;
  budget_min?: number | null;
  budget_max?: number | null;
  currency?: string;
  date?: string | null;
  time?: string | null;
  availability?: {
    days?: string[];
    time?: string | null;
  };
  urgency?: string | null;
  keywords?: string[];
  raw_query: string;
}

// Domain dictionary for hyperlocal services & Hinglish patterns
export const SERVICE_ONTOLOGY: Record<
  string,
  { category: string; service: string; skills: string[]; level?: string }
> = {
  // Maths & Tutoring
  maths: {
    category: 'education',
    service: 'maths tutor',
    skills: ['mathematics', 'calculus', 'algebra'],
  },
  math: {
    category: 'education',
    service: 'maths tutor',
    skills: ['mathematics', 'algebra'],
  },
  mathematics: {
    category: 'education',
    service: 'maths tutor',
    skills: ['mathematics', 'calculus'],
  },
  ganit: {
    category: 'education',
    service: 'maths tutor',
    skills: ['mathematics'],
  },
  tutor: {
    category: 'education',
    service: 'home tutor',
    skills: ['tutoring', 'teaching'],
  },
  tuition: {
    category: 'education',
    service: 'home tutor',
    skills: ['tutoring'],
  },

  // Electrician & Home Repairs
  electrician: {
    category: 'home maintenance',
    service: 'electrician',
    skills: ['wiring', 'short circuit repair', 'switchboard repair'],
  },
  bijli: {
    category: 'home maintenance',
    service: 'electrician',
    skills: ['wiring', 'electrical repair'],
  },
  'short circuit': {
    category: 'home maintenance',
    service: 'electrician',
    skills: ['short circuit repair', 'emergency electrical'],
  },
  plumber: {
    category: 'home maintenance',
    service: 'plumber',
    skills: ['pipe leakage', 'tap repair', 'drainage'],
  },
  carpenter: {
    category: 'home maintenance',
    service: 'carpenter',
    skills: ['furniture repair', 'door lock repair'],
  },

  // AC & Appliance Repair
  ac: {
    category: 'appliance repair',
    service: 'AC repair',
    skills: ['AC servicing', 'cooling diagnosis', 'gas refilling'],
  },
  'air conditioner': {
    category: 'appliance repair',
    service: 'AC repair',
    skills: ['AC servicing', 'gas charging'],
  },
  'washing machine': {
    category: 'appliance repair',
    service: 'washing machine repair',
    skills: ['motor repair', 'drum fix'],
  },
  'laptop repair': {
    category: 'appliance repair',
    service: 'laptop repair',
    skills: ['hardware diagnostics', 'screen repair', 'OS reinstall'],
  },
  laptop: {
    category: 'appliance repair',
    service: 'laptop repair',
    skills: ['computer diagnostics', 'hardware repair'],
  },
  computer: {
    category: 'appliance repair',
    service: 'computer repair',
    skills: ['PC troubleshooting', 'software install'],
  },

  // Creative & Events
  photographer: {
    category: 'creative & tech',
    service: 'photographer',
    skills: ['photography', 'portrait', 'lighting'],
  },
  photography: {
    category: 'creative & tech',
    service: 'photographer',
    skills: ['event coverage', 'photoshoot'],
  },
  photoshoot: {
    category: 'creative & tech',
    service: 'photographer',
    skills: ['portrait photography', 'editing'],
  },
  'ui designer': {
    category: 'creative & tech',
    service: 'UI designer',
    skills: ['Figma', 'UI/UX design', 'prototyping'],
  },
  'home chef': {
    category: 'events & catering',
    service: 'home chef',
    skills: ['party cooking', 'catering'],
  },
  cook: {
    category: 'events & catering',
    service: 'home cook',
    skills: ['meal prep', 'catering'],
  },

  // Fitness & Wellness
  yoga: {
    category: 'fitness & wellness',
    service: 'yoga instructor',
    skills: ['yoga', 'pranayama', 'meditation'],
  },
  'fitness trainer': {
    category: 'fitness & wellness',
    service: 'fitness trainer',
    skills: ['personal training', 'workout coaching'],
  },
};

/**
 * Deterministic Natural Language Parser
 * Robust offline parsing for English, Indian English & Hinglish
 */
export function parseNeedLocally(rawQuery: string): ParsedNeed {
  const query = rawQuery.trim();
  const lower = query.toLowerCase();

  // 1. Service & Category Extraction
  let matchedCategory = 'general';
  let matchedService = 'general service';
  let matchedSkills: string[] = [];

  for (const [term, data] of Object.entries(SERVICE_ONTOLOGY)) {
    if (lower.includes(term)) {
      matchedCategory = data.category;
      matchedService = data.service;
      matchedSkills = [...data.skills];
      break;
    }
  }

  // 2. Class / Education Level Extraction
  let level: string | undefined;
  if (lower.includes('12th') || lower.includes('class 12') || lower.includes('12th-standard') || lower.includes('12th class')) {
    level = 'class 12';
    if (matchedCategory === 'education') {
      matchedSkills.unshift('class 12 mathematics');
    }
  } else if (lower.includes('10th') || lower.includes('class 10') || lower.includes('10th-standard') || lower.includes('10th class')) {
    level = 'class 10';
    if (matchedCategory === 'education') {
      matchedSkills.unshift('class 10 mathematics');
    }
  } else if (lower.includes('wedding')) {
    level = 'wedding';
    matchedService = 'wedding photographer';
  } else if (lower.includes('emergency')) {
    level = 'emergency';
  }

  // 3. Location & Radius Extraction
  let location = 'current_location';
  let radiusKm: number | null = null;

  const radiusMatch = query.match(/(\d+)\s*(?:km|k\.m\.|kilometer|kilometre|kms)/i);
  if (radiusMatch) {
    radiusKm = parseInt(radiusMatch[1], 10);
  } else if (lower.includes('ghar ke paas') || lower.includes('very close') || lower.includes('walking distance')) {
    radiusKm = 2;
  } else if (lower.includes('near me') || lower.includes('nearby') || lower.includes('paas')) {
    radiusKm = 5;
  }

  const knownAreas = ['dharampeth', 'sitabuldi', 'ramdaspeth', 'sadar', 'manish nagar', 'pratap nagar', 'civil lines'];
  for (const area of knownAreas) {
    if (lower.includes(area)) {
      location = area.charAt(0).toUpperCase() + area.slice(1);
      break;
    }
  }

  // 4. Budget Extraction (e.g. ₹500, 500 rupees, 500 ke andar, 10k, 10000, 500-1000)
  let budgetMin: number | null = null;
  let budgetMax: number | null = null;

  // Handle '10k', '5k' notation
  const kMatch = query.match(/(\d+)\s*k\b/i);
  if (kMatch) {
    budgetMax = parseInt(kMatch[1], 10) * 1000;
  } else {
    // Range: 500 - 1000 or 500 to 1000
    const rangeMatch = query.match(/(?:₹|rs\.?|inr)?\s*(\d{2,6})\s*(?:-|to|se)\s*(?:₹|rs\.?|inr)?\s*(\d{2,6})/i);
    if (rangeMatch) {
      budgetMin = parseInt(rangeMatch[1], 10);
      budgetMax = parseInt(rangeMatch[2], 10);
    } else {
      // Single price: under 500, around 1000, 500 ke andar, ₹500
      const singlePriceMatch =
        query.match(/(?:under|less than|around|approx|upto|max|budget|around ₹|₹|rs\.?|inr|ke andar)\s*(\d{2,6})/i) ||
        query.match(/(\d{2,6})\s*(?:₹|rs|rupees|inr|ke andar|per session|per job|\/session|\/job)/i);

      if (singlePriceMatch) {
        budgetMax = parseInt(singlePriceMatch[1], 10);
      } else if (lower.includes('cheap') || lower.includes('sasta') || lower.includes('affordable')) {
        budgetMax = matchedCategory === 'education' ? 450 : 500;
      }
    }
  }

  // 5. Schedule & Timing Extraction
  const days: string[] = [];
  if (lower.includes('weekend') || lower.includes('saturday') || lower.includes('sunday')) {
    if (lower.includes('saturday')) days.push('Saturday');
    if (lower.includes('sunday')) days.push('Sunday');
    if (days.length === 0) days.push('Saturday', 'Sunday');
  }
  if (lower.includes('next sunday')) {
    days.push('Sunday');
  }

  let time: string | null = null;
  if (lower.includes('evening') || lower.includes('shaam')) time = 'evening';
  else if (lower.includes('morning') || lower.includes('subah')) time = 'morning';
  else if (lower.includes('afternoon') || lower.includes('dopahar')) time = 'afternoon';

  let date: string | null = null;
  if (lower.includes('tomorrow') || lower.includes('kal')) date = 'tomorrow';
  else if (lower.includes('today') || lower.includes('aaj')) date = 'today';
  else if (lower.includes('next sunday')) date = 'next Sunday';

  // 6. Urgency Extraction
  let urgency: string | null = null;
  if (lower.includes('emergency') || lower.includes('urgent') || lower.includes('right now') || lower.includes('jaldi')) {
    urgency = 'urgent';
  }

  // 7. Keywords Generation
  const keywords = query
    .toLowerCase()
    .replace(/[^\w\s₹]/g, ' ')
    .split(/\s+/)
    .filter((w) => w.length > 2 && !['need', 'the', 'for', 'and', 'with', 'from', 'chahiye', 'bhai', 'wala', 'wali', 'near'].includes(w));

  return {
    category: matchedCategory,
    service: matchedService,
    skills: matchedSkills.length > 0 ? matchedSkills : undefined,
    level,
    location,
    radius_km: radiusKm,
    budget_min: budgetMin,
    budget_max: budgetMax,
    currency: 'INR',
    date,
    time,
    availability: days.length > 0 || time ? { days: days.length > 0 ? days : undefined, time } : undefined,
    urgency,
    keywords,
    raw_query: query,
  };
}

/**
 * Main AI Need Parser Function
 * Tries server/API first if configured, with instant fallback to deterministic NLP.
 */
export async function parseNeedWithAI(query: string): Promise<ParsedNeed> {
  const envProcess = (globalThis as any).process;
  const apiKey =
    (envProcess && envProcess.env && (envProcess.env.AI_API_KEY || envProcess.env.GEMINI_API_KEY)) ||
    ((import.meta as any).env && ((import.meta as any).env.VITE_AI_API_KEY || (import.meta as any).env.VITE_GEMINI_API_KEY)) ||
    '';

  if (!apiKey || apiKey.length < 5) {
    // Graceful offline deterministic fallback
    return parseNeedLocally(query);
  }

  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
    const systemPrompt = `You are the LocalConnect AI Requirement Parser. Convert the user's natural language request (English/Hinglish/informal) into structured JSON strictly following this schema:
{
  "category": "education | home maintenance | appliance repair | creative & tech | fitness & wellness | events & catering",
  "service": "string",
  "skills": ["string"],
  "level": "string or null",
  "location": "string or 'current_location'",
  "radius_km": number or null,
  "budget_min": number or null,
  "budget_max": number or null,
  "currency": "INR",
  "date": "string or null",
  "time": "string or null",
  "availability": {
    "days": ["Saturday", "Sunday"] or [],
    "time": "string or null"
  },
  "urgency": "urgent | normal | null",
  "keywords": ["string"]
}`;

    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ role: 'user', parts: [{ text: query }] }],
        systemInstruction: { parts: [{ text: systemPrompt }] },
        generationConfig: { responseMimeType: 'application/json', temperature: 0.1 },
      }),
    });

    if (!res.ok) {
      throw new Error(`API status ${res.status}`);
    }

    const data = await res.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) throw new Error('Empty AI response');

    const parsed = JSON.parse(text);
    return {
      ...parsed,
      raw_query: query,
    };
  } catch (err) {
    console.warn('[AIParser] API call failed, using deterministic local parser fallback:', err);
    return parseNeedLocally(query);
  }
}

export {
  extractRefinementDeltaLocally,
  mergeRequirements,
  refineNeedWithAI,
  type RefinementDelta,
} from './ai/refinementEngine';

