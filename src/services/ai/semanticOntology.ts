import { CATEGORIES } from '@/data/categories';

export interface SemanticMatchResult {
  categoryId: string;
  categoryName: string;
  serviceId: string;
  serviceName: string;
  matchedSkills: string[];
  semanticScore: number; // 0 - 1
  matchedTerm: string;
}

// Domain semantic map for concept expansion and Hinglish terms
const SEMANTIC_SYNONYM_MAP: Record<string, { category: string; service: string; skills: string[] }> = {
  // AC Repair
  'ac cooling': { category: 'appliance_repair', service: 'ac_technician', skills: ['AC Not Cooling Fix', 'Gas Leakage Detection', 'Jet Cleaning'] },
  'cooling nahi': { category: 'appliance_repair', service: 'ac_technician', skills: ['AC Not Cooling Fix', 'Split AC Gas Refill'] },
  'ac thanda': { category: 'appliance_repair', service: 'ac_technician', skills: ['AC Not Cooling Fix', 'Gas Leakage Detection'] },
  'ac service': { category: 'appliance_repair', service: 'ac_technician', skills: ['Jet Pump Cleaning', 'AC Service'] },
  'split ac': { category: 'appliance_repair', service: 'ac_technician', skills: ['Split AC Gas Refill', 'AC Installation'] },
  'hvac': { category: 'appliance_repair', service: 'ac_technician', skills: ['AC Repair', 'Compressor Repair'] },
  'gas charging': { category: 'appliance_repair', service: 'ac_technician', skills: ['Split AC Gas Refill', 'Gas Leakage Detection'] },
  'ac not working': { category: 'appliance_repair', service: 'ac_technician', skills: ['AC Repair', 'PCB Board Repair'] },

  // Maths Tutor
  'maths': { category: 'education', service: 'maths_tutor', skills: ['Class 11-12 Maths', 'Calculus', 'Algebra'] },
  'math': { category: 'education', service: 'maths_tutor', skills: ['Class 11-12 Maths', 'Algebra'] },
  'mathematics': { category: 'education', service: 'maths_tutor', skills: ['Class 11-12 Maths', 'Calculus', 'CBSE Syllabus'] },
  'calculus': { category: 'education', service: 'maths_tutor', skills: ['Calculus', 'Class 11-12 Maths'] },
  'ganit': { category: 'education', service: 'maths_tutor', skills: ['Class 10 Maths', 'Class 11-12 Maths'] },
  '12th maths': { category: 'education', service: 'maths_tutor', skills: ['Class 11-12 Maths', 'Calculus', 'CBSE Syllabus'] },
  '10th maths': { category: 'education', service: 'maths_tutor', skills: ['Class 10 Maths', 'CBSE Board'] },
  'class 12': { category: 'education', service: 'maths_tutor', skills: ['Class 11-12 Maths', 'Board Exam Prep'] },
  'cbse tutor': { category: 'education', service: 'maths_tutor', skills: ['CBSE Syllabus', 'Board Exam Prep'] },

  // Coding & Computer
  'teach coding': { category: 'education', service: 'coding_instructor', skills: ['Python Tutor', 'Kids Coding', 'Logic Building'] },
  'coding to my kid': { category: 'education', service: 'coding_instructor', skills: ['Kids Coding', 'Python', 'Scratch for Kids'] },
  'python': { category: 'education', service: 'coding_instructor', skills: ['Python', 'Data Structures'] },
  'programming': { category: 'education', service: 'coding_instructor', skills: ['Python', 'Logic Building', 'Web Development'] },
  'kids coding': { category: 'education', service: 'coding_instructor', skills: ['Scratch for Kids', 'Logic Building'] },

  // Electrician
  'electrician': { category: 'home_maintenance', service: 'electrician', skills: ['Short Circuit Repair', 'Switchboard Installation'] },
  'bijli': { category: 'home_maintenance', service: 'electrician', skills: ['Short Circuit Repair', 'Wiring Diagnostics'] },
  'short circuit': { category: 'home_maintenance', service: 'electrician', skills: ['Short Circuit Repair', 'Emergency Repair'] },
  'light fitting': { category: 'home_maintenance', service: 'electrician', skills: ['Fan & Light Fitting', 'Switchboard Repair'] },
  'mcb trip': { category: 'home_maintenance', service: 'electrician', skills: ['MCB Replacement', 'Short Circuit Repair'] },
  'inverter': { category: 'home_maintenance', service: 'electrician', skills: ['Inverter Installation', 'Inverter Wiring'] },

  // Photography
  'photographer': { category: 'creative_tech', service: 'photographer', skills: ['Candid Wedding', 'Natural Light Portraits'] },
  'wedding photo': { category: 'creative_tech', service: 'photographer', skills: ['Candid Wedding', 'Pre-Wedding Shoot'] },
  'photoshoot': { category: 'creative_tech', service: 'photographer', skills: ['Candid Event Coverage', 'Portrait Photography'] },
  'candid': { category: 'creative_tech', service: 'photographer', skills: ['Candid Wedding', 'Color Grading'] },

  // Yoga & Fitness
  'yoga': { category: 'fitness_wellness', service: 'yoga_instructor', skills: ['Hatha Yoga', 'Pranayama', 'Home Sessions'] },
  'female yoga': { category: 'fitness_wellness', service: 'yoga_instructor', skills: ['Women Health', 'Home Sessions', 'Postnatal Recovery'] },
  'back pain': { category: 'fitness_wellness', service: 'yoga_instructor', skills: ['Postural Alignment', 'Pain Relief'] },
  'trainer': { category: 'fitness_wellness', service: 'fitness_trainer', skills: ['Strength Training', 'Bodyweight HIIT'] },

  // Cook / Home Chef
  'home chef': { category: 'events_catering', service: 'home_chef', skills: ['Party Catering', 'North Indian Cuisine'] },
  'cook for': { category: 'events_catering', service: 'home_chef', skills: ['Party Catering', 'Custom Menu'] },
  'chef for 10': { category: 'events_catering', service: 'home_chef', skills: ['Party Catering 10-50 Pax', 'Maharashtrian Specialities'] },
  'party catering': { category: 'events_catering', service: 'home_chef', skills: ['Party Catering', 'North Indian Curries'] },
  'khana banane': { category: 'events_catering', service: 'home_chef', skills: ['North Indian Cuisine', 'Party Catering'] },

  // Laptop
  'laptop repair': { category: 'appliance_repair', service: 'laptop_repair', skills: ['Screen Replacement', 'OS Reinstall', 'SSD Upgrade'] },
  'repair my laptop': { category: 'appliance_repair', service: 'laptop_repair', skills: ['Motherboard Diagnosis', 'OS Reinstall'] },
  'computer repair': { category: 'appliance_repair', service: 'laptop_repair', skills: ['Screen Replacement', 'SSD Upgrade'] },
};

