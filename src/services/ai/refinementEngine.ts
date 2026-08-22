// LocalConnect AI Conversational Search Refinement Engine
// Deterministic Refinement Delta Extraction + Merge Layer

import { ParsedNeed } from '@/services/aiParser';
import { resolveLocationFromQuery } from '@/data/locations';

export interface RefinementDelta {
  action: 'update_search' | 'clarify';
  changes: Partial<ParsedNeed>;
  removed?: (keyof ParsedNeed)[];
  reason?: string;
  followUpQuestion?: string;
}

/**
 * Deterministic Refinement Delta Extractor
 * Understands natural language modifications:
 * 1. Addition (e.g., "for class 12", "need calculus skills")
 * 2. Filter (e.g., "only under ₹500", "within 3 km")
 * 3. Change / Override (e.g., "actually make it 800", "make it 2 km")
 * 4. Removal (e.g., "budget doesn't matter", "any day is fine")
 * 5. Location change (e.g., "search near Baner", "in Sitabuldi")
 * 6. Pronouns & context (e.g., "for a wedding", "only weekends")
 * 7. Hinglish patterns (e.g., "bhai Sunday ko available hona chahiye", "sasta wala")
 */
export function extractRefinementDeltaLocally(current: ParsedNeed, input: string): RefinementDelta {
  const query = input.trim();
  const lower = query.toLowerCase();
  const changes: Partial<ParsedNeed> = {};
  const removed: (keyof ParsedNeed)[] = [];
  let reason = 'User refined search criteria';

  // 1. REMOVALS / CLEAR CONSTRAINTS
  // Budget removal
  if (
    lower.includes("budget doesn't matter") ||
    lower.includes('no budget limit') ||
    lower.includes('budget does not matter') ||
    lower.includes('budget ki koi dikkat nahi') ||
    lower.includes('any budget') ||
    lower.includes('ignore budget') ||
    lower.includes('remove budget') ||
    lower.includes('no price limit')
  ) {
    removed.push('budget_max', 'budget_min');
    reason = 'Removed budget constraint';
  }

  // Schedule removal
  if (
    lower.includes('any day') ||
    lower.includes('anytime') ||
    lower.includes('any day is fine') ||
    lower.includes('no day preference') ||
    lower.includes('kisi bhi din')
  ) {
    removed.push('availability', 'date', 'time');
    reason = 'Removed schedule constraint';
  }

  // Distance removal
  if (
    lower.includes('any distance') ||
    lower.includes('distance does not matter') ||
    lower.includes('no distance limit')
  ) {
    removed.push('radius_km');
    reason = 'Removed distance constraint';
  }

  // 2. BUDGET CHANGES & FILTERS (e.g. "under 500", "make it 800", "budget 1000", "sasta", "cheaper")
  if (!removed.includes('budget_max')) {
    const numMatch =
      query.match(/(?:₹|rs\.?|inr|under|upto|max|budget|make it|around|ke andar)\s*(\d{2,6})/i) ||
      query.match(/(\d{2,6})\s*(?:₹|rs|rupees|inr|ke andar)/i);

    const kMatch = query.match(/(\d+)\s*k\b/i);

    if (kMatch) {
      changes.budget_max = parseInt(kMatch[1], 10) * 1000;
      reason = `Updated maximum budget to ₹${changes.budget_max}`;
    } else if (numMatch) {
      changes.budget_max = parseInt(numMatch[1], 10);
      reason = `Updated maximum budget to ₹${changes.budget_max}`;
    } else if (lower.includes('cheaper') || lower.includes('sasta') || lower.includes('lower price') || lower.includes('show cheaper')) {
      if (current.budget_max) {
        changes.budget_max = Math.max(300, current.budget_max - 100);
      } else {
        changes.budget_max = 450;
      }
      reason = 'Adjusted preference for more affordable rates';
    }
  }

  // 3. SCHEDULE & AVAILABILITY (e.g. "Only Sunday", "weekends", "bhai Sunday ko available hona chahiye", "tomorrow")
  if (!removed.includes('availability')) {
    const days: string[] = [];
    if (lower.includes('sunday')) days.push('Sunday');
    if (lower.includes('saturday')) days.push('Saturday');
    if (lower.includes('weekend') && days.length === 0) days.push('Saturday', 'Sunday');
    if (lower.includes('monday')) days.push('Monday');
    if (lower.includes('tuesday')) days.push('Tuesday');
    if (lower.includes('wednesday')) days.push('Wednesday');
    if (lower.includes('thursday')) days.push('Thursday');
    if (lower.includes('friday')) days.push('Friday');

    if (days.length > 0) {
      changes.availability = {
        days,
        time: current.availability?.time || null,
      };
      reason = `Set availability requirement to ${days.join(' & ')}`;
    }

    if (lower.includes('tomorrow') || lower.includes('kal')) {
      changes.date = 'tomorrow';
      reason = 'Set preferred date to tomorrow';
    } else if (lower.includes('today') || lower.includes('aaj')) {
      changes.date = 'today';
      reason = 'Set preferred date to today';
    }

    if (lower.includes('evening') || lower.includes('shaam')) {
      changes.time = 'evening';
    } else if (lower.includes('morning') || lower.includes('subah')) {
      changes.time = 'morning';
    }
  }

  // 4. DISTANCE & RADIUS (e.g. "within 2 km", "make it 2 km", "closest", "near me")
  if (!removed.includes('radius_km')) {
    const radiusMatch = query.match(/(\d+)\s*(?:km|k\.m\.|kilometer|kms)/i);
    if (radiusMatch) {
      changes.radius_km = parseInt(radiusMatch[1], 10);
      reason = `Set search radius to ${changes.radius_km} km`;
    } else if (lower.includes('closest') || lower.includes('very close') || lower.includes('ghar ke paas') || lower.includes('walking distance')) {
      changes.radius_km = 2;
      reason = 'Prioritized closest providers within 2 km';
    }
  }

  // 5. LOCATION CHANGE (e.g. "search near Baner", "in Sitabuldi", "in Ramdaspeth")
  const areaKeywords = ['in', 'near', 'at', 'around', 'search near', 'search in'];
  const hasLocationIntent = areaKeywords.some((k) => lower.includes(k)) || lower.includes('instead');
  if (hasLocationIntent) {
    const resolved = resolveLocationFromQuery(query);
    if (resolved.name.toLowerCase() !== 'dharampeth' || lower.includes('dharampeth')) {
      changes.location = resolved.name;
      reason = `Changed location to ${resolved.name}`;
    } else {
      // Check for custom location names like "Baner" or "Pune"
      const banerMatch = query.match(/(?:near|in|at)\s+([A-Za-z]+)/i);
      if (banerMatch && !['me', 'home', 'my', 'the'].includes(banerMatch[1].toLowerCase())) {
        changes.location = banerMatch[1].charAt(0).toUpperCase() + banerMatch[1].slice(1);
        reason = `Changed location to ${changes.location}`;
      }
    }
  }

  // 6. EDUCATION LEVEL / CLASS (e.g. "for class 12", "12th standard", "class 10")
  if (lower.includes('12th') || lower.includes('class 12') || lower.includes('12th standard')) {
    changes.level = 'class 12';
    const skills = current.skills ? [...current.skills] : [];
    if (!skills.includes('class 12 mathematics')) skills.unshift('class 12 mathematics');
    changes.skills = skills;
    reason = 'Added Class 12 requirement';
  } else if (lower.includes('10th') || lower.includes('class 10') || lower.includes('10th standard')) {
    changes.level = 'class 10';
    const skills = current.skills ? [...current.skills] : [];
    if (!skills.includes('class 10 mathematics')) skills.unshift('class 10 mathematics');
    changes.skills = skills;
    reason = 'Added Class 10 requirement';
  }

  // 7. SERVICE & CATEGORY CONTEXTUAL UPDATE (e.g. "for a wedding", "actually wedding photographer", "laptop repair")
  if (lower.includes('wedding')) {
    changes.level = 'wedding';
    changes.service = 'wedding photographer';
    changes.category = 'creative & tech';
    reason = 'Refined service to Wedding Photography';
  } else if (lower.includes('emergency') || lower.includes('short circuit')) {
    changes.urgency = 'urgent';
    changes.level = 'emergency';
    reason = 'Marked request as urgent emergency';
  }

  return {
    action: 'update_search',
    changes,
    removed: removed.length > 0 ? removed : undefined,
    reason,
  };
}

