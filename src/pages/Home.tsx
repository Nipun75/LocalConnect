import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, MapPin, ArrowRight, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { NeonGlowButton } from '@/components/ui/neon-glow-button';
import { Logo } from '@/components/ui/Logo';
import { DynamicSupportingText } from '@/components/common/DynamicSupportingText';
import { LinkPreview } from '@/components/ui/link-preview';
import { parseNeedWithAI } from '@/services/aiParser';

import '@fontsource/instrument-serif/400.css';
import '@fontsource/instrument-serif/400-italic.css';

const EXAMPLE_NEEDS = [
  "Find a maths tutor for Class 10",
  "Need an emergency electrician",
  "Looking for a wedding photographer",
  "Freelance UI designer for a startup",
];

const DISCOVERY_CATEGORIES = [
  { 
    id: '1', 
    number: '01', 
    title: 'Home Maintenance', 
    count: '120+ providers', 
    description: 'Electricians, plumbers, and technicians ready for quick repairs.', 
    imageSrc: '/assets/home-maintenance.jpg' 
  },
  { 
    id: '2', 
    number: '02', 
    title: 'Education & Tutors', 
    count: '85+ providers', 
    description: 'Expert tutors and instructors to help you master new skills.', 
    imageSrc: '/assets/education-tutors.jpg' 
  },
  { 
    id: '3', 
    number: '03', 
    title: 'Creative & Tech', 
    count: '200+ providers', 
    description: 'Designers, developers, and creatives for your next big project.', 
    imageSrc: '/assets/creative-tech.jpg' 
  },
  { 
    id: '4', 
    number: '04', 
    title: 'Events & Catering', 
    count: '60+ providers', 
    description: 'Planners, chefs, and photographers for unforgettable gatherings.', 
    imageSrc: '/assets/events-catering.jpg' 
  },
];

