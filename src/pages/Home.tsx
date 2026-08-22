import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, MapPin, ArrowRight, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { ScrollExpand } from '@/components/react-bits/ScrollExpand';
import { ShinyButton } from '@/components/ui/shiny-button';
import { Logo } from '@/components/ui/Logo';
import { DynamicSupportingText } from '@/components/common/DynamicSupportingText';
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
  { id: '1', title: 'Home Maintenance', count: '120+ providers', icon: '🔧' },
  { id: '2', title: 'Education & Tutors', count: '85+ providers', icon: '📚' },
  { id: '3', title: 'Creative & Tech', count: '200+ providers', icon: '💻' },
  { id: '4', title: 'Events & Catering', count: '60+ providers', icon: '🎉' },
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
      // Step 3 & 8: Natural-language request is parsed by AI Parser into structured requirement
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
      {/* Top minimal bar (mobile-only, desktop uses Navbar) */}
      <div className="md:hidden flex items-center justify-between p-4 border-b border-border">
        <Logo className="h-11 w-auto" />
        <div className="flex items-center gap-1.5 text-text-caption text-muted-foreground bg-secondary px-3 py-1.5 rounded-full">
          <MapPin className="w-3 h-3" />
          <span>Local Area</span>
        </div>
      </div>

      <main className="flex-1 w-full max-w-[1440px] mx-auto px-4 md:px-section-1 lg:px-section-2 pb-section-3">
        
        {/* Centered Editorial Hero Section */}
        <section className="pt-section-1 md:pt-hero-1 lg:pt-hero-2 pb-section-2 flex flex-col items-center text-center">
          
          {/* Primary Tagline */}
          <h1 className="font-serif font-normal text-primary text-[32px] md:text-[48px] lg:text-[68px] tracking-normal leading-[1.1] mb-6">
            Need &rarr; Match &rarr; Connect
          </h1>
          
          {/* Supporting Copy */}
          <DynamicSupportingText />

          {/* Input */}
          <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-comp-2 w-full max-w-[600px] mb-12">
            <div className="relative flex-1 group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
              <Input 
                value={needQuery}
                onChange={(e) => setNeedQuery(e.target.value)}
                placeholder="e.g. Find a maths tutor for Class 10..." 
                className="pl-12 h-14 text-body-large rounded-md bg-card border-border-interactive focus-visible:border-primary shadow-sm text-left"
              />
            </div>
            <ShinyButton 
              type="submit" 
              className="h-14 text-text-btn sm:w-auto w-full"
              disabled={!needQuery.trim() || isParsing}
            >
              {isParsing ? (
                <>
                  <Loader2 className="w-4 h-4 mr-1.5 animate-spin" />
                  Finding Matches...
                </>
              ) : (
                <>
                  Find Matches
                  <ArrowRight className="w-4 h-4 ml-1" />
                </>
              )}
            </ShinyButton>
          </form>

          {/* Editorial Examples */}
          <div className="flex flex-col w-full max-w-[600px] text-left">
            <span className="text-text-small text-muted-foreground font-medium tracking-widest uppercase mb-4">
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
                    <span className="text-foreground font-medium group-hover:text-primary transition-colors">
                      {example}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
          
        </section>

        {/* Scroll Expand Transition into Discovery */}
        <ScrollExpand containerClassName="py-section-2 border-t border-border">
          <div className="bg-primary text-primary-foreground rounded-md p-section-1 md:p-section-2 flex flex-col items-center text-center">
             <h2 className="text-h1 md:text-display font-bold mb-4">NEED → MATCH → CONNECT</h2>
             <p className="text-body-large md:text-h3 opacity-90 max-w-2xl">
               The simplest way to discover local talent. From home repairs to specialized tutoring, the right professional is just a request away.
             </p>
          </div>
        </ScrollExpand>

        {/* Discovery Section */}
        <section className="py-section-2">
          <div className="flex items-end justify-between mb-section-1">
            <div>
              <h2 className="text-h1 font-bold text-foreground mb-2">Discover Categories</h2>
              <p className="text-body-large text-muted-foreground">Explore top-rated professionals in your area.</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-comp-3">
            {DISCOVERY_CATEGORIES.map((category) => (
              <div 
                key={category.id} 
                onClick={() => handleCategoryClick(category.title)}
                className="group relative bg-card border border-border rounded-md p-6 hover:border-primary transition-colors cursor-pointer focus-ring"
                tabIndex={0}
              >
                <div className="text-4xl mb-4 group-hover:scale-110 transition-transform origin-bottom-left">{category.icon}</div>
                <h3 className="text-h3 text-foreground mb-1">{category.title}</h3>
                <p className="text-text-small text-muted-foreground">{category.count}</p>
              </div>
            ))}
          </div>
        </section>

      </main>
    </div>
  );
}
