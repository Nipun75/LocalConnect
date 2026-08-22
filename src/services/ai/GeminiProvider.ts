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
} from '@/types/ai';
import { Provider, ReviewItem } from '@/types/provider';
import { LocalDeterministicProvider } from './LocalDeterministicProvider';

export class GeminiProvider implements AIProvider {
  public name = 'Google Gemini AI';
  private apiKey: string;
  private fallback: LocalDeterministicProvider;

  constructor(apiKey?: string) {
    this.apiKey =
      apiKey ||
      (typeof import.meta !== 'undefined' && import.meta.env?.VITE_GEMINI_API_KEY) ||
      '';
    this.fallback = new LocalDeterministicProvider();
  }

  public async isAvailable(): Promise<boolean> {
    return Boolean(this.apiKey && this.apiKey.length > 5);
  }

  private async callGemini(prompt: string, systemInstruction?: string): Promise<string> {
    if (!this.apiKey) {
      throw new Error('Gemini API key not configured');
    }

    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${this.apiKey}`;
    const body: any = {
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.2,
        responseMimeType: 'application/json',
      },
    };

    if (systemInstruction) {
      body.systemInstruction = {
        parts: [{ text: systemInstruction }],
      };
    }

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      throw new Error(`Gemini API returned status ${response.status}`);
    }

    const data = await response.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) {
      throw new Error('Empty response from Gemini');
    }
    return text;
  }

  public async parseRequirement(
    query: string,
    options?: ParseOptions
  ): Promise<ParsedRequirement> {
    try {
      if (!await this.isAvailable()) {
        return this.fallback.parseRequirement(query, options);
      }

      const systemPrompt = `You are the LocalConnect AI Need Parser for Indian Hyperlocal Services.
Parse the user's natural language input (English, Hinglish, or informal Hindi) into structured JSON.
Return JSON with this EXACT structure:
{
  "category": "string (e.g. Education & Tutors, Home Maintenance, Appliance Repair, Creative & Tech, Fitness & Wellness, Events & Catering)",
  "service": "string (e.g. Maths Tutor, Electrician, AC Repair & Service, Photographer)",
  "level_or_type": "string",
  "skills_required": ["string"],
  "location": {
    "name": "string (e.g. Dharampeth, Nagpur)",
    "area": "string",
    "radius_km": number
  },
  "budget": {
    "min": number or null,
    "max": number or null,
    "currency": "INR",
    "unit": "session | hour | job | month"
  },
  "schedule": {
    "date": "string or null",
    "time_slot": "morning | afternoon | evening | null",
    "days": ["Saturday", "Sunday"] or []
  },
  "urgency": "low | normal | urgent | immediate",
  "follow_up_question": "string or null if underspecified"
}`;

      const rawJson = await this.callGemini(`User Request: "${query}"`, systemPrompt);
      const parsed = JSON.parse(rawJson);

      const base = await this.fallback.parseRequirement(query, options);

      return {
        ...base,
        category: parsed.category || base.category,
        service: parsed.service || base.service,
        level_or_type: parsed.level_or_type || base.level_or_type,
        skills_required: parsed.skills_required || base.skills_required,
        budget: {
          ...base.budget,
          max: parsed.budget?.max ?? base.budget.max,
          min: parsed.budget?.min ?? base.budget.min,
          unit: parsed.budget?.unit || base.budget.unit,
        },
        schedule: {
          ...base.schedule,
          days: parsed.schedule?.days?.length ? parsed.schedule.days : base.schedule.days,
          time_slot: parsed.schedule?.time_slot || base.schedule.time_slot,
          date: parsed.schedule?.date || base.schedule.date,
        },
        urgency: parsed.urgency || base.urgency,
        follow_up_question: parsed.follow_up_question || base.follow_up_question,
      };
    } catch (err) {
      console.warn('[GeminiProvider] Fallback to deterministic parser:', err);
      return this.fallback.parseRequirement(query, options);
    }
  }

  public async refineRequirement(
    previous: ParsedRequirement,
    followupText: string
  ): Promise<ParsedRequirement> {
    return this.fallback.refineRequirement(previous, followupText);
  }

  public async generateMatchExplanation(
    requirement: ParsedRequirement,
    provider: Provider,
    scoreBreakdown: ScoreBreakdown,
    distanceKm: number
  ): Promise<MatchExplanation> {
    return this.fallback.generateMatchExplanation(requirement, provider, scoreBreakdown, distanceKm);
  }

  public async compareProviders(
    requirement: ParsedRequirement,
    matches: Array<{ provider: Provider; match: ProviderMatch }>
  ): Promise<ProviderComparison> {
    return this.fallback.compareProviders(requirement, matches);
  }

  public async enhanceProfile(
    request: ProfileEnhancementRequest
  ): Promise<ProfileEnhancementResult> {
    return this.fallback.enhanceProfile(request);
  }

  public async summarizeReviews(
    reviews: ReviewItem[],
    providerTitle: string
  ): Promise<ReviewSummary> {
    return this.fallback.summarizeReviews(reviews, providerTitle);
  }
}