// Tokenizer and stop words
const STOP_WORDS = new Set([
  'i', 'need', 'a', 'an', 'the', 'for', 'my', 'near', 'within', 'around', 'budget',
  'is', 'to', 'in', 'on', 'at', 'please', 'help', 'me', 'find', 'looking', 'chahiye',
  'bhai', 'ek', 'koi', 'hai', 'kare', 'mujhe', 'mere', 'paas', 'ke', 'andar', 'mein'
]);

export function cleanAndTokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^\w\s₹]/g, ' ')
    .split(/\s+/)
    .filter((token) => token.length > 1 && !STOP_WORDS.has(token));
}

// Calculate N-gram Jaccard / Cosine Semantic Similarity
export function calculateSemanticOverlap(query: string, targetPhrases: string[]): number {
  const queryTokens = new Set(cleanAndTokenize(query));
  if (queryTokens.size === 0) return 0;

  let maxScore = 0;
  for (const phrase of targetPhrases) {
    const phraseTokens = new Set(cleanAndTokenize(phrase));
    if (phraseTokens.size === 0) continue;

    let intersection = 0;
    for (const token of queryTokens) {
      if (phraseTokens.has(token)) {
        intersection++;
      } else {
        // Check for substring / stem match
        for (const pt of phraseTokens) {
          if (pt.includes(token) || token.includes(pt)) {
            intersection += 0.8;
            break;
          }
        }
      }
    }

    const union = queryTokens.size + phraseTokens.size - intersection;
    const score = union > 0 ? intersection / union : 0;
    if (score > maxScore) maxScore = score;
  }

  return Math.min(1, maxScore);
}

// Identify category & service using semantic map and catalog
export function findBestSemanticService(query: string): SemanticMatchResult {
  const lower = query.toLowerCase();

  // 1. Direct Semantic Map Check
  for (const [key, mapping] of Object.entries(SEMANTIC_SYNONYM_MAP)) {
    if (lower.includes(key)) {
      const cat = CATEGORIES.find((c) => c.id === mapping.category);
      const serv = cat?.services.find((s) => s.id === mapping.service);
      return {
        categoryId: mapping.category,
        categoryName: cat?.name || 'Local Services',
        serviceId: mapping.service,
        serviceName: serv?.name || 'Specialist',
        matchedSkills: mapping.skills,
        semanticScore: 0.95,
        matchedTerm: key,
      };
    }
  }

  // 2. Catalog Synonyms Search with Semantic Scoring
  let bestMatch: SemanticMatchResult | null = null;
  let highestScore = 0;

  for (const cat of CATEGORIES) {
    for (const serv of cat.services) {
      const score = calculateSemanticOverlap(query, [serv.name, ...serv.synonyms, ...serv.common_skills]);
      if (score > highestScore) {
        highestScore = score;
        bestMatch = {
          categoryId: cat.id,
          categoryName: cat.name,
          serviceId: serv.id,
          serviceName: serv.name,
          matchedSkills: serv.common_skills.slice(0, 3),
          semanticScore: score,
          matchedTerm: serv.name,
        };
      }
    }
  }

  if (bestMatch && highestScore >= 0.25) {
    return bestMatch;
  }

  // Default fallback if entirely ambiguous
  return {
    categoryId: 'education',
    categoryName: 'Education & Tutors',
    serviceId: 'maths_tutor',
    serviceName: 'Maths Tutor',
    matchedSkills: ['General Tutoring'],
    semanticScore: 0.4,
    matchedTerm: 'tutor',
  };
}