export function Home() {
  const [needQuery, setNeedQuery] = useState('');
  const [isParsing, setIsParsing] = useState(false);
  const navigate = useNavigate();

  const handleSearch = async (e?: React.FormEvent, customQuery?: string) => {
    e?.preventDefault();
    const query = customQuery || needQuery;
    if (!query.trim() || isParsing) return;

    setIsParsing(true);
    try {
      // Step 1: Natural-language request is parsed by AI Parser into structured requirement
      const parsedNeed = await parseNeedWithAI(query.trim());
      
      // Pass structured requirement into the search / results flow
      navigate('/need/understanding', { state: { parsedNeed, query: query.trim() } });
    } catch (err) {
      console.warn('AI Parsing failed, continuing with raw query:', err);
      navigate('/need/understanding', { state: { query: query.trim() } });
    } finally {
      setIsParsing(false);
    }
  };

  const handleCategoryClick = (categoryTitle: string) => {
    handleSearch(undefined, `I need help with ${categoryTitle} near me`);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col selection:bg-primary-soft selection:text-primary">
      
      {/* Background Wrapper for Hero Section with Street Backdrop */}
      <div 
        className="w-full relative"
        style={{
          backgroundImage: `linear-gradient(rgba(255, 255, 255, 0.82), rgba(255, 255, 255, 0.82)), url('/brand/hero-bg-street.jpg')`,
          backgroundSize: 'cover',
          backgroundPosition: 'top center',
          backgroundRepeat: 'no-repeat'
        }}
      >
        <div className="pt-16 md:pt-20 lg:pt-24">
          {/* Top minimal bar (mobile-only, desktop uses Navbar) */}
          <div className="md:hidden flex items-center justify-between p-4 border-b border-border/20">
            <Logo className="h-11 w-auto" />
            <div className="flex items-center gap-1.5 text-text-caption text-foreground/80 bg-white/60 px-3 py-1.5 rounded-full backdrop-blur-sm border border-border/30">
              <MapPin className="w-3 h-3 text-primary" />
              <span>Nagpur Central</span>
            </div>
          </div>

          <div className="w-full max-w-[1440px] mx-auto px-4 md:px-section-1 lg:px-section-2">
            
            {/* Centered Editorial Hero Section */}
            <section className="pt-section-1 md:pt-hero-1 lg:pt-hero-2 pb-section-1 flex flex-col items-center text-center">
              
              {/* Primary Tagline */}
              <h1 className="font-serif font-normal text-primary text-[42px] sm:text-[52px] md:text-[72px] lg:text-[88px] tracking-normal leading-[1.1] mb-8">
                Need &rarr; Match &rarr; Connect
              </h1>
              
              {/* Animated Supporting Text */}
              <DynamicSupportingText />

              {/* Secondary Supporting Copy */}
              <p 
                className="text-[17px] sm:text-[19px] md:text-[21px] lg:text-[24px] leading-[1.55] md:leading-[1.45] text-muted-foreground font-medium max-w-[850px] text-center mx-auto mt-6 mb-12"
                style={{ fontFamily: '"Urbanist Variable", sans-serif' }}
              >
                The simplest way to discover local talent. From home repairs to specialized tutoring, the right professional is just a request away.
              </p>

              {/* Input Form with AI Search */}
              <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-comp-2 w-full max-w-[750px] mt-2 mb-4">
                <div className="relative flex-1 group">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                  <Input 
                    value={needQuery}
                    onChange={(e) => setNeedQuery(e.target.value)}
                    placeholder="e.g. I need a maths tutor for Class 12 under ₹500..." 
                    className="pl-12 h-14 text-body-large rounded-md bg-card border-border-interactive focus-visible:border-primary shadow-sm text-left"
                    disabled={isParsing}
                  />
                </div>
                <NeonGlowButton 
                  type="submit" 
                  className="h-14 text-text-btn text-[#FFFFFF] sm:w-auto w-full px-8 flex items-center justify-center font-semibold"
                  disabled={!needQuery.trim() || isParsing}
                >
                  {isParsing ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Analyzing Need...
                    </>
                  ) : (
                    <>
                      Find Matches
                      <ArrowRight className="w-4 h-4 ml-1.5" />
                    </>
                  )}
                </NeonGlowButton>
              </form>
              
            </section>

            {/* Suggestions Section */}
            <section className="py-section-2 flex flex-col items-center">
              <div className="flex flex-col w-full max-w-[750px] text-left">
                <span 
                  className="text-text-small text-muted-foreground font-medium tracking-widest uppercase mb-4 pl-3"
                  style={{ fontFamily: '"Fjalla One", sans-serif' }}
                >
                  TRY SOMETHING LIKE
                </span>
                <ul className="flex flex-col gap-1 w-full">
                  {EXAMPLE_NEEDS.map((example, i) => (
                    <li key={example} className="w-full">
                      <button
                        onClick={() => {
                          setNeedQuery(example);
                          handleSearch(undefined, example);
                        }}
                        className="group w-full flex items-center gap-4 text-left p-3 rounded-md hover:bg-secondary transition-colors focus-ring"
                      >
                        <span className="text-primary font-mono text-sm opacity-60 group-hover:opacity-100 transition-opacity">
                          0{i + 1}
                        </span>
                        <span 
                          className="text-foreground font-medium group-hover:text-primary transition-colors text-[24px] sm:text-[28px]"
                          style={{ fontFamily: '"Cormorant Garamond", serif', fontWeight: 500 }}
                        >
                          {example}
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            </section>

          </div>
        </div>
      </div>

      <main className="flex-1 w-full max-w-[1440px] mx-auto px-4 md:px-section-1 lg:px-section-2 pb-section-3">

        {/* Discovery Categories Section */}
        <section className="py-section-2">
          <div className="flex items-end justify-between mb-section-1">
            <div>
              <h2 className="text-h1 font-bold text-foreground mb-2" style={{ fontFamily: '"Stack Sans Headline", sans-serif' }}>
                Discover Categories
              </h2>
              <p className="text-body-large text-muted-foreground" style={{ fontFamily: '"Montserrat", sans-serif' }}>
                Explore top-rated professionals in your area.
              </p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-comp-3">
            {DISCOVERY_CATEGORIES.map((category) => (
              <LinkPreview key={category.id} imageSrc={category.imageSrc}>
                <div 
                  onClick={() => handleCategoryClick(category.title)}
                  className="group relative bg-card border border-border/50 rounded-md p-8 hover:border-primary transition-all duration-300 hover:-translate-y-1 cursor-pointer focus-ring flex flex-col justify-between min-h-[220px]"
                  tabIndex={0}
                >
                  <div>
                    <div className="text-sm font-mono text-muted-foreground/60 mb-4 group-hover:text-primary/60 transition-colors">
                      {category.number}
                    </div>
                    <h3 className="text-2xl font-serif font-medium text-foreground mb-2 font-['Cormorant_Garamond']">
                      {category.title}
                    </h3>
                    <p className="text-sm text-muted-foreground leading-relaxed" style={{ fontFamily: '"Montserrat", sans-serif' }}>
                      {category.description}
                    </p>
                  </div>
                  <div className="flex items-center justify-between mt-8 pt-4 border-t border-border/30">
                    <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      {category.count}
                    </span>
                    <span className="text-sm font-medium text-primary opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300 flex items-center gap-1">
                      Explore <ArrowRight className="w-4 h-4" />
                    </span>
                  </div>
                </div>
              </LinkPreview>
            ))}
          </div>
        </section>

      </main>
    </div>
  );
}
