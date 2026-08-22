// Categories & Taxonomy for LocalConnect

export interface ServiceCategory {
  id: string;
  name: string;
  icon: string;
  description: string;
  services: {
    id: string;
    name: string;
    typical_budget_min: number;
    typical_budget_max: number;
    budget_unit: 'session' | 'hour' | 'job' | 'month';
    common_skills: string[];
    synonyms: string[];
  }[];
}

export const CATEGORIES: ServiceCategory[] = [
  {
    id: 'education',
    name: 'Education & Tutors',
    icon: '📚',
    description: 'Expert private tutors, board exam coaches, language instructors & coding teachers',
    services: [
      {
        id: 'maths_tutor',
        name: 'Maths Tutor',
        typical_budget_min: 300,
        typical_budget_max: 800,
        budget_unit: 'session',
        common_skills: ['Class 10 Maths', 'Class 11-12 Maths', 'Calculus', 'Algebra', 'CBSE Board', 'State Board', 'ICSE', 'Vedic Maths'],
        synonyms: ['maths tutor', 'maths tuition', 'mathematics teacher', 'math sir', 'ganit teacher', 'maths teacher', 'class 12 maths', 'class 10 maths', '12th standard brother maths'],
      },
      {
        id: 'science_physics_tutor',
        name: 'Physics & Chemistry Tutor',
        typical_budget_min: 400,
        typical_budget_max: 900,
        budget_unit: 'session',
        common_skills: ['Class 11-12 Physics', 'Organic Chemistry', 'NEET Prep', 'JEE Foundation', 'CBSE'],
        synonyms: ['physics tutor', 'chemistry tutor', 'science tuition', 'neet physics', 'physics sir'],
      },
      {
        id: 'coding_instructor',
        name: 'Coding & Programming Tutor',
        typical_budget_min: 500,
        typical_budget_max: 1200,
        budget_unit: 'session',
        common_skills: ['Python', 'JavaScript', 'Scratch for Kids', 'Web Development', 'Data Structures', 'C++'],
        synonyms: ['teach coding to my kid', 'coding tutor', 'python tutor', 'programming tutor', 'computer science tutor', 'coding instructor', 'kids coding'],
      },
      {
        id: 'english_language_trainer',
        name: 'Spoken English & Communication',
        typical_budget_min: 350,
        typical_budget_max: 700,
        budget_unit: 'session',
        common_skills: ['Spoken English', 'Accent & Fluency', 'IELTS Prep', 'Public Speaking', 'Grammar'],
        synonyms: ['spoken english', 'english tutor', 'english speaking', 'english communication', 'ielts trainer'],
      },
    ],
  },
  {
    id: 'home_maintenance',
    name: 'Home Maintenance',
    icon: '🔧',
    description: 'Verified electricians, plumbers, carpenters, and emergency home repair technicians',
    services: [
      {
        id: 'electrician',
        name: 'Electrician',
        typical_budget_min: 200,
        typical_budget_max: 800,
        budget_unit: 'job',
        common_skills: ['Short Circuit Repair', 'Switchboard Installation', 'Ceiling Fan Repair', 'Inverter Wiring', 'Emergency Repair'],
        synonyms: ['electrician', 'bijli wala', 'light repair', 'short circuit', 'fan fitting', 'wiring problem', 'emergency electrician', 'switch board'],
      },
      {
        id: 'plumber',
        name: 'Plumber',
        typical_budget_min: 250,
        typical_budget_max: 900,
        budget_unit: 'job',
        common_skills: ['Pipe Leakage Fix', 'Tap Replacement', 'Bathroom Fitting', 'Water Motor Repair', 'Drain Cleaning'],
        synonyms: ['plumber', 'leaking tap', 'nal repair', 'paani tapak raha', 'drain blockage', 'pipe leak', 'water tank pipe'],
      },
      {
        id: 'carpenter',
        name: 'Carpenter',
        typical_budget_min: 300,
        typical_budget_max: 1500,
        budget_unit: 'job',
        common_skills: ['Furniture Assembly', 'Door Lock Repair', 'Modular Kitchen Fitting', 'Wooden Wardrobe Repair'],
        synonyms: ['carpenter', 'badhai', 'door lock repair', 'furniture repair', 'cupboard repair', 'table fix'],
      },
    ],
  },
  {
    id: 'appliance_repair',
    name: 'Appliance Repair',
    icon: '❄️',
    description: 'Specialists for Air Conditioners, Washing Machines, Refrigerators, and Microwave Ovens',
    services: [
      {
        id: 'ac_technician',
        name: 'AC Repair & Service',
        typical_budget_min: 500,
        typical_budget_max: 1800,
        budget_unit: 'job',
        common_skills: ['Split AC Gas Refill', 'AC Not Cooling Fix', 'Jet Pump Cleaning', 'PCB Board Repair', 'AC Installation'],
        synonyms: ['ac repair', 'ac service', 'ac isn\'t cooling', 'air conditioner service', 'split ac technician', 'hvac technician', 'ac gas charging', 'ac thanda nahi kar raha'],
      },
      {
        id: 'washing_machine_repair',
        name: 'Washing Machine Repair',
        typical_budget_min: 400,
        typical_budget_max: 1200,
        budget_unit: 'job',
        common_skills: ['Front Load Repair', 'Top Load Repair', 'Drum Not Spinning Fix', 'Water Drain Issue', 'Motor Repair'],
        synonyms: ['washing machine repair', 'washing machine service', 'washing machine not working', 'kapde dhone ki machine', 'dryer repair'],
      },
      {
        id: 'laptop_repair',
        name: 'Laptop & Computer Repair',
        typical_budget_min: 400,
        typical_budget_max: 2000,
        budget_unit: 'job',
        common_skills: ['Screen Replacement', 'OS Reinstall', 'SSD Upgrade', 'Liquid Damage Repair', 'Motherboard Diagnosis'],
        synonyms: ['repair my laptop', 'laptop technician', 'computer repair', 'pc repair', 'laptop slow', 'screen replace'],
      },
    ],
  },
  {
    id: 'creative_tech',
    name: 'Creative & Tech',
    icon: '📸',
    description: 'Freelance photographers, UI/UX designers, video editors, and web developers',
    services: [
      {
        id: 'photographer',
        name: 'Photographer',
        typical_budget_min: 5000,
        typical_budget_max: 25000,
        budget_unit: 'job',
        common_skills: ['Wedding Photography', 'Pre-Wedding Shoot', 'Candid Portraits', 'Drone Shoots', 'Event Coverage'],
        synonyms: ['photographer', 'wedding photographer', 'photo shoot', 'candid photographer', 'event photographer', 'birthday photoshoot', 'camera man'],
      },
      {
        id: 'ui_designer',
        name: 'UI/UX & Graphic Designer',
        typical_budget_min: 1000,
        typical_budget_max: 15000,
        budget_unit: 'job',
        common_skills: ['Figma Prototyping', 'Mobile App Design', 'Brand Identity', 'Social Media Creatives', 'Web Design'],
        synonyms: ['ui designer', 'ux designer', 'freelance ui designer', 'graphic designer', 'logo design', 'app design'],
      },
    ],
  },
  {
    id: 'fitness_wellness',
    name: 'Fitness & Wellness',
    icon: '🧘',
    description: 'Personal yoga instructors, fitness trainers, dietitians, and physiotherapists',
    services: [
      {
        id: 'yoga_instructor',
        name: 'Yoga & Meditation Instructor',
        typical_budget_min: 400,
        typical_budget_max: 1000,
        budget_unit: 'session',
        common_skills: ['Hatha Yoga', 'Pranayama', 'Weight Loss Yoga', 'Postnatal Yoga', 'Morning Sessions', 'Home Visits'],
        synonyms: ['yoga instructor', 'female yoga instructor', 'yoga teacher', 'personal yoga trainer', 'meditation guide', 'yoga at home'],
      },
      {
        id: 'fitness_trainer',
        name: 'Personal Fitness Trainer',
        typical_budget_min: 500,
        typical_budget_max: 1500,
        budget_unit: 'session',
        common_skills: ['Strength Training', 'Bodyweight HIIT', 'Diet Consultation', 'Posture Correction', 'Gym Trainer'],
        synonyms: ['fitness trainer', 'personal trainer', 'gym coach', 'english speaking fitness trainer', 'workout coach'],
      },
    ],
  },
  {
    id: 'events_catering',
    name: 'Events & Catering',
    icon: '🍲',
    description: 'Personal home chefs, event caterers, party decorators, and mehendi artists',
    services: [
      {
        id: 'home_chef',
        name: 'Home Chef & Party Cook',
        typical_budget_min: 1200,
        typical_budget_max: 5000,
        budget_unit: 'job',
        common_skills: ['North Indian Cuisine', 'Maharashtrian Specialities', 'Party Catering 10-50 Pax', 'Hygienic Cooking', 'Custom Menu'],
        synonyms: ['home chef', 'cook for party', 'chef for 10 people', 'party cook', 'catering for weekend', 'halwai', 'maharashtrian cook'],
      },
    ],
  },
];