/**
 * Deterministic Requirement Merge Function
 * Pure function: Combines current requirement with refinement delta without corrupting state.
 */
export function mergeRequirements(current: ParsedNeed, delta: RefinementDelta): ParsedNeed {
  const updated: ParsedNeed = { ...current };

  // 1. Process explicit removals
  if (delta.removed && delta.removed.length > 0) {
    for (const key of delta.removed) {
      delete (updated as any)[key];
    }
  }

  // 2. Apply updates / changes
  if (delta.changes) {
    for (const [key, value] of Object.entries(delta.changes)) {
      if (value !== undefined) {
        (updated as any)[key] = value;
      }
    }
  }

  // 3. Update raw_query representation to reflect history
  updated.raw_query = `${current.raw_query} → [Refined: ${delta.reason || 'Criteria updated'}]`;

  return updated;
}

/**
 * Full AI Refinement Function
 * Attempts Gemini API refinement if configured, with instant fallback to deterministic extractor.
 */
export async function refineNeedWithAI(current: ParsedNeed, followupQuery: string): Promise<ParsedNeed> {
  const envProcess = (globalThis as any).process;
  const apiKey =
    (envProcess && envProcess.env && (envProcess.env.AI_API_KEY || envProcess.env.GEMINI_API_KEY)) ||
    ((import.meta as any).env && ((import.meta as any).env.VITE_AI_API_KEY || (import.meta as any).env.VITE_GEMINI_API_KEY)) ||
    '';

  if (!apiKey || apiKey.length < 5) {
    // Offline deterministic refinement
    const delta = extractRefinementDeltaLocally(current, followupQuery);
    return mergeRequirements(current, delta);
  }

  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
    const systemPrompt = `You are the LocalConnect Conversational Search Refinement AI.
Given the CURRENT SEARCH REQUIREMENT and the USER'S REFINEMENT MESSAGE, output a JSON modification delta with:
{
  "action": "update_search",
  "changes": {
    "category": string (optional),
    "service": string (optional),
    "level": string (optional),
    "budget_max": number (optional),
    "radius_km": number (optional),
    "location": string (optional),
    "availability": { "days": ["Sunday"] } (optional),
    "date": string (optional),
    "time": string (optional),
    "urgency": string (optional)
  },
  "removed": ["budget_max", "availability", etc] (if user said "budget doesn't matter", etc),
  "reason": "Brief summary of change"
}`;

    const promptPayload = `Current Requirement: ${JSON.stringify(current)}\nUser Refinement: "${followupQuery}"`;

    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ role: 'user', parts: [{ text: promptPayload }] }],
        systemInstruction: { parts: [{ text: systemPrompt }] },
        generationConfig: { responseMimeType: 'application/json', temperature: 0.1 },
      }),
    });

    if (!res.ok) throw new Error(`API status ${res.status}`);

    const data = await res.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) throw new Error('Empty AI refinement response');

    const delta: RefinementDelta = JSON.parse(text);
    return mergeRequirements(current, delta);
  } catch (err) {
    console.warn('[RefinementEngine] API call failed, using deterministic local refinement fallback:', err);
    const delta = extractRefinementDeltaLocally(current, followupQuery);
    return mergeRequirements(current, delta);
  }
}
