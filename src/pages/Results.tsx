import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ParsedRequirement, RankingWeights, DEFAULT_RANKING_WEIGHTS, ProviderMatch, ProviderComparison } from '@/types/ai';
import { Provider } from '@/types/provider';
import { providerService } from '@/services/providerService';
import { aiService } from '@/services/ai/AIService';
import { ProviderMatchCard } from '@/features/matching/ProviderMatchCard';
import { AlgorithmWeightDrawer } from '@/features/matching/AlgorithmWeightDrawer';
import { ProviderComparisonModal } from '@/features/matching/ProviderComparisonModal';
import { RequirementSummaryChips } from '@/features/need/RequirementSummaryChips';
import { ConnectRequestModal } from '@/features/providers/ConnectRequestModal';
import {
  Sparkles,
  Sliders,
  Columns,
  Send,
  Loader2,
  ArrowLeft,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export const Results: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const [requirement, setRequirement] = useState<ParsedRequirement | null>(null);
  const [matches, setMatches] = useState<Array<{ provider: Provider; match: ProviderMatch }>>([]);
  const [weights, setWeights] = useState<RankingWeights>(DEFAULT_RANKING_WEIGHTS);
  const [isLoading, setIsLoading] = useState(true);

  // Modals state
  const [showWeightDrawer, setShowWeightDrawer] = useState(false);
  const [showComparisonModal, setShowComparisonModal] = useState(false);
  const [comparisonData, setComparisonData] = useState<ProviderComparison | null>(null);
  const [connectingProvider, setConnectingProvider] = useState<Provider | null>(null);

  // Conversational Follow-up state
  const [followupQuery, setFollowupQuery] = useState('');
  const [isFollowupLoading, setIsFollowupLoading] = useState(false);
  const [followupStatus, setFollowupStatus] = useState<string | null>(null);

  // Load or restore requirement
  useEffect(() => {
    let req: ParsedRequirement | null = location.state?.requirement || null;
    if (!req) {
      const stored = sessionStorage.getItem('active_requirement');
      if (stored) {
        req = JSON.parse(stored);
      }
    }

    if (!req) {
      // Default fallback demo requirement: Class 12 Maths Tutor in Dharampeth
      req = {
        id: 'req_demo',
        raw_query: 'I need a maths tutor for my 12th-standard brother, weekends, within 3 km, budget ₹500.',
        language_detected: 'en',
        category: 'Education & Tutors',
        service: 'Maths Tutor',
        level_or_type: 'Class 12',
        skills_required: ['Class 11-12 Maths', 'Calculus', 'CBSE Syllabus'],
        location: {
          name: 'Dharampeth, Nagpur',
          area: 'Dharampeth',
          city: 'Nagpur',
          lat: 21.1442,
          lng: 79.0620,
          radius_km: 3,
        },
        budget: {
          max: 500,
          currency: 'INR',
          unit: 'session',
          flexibility: 'flexible',
        },
        schedule: {
          days: ['Saturday', 'Sunday'],
          recurring: true,
        },
        urgency: 'normal',
        mode: 'both',
        constraints: ['Within 3 km', 'Saturday & Sunday', 'Max ₹500'],
        confidence_score: 0.96,
        missing_fields: [],
        created_at: new Date().toISOString(),
      };
    }

    setRequirement(req);
    loadMatches(req, weights);
  }, []);

  const loadMatches = async (req: ParsedRequirement, currentWeights: RankingWeights) => {
    setIsLoading(true);
    try {
      const results = await providerService.findMatches(req, currentWeights);
      setMatches(results);
    } catch (err) {
      console.error('Match loading error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleWeightsChange = (newWeights: RankingWeights) => {
    setWeights(newWeights);
    if (requirement) {
      loadMatches(requirement, newWeights);
    }
  };

  // Conversational Follow-up handler
  const handleFollowup = async (queryText?: string) => {
    const text = queryText || followupQuery;
    if (!text.trim() || !requirement || isFollowupLoading) return;

    const lower = text.toLowerCase();

    // Check if user asked for side-by-side comparison
    if (lower.includes('compare') || lower.includes('comparison') || lower.includes('top 3')) {
      handleOpenComparison();
      setFollowupQuery('');
      return;
    }

    setIsFollowupLoading(true);
    setFollowupStatus(`Refining criteria: "${text}"...`);

    try {
      const res = await providerService.refineAndRerank(requirement, text, weights);
      setRequirement(res.updatedRequirement);
      setMatches(res.updatedMatches);
      setWeights(res.updatedWeights);

      setFollowupStatus(`Updated matches based on: "${text}"`);
      setFollowupQuery('');
    } catch (err) {
      console.error('Followup error:', err);
      setFollowupStatus('Failed to update. Please try again.');
    } finally {
      setIsFollowupLoading(false);
      setTimeout(() => setFollowupStatus(null), 4000);
    }
  };

  const handleOpenComparison = async () => {
    if (!requirement || matches.length === 0) return;
    setShowComparisonModal(true);
    try {
      const comp = await aiService.compareProviders(requirement, matches);
      setComparisonData(comp);
    } catch (err) {
      console.error('Comparison error:', err);
    }
  };

  if (!requirement && isLoading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
        <p className="text-sm font-medium text-muted-foreground">
          AI Matching Engine is retrieving and scoring verified local providers...
        </p>
      </div>
    );
  }

  const topMatch = matches[0];

  return (
    <div className="min-h-screen bg-background py-8 md:py-12 px-4 md:px-section-1 lg:px-section-2 pb-24">
      <div className="max-w-[1280px] mx-auto space-y-6">
        {/* Navigation & Header */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate('/need/understanding')}
              className="rounded-full hover:bg-secondary"
            >
              <ArrowLeft className="w-5 h-5 text-muted-foreground" />
            </Button>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-primary bg-primary-soft px-2.5 py-0.5 rounded-full">
                  AI Ranked Matches
                </span>
                <span className="text-xs text-muted-foreground font-medium">
                  {matches.length} verified candidates evaluated
                </span>
              </div>
              <h1 className="font-serif text-2xl md:text-3xl lg:text-4xl text-foreground font-normal mt-1">
                Best Matches for {requirement?.service}
              </h1>
            </div>
          </div>

          {/* Quick Action Tools */}
          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleOpenComparison}
              className="text-xs font-semibold gap-1.5 h-9"
              disabled={matches.length < 2}
            >
              <Columns className="w-3.5 h-3.5 text-primary" />
              Compare Top 3
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowWeightDrawer(true)}
              className="text-xs font-semibold gap-1.5 h-9"
            >
              <Sliders className="w-3.5 h-3.5 text-primary" />
              Algorithm Weights
            </Button>
          </div>
        </div>

        {/* Structured Criteria Banner */}
        {requirement && (
          <div className="bg-card border border-border rounded-xl p-4 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Matching Against Your Criteria:
              </span>
              <button
                onClick={() => navigate('/need/understanding', { state: { query: requirement.raw_query } })}
                className="text-xs text-primary hover:underline font-medium text-left"
              >
                Edit Requirement
              </button>
            </div>
            <RequirementSummaryChips
              requirement={requirement}
              onUpdateRequirement={(up) => {
                setRequirement(up);
                loadMatches(up, weights);
              }}
              editable={true}
            />
          </div>
        )}

        {/* Hackathon Top AI Verdict Highlight Banner */}
        {topMatch && (
          <div className="bg-gradient-to-r from-primary-soft/80 via-primary-soft/40 to-background border border-primary/30 rounded-2xl p-5 md:p-6 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center font-bold text-lg shrink-0 shadow-sm">
                🥇
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-primary">
                    AI Top Recommendation
                  </span>
                  <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-700">
                    {topMatch.match.match_score}% Match
                  </span>
                </div>
                <h2 className="text-lg md:text-xl font-bold text-foreground">
                  {topMatch.provider.name} — {topMatch.provider.title}
                </h2>
                <p className="text-xs md:text-sm text-foreground/80 font-medium max-w-3xl leading-relaxed">
                  "{topMatch.provider.name.split(' ')[0]} is the strongest match because she meets your {requirement?.level_or_type || ''} subject, budget (₹{topMatch.provider.pricing.base_rate}), distance ({topMatch.match.distance_km} km) and weekend preferences while having the strongest local review history ({topMatch.provider.trust_signals.average_rating}★ from {topMatch.provider.trust_signals.review_count} verified students)."
                </p>
              </div>
            </div>

            <Button
              onClick={() => setConnectingProvider(topMatch.provider)}
              className="shrink-0 h-10 px-6 font-semibold"
            >
              Connect with {topMatch.provider.name.split(' ')[0]}
            </Button>
          </div>
        )}

        {/* Matches Feed */}
        {isLoading ? (
          <div className="py-12 flex justify-center">
            <Loader2 className="w-8 h-8 text-primary animate-spin" />
          </div>
        ) : matches.length === 0 ? (
          <div className="bg-card border border-border rounded-xl p-12 text-center space-y-3">
            <p className="text-base font-semibold text-foreground">
              No exact providers found for these specific constraints.
            </p>
            <p className="text-xs text-muted-foreground max-w-md mx-auto">
              Try increasing your distance radius or adjusting the target budget in the filters above.
            </p>
            <Button
              variant="outline"
              onClick={() => {
                if (requirement) {
                  const relaxed = { ...requirement, location: { ...requirement.location, radius_km: 10 } };
                  setRequirement(relaxed);
                  loadMatches(relaxed, weights);
                }
              }}
            >
              Expand Radius to 10 km
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {matches.map(({ provider, match }, idx) => (
              <ProviderMatchCard
                key={provider.id}
                provider={provider}
                match={match}
                rank={idx + 1}
                onConnect={(p) => setConnectingProvider(p)}
              />
            ))}
          </div>
        )}

        {/* Floating / Sticky Conversational Follow-up Bar (Item 8 in requirements) */}
        <div className="fixed bottom-0 left-0 right-0 z-40 bg-background/95 backdrop-blur-md border-t border-border p-3 md:p-4 shadow-xl">
          <div className="max-w-[1280px] mx-auto space-y-2">
            {/* Quick Follow-up Action Chips */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar text-xs">
              <span className="text-muted-foreground font-semibold uppercase tracking-wider shrink-0 text-[10px]">
                Ask AI to adjust:
              </span>
              <button
                onClick={() => handleFollowup('Show me someone cheaper')}
                className="px-2.5 py-1 rounded-full bg-secondary hover:bg-primary-soft hover:text-primary border border-border text-foreground font-medium shrink-0 transition-colors"
              >
                💰 Show someone cheaper
              </button>
              <button
                onClick={() => handleFollowup('Only people available this Sunday')}
                className="px-2.5 py-1 rounded-full bg-secondary hover:bg-primary-soft hover:text-primary border border-border text-foreground font-medium shrink-0 transition-colors"
              >
                📅 Available this Sunday
              </button>
              <button
                onClick={() => handleFollowup('Who has the best reviews and trust?')}
                className="px-2.5 py-1 rounded-full bg-secondary hover:bg-primary-soft hover:text-primary border border-border text-foreground font-medium shrink-0 transition-colors"
              >
                ⭐ Best reviews & trust
              </button>
              <button
                onClick={() => handleFollowup('Which one is closest?')}
                className="px-2.5 py-1 rounded-full bg-secondary hover:bg-primary-soft hover:text-primary border border-border text-foreground font-medium shrink-0 transition-colors"
              >
                📍 Which one is closest?
              </button>
              <button
                onClick={handleOpenComparison}
                className="px-2.5 py-1 rounded-full bg-primary-soft text-primary border border-primary/30 font-semibold shrink-0"
              >
                ✨ Compare top 3
              </button>
            </div>

            {/* Conversational Input Bar */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleFollowup();
              }}
              className="flex items-center gap-2 bg-card border border-border focus-within:border-primary rounded-xl p-1.5 shadow-xs"
            >
              <div className="pl-2 text-primary">
                <Sparkles className="w-4 h-4" />
              </div>
              <Input
                value={followupQuery}
                onChange={(e) => setFollowupQuery(e.target.value)}
                placeholder="Ask AI follow-up (e.g. 'Show me someone closer' or 'Compare the top 3')..."
                className="border-0 focus-visible:ring-0 text-xs md:text-sm bg-transparent shadow-none px-2 h-9"
              />
              <Button
                type="submit"
                size="sm"
                disabled={!followupQuery.trim() || isFollowupLoading}
                className="h-9 px-4 font-semibold text-xs shrink-0"
              >
                {isFollowupLoading ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Send className="w-3.5 h-3.5 mr-1" />
                )}
                Refine
              </Button>
            </form>

            {followupStatus && (
              <p className="text-[11px] text-primary font-medium text-center animate-pulse">
                {followupStatus}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Algorithm Weight Drawer */}
      <AlgorithmWeightDrawer
        open={showWeightDrawer}
        onOpenChange={setShowWeightDrawer}
        weights={weights}
        onWeightsChange={handleWeightsChange}
      />

      {/* Provider Comparison Modal */}
      {requirement && (
        <ProviderComparisonModal
          open={showComparisonModal}
          onOpenChange={setShowComparisonModal}
          matches={matches}
          requirement={requirement}
          comparisonData={comparisonData}
          onSelectProvider={(p) => setConnectingProvider(p)}
        />
      )}

      {/* Connect Modal */}
      {connectingProvider && requirement && (
        <ConnectRequestModal
          open={Boolean(connectingProvider)}
          onOpenChange={(open) => !open && setConnectingProvider(null)}
          provider={connectingProvider}
          requirement={requirement}
        />
      )}
    </div>
  );
};
