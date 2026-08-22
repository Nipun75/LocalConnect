// Provider Types for LocalConnect

export interface ProviderLocation {
  name: string; // e.g. "Dharampeth, Nagpur"
  area: string; // e.g. "Dharampeth"
  city: string; // e.g. "Nagpur"
  lat: number;
  lng: number;
  landmark?: string;
}

export interface ProviderAvailability {
  days: string[]; // ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]
  time_slots: ('morning' | 'afternoon' | 'evening' | 'flexible')[];
  specific_hours?: string; // e.g. "4:00 PM - 9:00 PM"
  is_available_today?: boolean;
  is_available_weekend?: boolean;
  emergency_service?: boolean;
}

export interface ProviderPricing {
  base_rate: number; // e.g. 450
  currency: string; // "INR"
  unit: 'session' | 'hour' | 'job' | 'month';
  display_string: string; // "₹450 / session"
  is_negotiable?: boolean;
}

export interface ReviewItem {
  id: string;
  author_name: string;
  author_avatar?: string;
  author_location?: string;
  rating: number; // 1 - 5
  date: string; // e.g. "2 weeks ago"
  text: string;
  tags?: string[]; // e.g. ["Punctual", "Patient Tutor", "Concept Clarity"]
  verified_job: boolean;
}

export interface TrustSignals {
  identity_verified: boolean;
  address_verified: boolean;
  skill_certified: boolean;
  completed_jobs_count: number;
  average_rating: number;
  review_count: number;
  response_rate_percent: number; // e.g. 96
  avg_response_time_minutes: number; // e.g. 15
  repeat_customers_count: number;
  cancellation_rate_percent: number; // e.g. 2
  community_endorsements_count: number;
  account_age_months: number;
}

export interface TrustScoreBreakdown {
  total_score: number; // 0 - 100
  identity_points: number; // Max 25
  experience_points: number; // Max 25 (jobs + repeat clients)
  rating_points: number; // Max 30 (rating + reviews)
  responsiveness_points: number; // Max 20 (response rate + time + low cancellation)
  badges: string[]; // e.g. ["Identity Verified", "Top Rated Local", "Fast Responder", "10+ Repeat Clients"]
  verification_reasons: string[];
}

export interface Provider {
  id: string;
  name: string;
  avatar: string;
  title: string; // e.g. "Class 11-12 Mathematics Specialist"
  category: string; // "Education", "Home Maintenance", "Creative & Tech", "Events & Catering", "Appliance Repair", "Fitness & Wellness"
  services: string[]; // e.g. ["Maths Tuition", "Physics Basics", "Board Exam Prep"]
  skills: string[]; // e.g. ["Calculus", "CBSE Syllabus", "State Board", "Concept Building"]
  bio: string;
  experience_years: number;
  pricing: ProviderPricing;
  location: ProviderLocation;
  service_radius_km: number;
  availability: ProviderAvailability;
  languages: string[]; // e.g. ["English", "Hindi", "Marathi"]
  mode: 'in_person' | 'online' | 'both';
  gender?: 'male' | 'female' | 'other';
  trust_signals: TrustSignals;
  trust_breakdown: TrustScoreBreakdown;
  reviews: ReviewItem[];
  phone_masked: string; // e.g. "+91 98•••• 1234"
  portfolio_items?: Array<{
    title: string;
    description: string;
    image_url?: string;
  }>;
}
