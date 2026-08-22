import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { providerService } from '@/services/providerService';
import { CATEGORIES } from '@/data/categories';
import { NAGPUR_LANDMARKS, calculateDistanceKm } from '@/data/locations';
import { Search, MapPin, Star, ShieldCheck, Sparkles, SlidersHorizontal } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ShinyButton } from '@/components/ui/shiny-button';

export const Discover: React.FC = () => {
  const navigate = useNavigate();
  const allProviders = providerService.getAllProviders();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedLandmark, setSelectedLandmark] = useState(NAGPUR_LANDMARKS[0]);
  const [maxRadiusKm, setMaxRadiusKm] = useState<number>(10);
  const [onlyVerified, setOnlyVerified] = useState(false);

  // Filter providers dynamically
  const filteredProviders = useMemo(() => {
    return allProviders.filter((p) => {
      // 1. Category filter
      if (selectedCategory !== 'all' && !p.category.toLowerCase().includes(selectedCategory.toLowerCase())) {
        return false;
      }

      // 2. Search query filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = p.name.toLowerCase().includes(q);
        const matchesTitle = p.title.toLowerCase().includes(q);
        const matchesServices = p.services.some((s) => s.toLowerCase().includes(q));
        const matchesSkills = p.skills.some((s) => s.toLowerCase().includes(q));
        const matchesArea = p.location.area.toLowerCase().includes(q);
        if (!matchesName && !matchesTitle && !matchesServices && !matchesSkills && !matchesArea) {
          return false;
        }
      }

      // 3. Distance filter
      const dist = calculateDistanceKm(selectedLandmark.lat, selectedLandmark.lng, p.location.lat, p.location.lng);
      if (dist > maxRadiusKm) {
        return false;
      }

      // 4. Verified filter
      if (onlyVerified && !p.trust_signals.identity_verified) {
        return false;
      }

      return true;
    });
  }, [allProviders, searchQuery, selectedCategory, selectedLandmark, maxRadiusKm, onlyVerified]);

  const handleLaunchAIMatch = (queryToMatch: string) => {
    navigate('/need/understanding', { state: { query: queryToMatch } });
  };

  return (
    <div className="min-h-screen bg-background py-8 md:py-12 px-4 md:px-section-1 lg:px-section-2 pb-24">
      <div className="max-w-[1280px] mx-auto space-y-8">
        {/* Header & Smart Search */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-primary bg-primary-soft px-2.5 py-0.5 rounded-full">
                Hyperlocal Directory
              </span>
              <h1 className="font-serif text-3xl md:text-4xl text-foreground font-normal mt-1">
                Discover Verified Local Talent
              </h1>
            </div>

            <Button
              onClick={() => handleLaunchAIMatch(searchQuery || 'Find a verified service provider near me')}
              className="text-xs font-semibold gap-1.5 h-10 shadow-xs"
            >
              <Sparkles className="w-3.5 h-3.5" /> Launch AI Match Assistant
            </Button>
          </div>

          {/* Search bar */}
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by skill, name, service (e.g. 'Class 12 Maths', 'AC Gas Refill', 'Emergency Electrician')..."
              className="pl-12 h-14 text-sm md:text-base rounded-2xl bg-card border-border shadow-xs"
            />
          </div>
        </div>

        {/* Filters Row */}
        <div className="bg-card border border-border rounded-2xl p-4 md:p-5 shadow-xs space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            {/* Category Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar text-xs">
              <button
                onClick={() => setSelectedCategory('all')}
                className={`px-3 py-1.5 rounded-full font-medium transition-colors ${
                  selectedCategory === 'all'
                    ? 'bg-primary text-white'
                    : 'bg-secondary text-foreground hover:bg-secondary/80'
                }`}
              >
                All Categories
              </button>
              {CATEGORIES.map((c) => (
                <button
                  key={c.id}
                  onClick={() => setSelectedCategory(c.name)}
                  className={`px-3 py-1.5 rounded-full font-medium shrink-0 transition-colors ${
                    selectedCategory === c.name
                      ? 'bg-primary text-white'
                      : 'bg-secondary text-foreground hover:bg-secondary/80'
                  }`}
                >
                  {c.icon} {c.name}
                </button>
              ))}
            </div>

            {/* Landmark & Radius Selector */}
            <div className="flex flex-wrap items-center gap-3 text-xs">
              <div className="flex items-center gap-1.5 bg-secondary px-3 py-1.5 rounded-lg border border-border">
                <MapPin className="w-3.5 h-3.5 text-primary" />
                <select
                  value={selectedLandmark.name}
                  onChange={(e) => {
                    const l = NAGPUR_LANDMARKS.find((lm) => lm.name === e.target.value);
                    if (l) setSelectedLandmark(l);
                  }}
                  className="bg-transparent border-0 font-medium text-foreground text-xs focus:ring-0 cursor-pointer"
                >
                  {NAGPUR_LANDMARKS.map((lm) => (
                    <option key={lm.name} value={lm.name}>
                      {lm.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-2 bg-secondary px-3 py-1.5 rounded-lg border border-border">
                <SlidersHorizontal className="w-3.5 h-3.5 text-muted-foreground" />
                <span className="text-muted-foreground">Radius:</span>
                <span className="font-bold text-foreground">{maxRadiusKm} km</span>
                <input
                  type="range"
                  min="1"
                  max="25"
                  value={maxRadiusKm}
                  onChange={(e) => setMaxRadiusKm(parseInt(e.target.value, 10))}
                  className="w-16 h-1 bg-primary cursor-pointer accent-primary"
                />
              </div>

              <button
                onClick={() => setOnlyVerified(!onlyVerified)}
                className={`px-3 py-1.5 rounded-lg font-semibold border transition-colors flex items-center gap-1.5 ${
                  onlyVerified
                    ? 'bg-emerald-500/10 text-emerald-700 border-emerald-500/30'
                    : 'bg-secondary text-muted-foreground border-border hover:text-foreground'
                }`}
              >
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>Verified Only</span>
              </button>
            </div>
          </div>
        </div>

        {/* Results Grid */}
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs text-muted-foreground font-semibold uppercase tracking-wider">
            <span>{filteredProviders.length} Providers Found near {selectedLandmark.name}</span>
            <span>Sorted by Local Rating</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredProviders.map((p) => {
              const dist = calculateDistanceKm(
                selectedLandmark.lat,
                selectedLandmark.lng,
                p.location.lat,
                p.location.lng
              );

              return (
                <div
                  key={p.id}
                  className="bg-card border border-border hover:border-primary/40 rounded-2xl p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-4"
                >
                  <div>
                    <div className="flex items-start gap-3.5 mb-3">
                      <img
                        src={p.avatar}
                        alt={p.name}
                        className="w-14 h-14 rounded-xl object-cover border border-border shrink-0"
                      />
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-1.5">
                          <h3
                            onClick={() => navigate(`/provider/${p.id}`)}
                            className="font-bold text-foreground text-sm hover:text-primary transition-colors cursor-pointer"
                          >
                            {p.name}
                          </h3>
                          {p.trust_signals.identity_verified && (
                            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                          )}
                        </div>
                        <p className="text-[11px] text-muted-foreground line-clamp-1">{p.title}</p>
                        <div className="flex items-center gap-2 text-xs pt-1">
                          <div className="flex items-center gap-1 text-amber-500 font-bold">
                            <Star className="w-3 h-3 fill-current" />
                            <span>{p.trust_signals.average_rating}</span>
                          </div>
                          <span className="text-muted-foreground">({p.trust_signals.review_count})</span>
                          <span className="text-muted-foreground">&bull;</span>
                          <span className="text-primary font-medium">{dist} km</span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2 pt-2 border-t border-border text-xs">
                      <div className="flex justify-between text-muted-foreground">
                        <span>Rate:</span>
                        <span className="font-bold text-foreground">{p.pricing.display_string}</span>
                      </div>
                      <div className="flex justify-between text-muted-foreground">
                        <span>Availability:</span>
                        <span className="font-semibold text-foreground">
                          {p.availability.days.slice(0, 2).join(', ')}
                        </span>
                      </div>
                      <div className="flex justify-between text-muted-foreground">
                        <span>Trust Score:</span>
                        <span className="font-mono font-bold text-purple-600">
                          {p.trust_breakdown.total_score} / 100
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-border flex items-center justify-between gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigate(`/provider/${p.id}`)}
                      className="w-full text-xs h-8"
                    >
                      Profile
                    </Button>
                    <ShinyButton
                      onClick={() => handleLaunchAIMatch(`I need ${p.services[0]} from ${p.name}`)}
                      className="w-full text-xs h-8 font-semibold"
                    >
                      AI Match
                    </ShinyButton>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
