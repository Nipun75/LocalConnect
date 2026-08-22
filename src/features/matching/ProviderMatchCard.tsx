import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Provider } from '@/types/provider';
import { ProviderMatch } from '@/types/ai';
import {
  Check,
  MapPin,
  Clock,
  ShieldCheck,
  Star,
  Sparkles,
  ArrowRight,
  Info,
  DollarSign,
  Award,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ShinyButton } from '@/components/ui/shiny-button';
import { Badge } from '@/components/ui/badge';
import { MatchExplanationDialog } from './MatchExplanationDialog';
import { RecommendationFeedback } from './RecommendationFeedback';

interface ProviderMatchCardProps {
  provider: Provider;
  match: ProviderMatch;
  rank: number;
  onConnect?: (provider: Provider) => void;
}

export const ProviderMatchCard: React.FC<ProviderMatchCardProps> = ({
  provider,
  match,
  rank,
  onConnect,
}) => {
  const [showExplanationModal, setShowExplanationModal] = useState(false);
  const navigate = useNavigate();

  const getRankBadge = () => {
    if (rank === 1) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-500/15 text-amber-900 dark:text-amber-300 border border-amber-500/30 text-xs font-bold font-mono">
          🥇 1ST MATCH
        </span>
      );
    }
    if (rank === 2) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-500/15 text-slate-800 dark:text-slate-200 border border-slate-400/30 text-xs font-bold font-mono">
          🥈 2ND MATCH
        </span>
      );
    }
    if (rank === 3) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-700/15 text-amber-900 dark:text-amber-400 border border-amber-700/30 text-xs font-bold font-mono">
          🥉 3RD MATCH
        </span>
      );
    }
    return (
      <span className="text-xs font-mono font-semibold text-muted-foreground">
        #{rank} Match
      </span>
    );
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-emerald-700 dark:text-emerald-300 bg-emerald-500/10 border-emerald-500/30';
    if (score >= 80) return 'text-blue-700 dark:text-blue-300 bg-blue-500/10 border-blue-500/30';
    if (score >= 70) return 'text-amber-700 dark:text-amber-300 bg-amber-500/10 border-amber-500/30';
    return 'text-slate-700 bg-secondary border-border';
  };

  return (
    <>
      <div
        className={`bg-card rounded-2xl border transition-all duration-200 p-5 md:p-6 shadow-sm hover:shadow-md ${
          match.is_top_match ? 'border-primary/40 ring-1 ring-primary/20' : 'border-border'
        }`}
      >
        {/* Top Header Row */}
        <div className="flex flex-wrap items-center justify-between gap-2 mb-4 pb-3 border-b border-border">
          <div className="flex items-center gap-2">
            {getRankBadge()}
            {provider.trust_signals.identity_verified && (
              <Badge variant="secondary" className="gap-1 text-[11px] font-medium bg-emerald-500/10 text-emerald-700 border-emerald-500/20">
                <ShieldCheck className="w-3 h-3 text-emerald-600" />
                Verified
              </Badge>
            )}
          </div>

          {/* Match Score Badge */}
          <div
            onClick={() => setShowExplanationModal(true)}
            className={`cursor-pointer inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-xs md:text-sm font-bold font-mono transition-transform hover:scale-105 ${getScoreColor(
              match.match_score
            )}`}
            title="Click to view full algorithm match explanation"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>{match.match_score}% MATCH</span>
            <Info className="w-3 h-3 opacity-60 ml-0.5" />
          </div>
        </div>

        {/* Provider Core Info Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
          {/* Avatar & Key Details */}
          <div className="md:col-span-4 flex items-start gap-3.5">
            <img
              src={provider.avatar}
              alt={provider.name}
              className="w-16 h-16 md:w-20 md:h-20 rounded-xl object-cover border border-border shadow-xs shrink-0"
            />
            <div className="space-y-1">
              <h3
                onClick={() => navigate(`/provider/${provider.id}`)}
                className="text-base md:text-lg font-bold text-foreground hover:text-primary transition-colors cursor-pointer"
              >
                {provider.name}
              </h3>
              <p className="text-xs text-muted-foreground font-medium line-clamp-2">
                {provider.title}
              </p>

              {/* Rating & Reviews */}
              <div className="flex items-center gap-1.5 text-xs text-foreground font-semibold pt-0.5">
                <div className="flex items-center gap-1 text-amber-500">
                  <Star className="w-3.5 h-3.5 fill-current" />
                  <span>{provider.trust_signals.average_rating}</span>
                </div>
                <span className="text-muted-foreground font-normal">
                  ({provider.trust_signals.review_count} reviews)
                </span>
                <span className="text-muted-foreground">&bull;</span>
                <span className="text-xs text-emerald-600 font-medium">
                  {provider.trust_signals.completed_jobs_count} jobs
                </span>
              </div>
            </div>
          </div>

          {/* Location, Pricing, Availability Meta */}
          <div className="md:col-span-8 grid grid-cols-2 sm:grid-cols-3 gap-2.5 bg-secondary/40 p-3 rounded-xl border border-border/70 text-xs">
            <div className="space-y-0.5">
              <span className="text-muted-foreground font-medium flex items-center gap-1">
                <MapPin className="w-3 h-3 text-primary" /> Proximity
              </span>
              <p className="font-bold text-foreground">
                {match.distance_km} km away
              </p>
              <p className="text-[10px] text-muted-foreground">{provider.location.area}</p>
            </div>

            <div className="space-y-0.5">
              <span className="text-muted-foreground font-medium flex items-center gap-1">
                <DollarSign className="w-3 h-3 text-emerald-600" /> Rate
              </span>
              <p className="font-bold text-foreground">{provider.pricing.display_string}</p>
              <p className="text-[10px] text-muted-foreground">Transparent pricing</p>
            </div>

            <div className="space-y-0.5 col-span-2 sm:col-span-1">
              <span className="text-muted-foreground font-medium flex items-center gap-1">
                <Clock className="w-3 h-3 text-amber-600" /> Availability
              </span>
              <p className="font-bold text-foreground">
                {provider.availability.days.slice(0, 2).join(' & ')}
              </p>
              <p className="text-[10px] text-muted-foreground">
                {provider.availability.time_slots.join(', ')}
              </p>
            </div>
          </div>
        </div>

        {/* Why this matches section (Key AI Feature) */}
        <div className="mt-4 pt-3.5 border-t border-border space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <Award className="w-3.5 h-3.5 text-primary" />
              Why this is a strong match:
            </span>
            <button
              onClick={() => setShowExplanationModal(true)}
              className="text-[11px] text-primary hover:underline font-semibold"
            >
              View Algorithm Scorecard
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
            {match.explanation.bullet_points.slice(0, 4).map((bullet, idx) => (
              <div key={idx} className="flex items-start gap-1.5 text-xs text-foreground font-medium">
                <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                <span className="line-clamp-1">{bullet}</span>
              </div>
            ))}
          </div>

          {/* Caveats / Overages notice if present */}
          {match.explanation.caveats && match.explanation.caveats.length > 0 && (
            <p className="text-[11px] text-amber-700 dark:text-amber-300 font-medium pt-1">
              Note: {match.explanation.caveats[0]}
            </p>
          )}
        </div>

        {/* Action Footer */}
        <div className="mt-4 pt-3.5 border-t border-border flex flex-wrap items-center justify-between gap-3">
          {/* Trust Score Indicator */}
          <div
            onClick={() => navigate(`/provider/${provider.id}/trust`)}
            className="flex items-center gap-2 cursor-pointer group"
          >
            <div className="w-8 h-8 rounded-full bg-purple-500/10 text-purple-700 flex items-center justify-center font-mono font-bold text-xs">
              {provider.trust_breakdown.total_score}
            </div>
            <div className="text-[11px]">
              <span className="font-semibold text-foreground group-hover:text-primary transition-colors block">
                Trust Score: {provider.trust_breakdown.total_score}/100
              </span>
              <span className="text-muted-foreground">{provider.trust_breakdown.badges[0]}</span>
            </div>
          </div>

          {/* Feedback & Connect CTAs */}
          <div className="flex items-center gap-2">
            <RecommendationFeedback
              providerId={provider.id}
              requestId={match.provider_id}
            />

            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate(`/provider/${provider.id}`)}
              className="text-xs h-9"
            >
              Profile
            </Button>

            <ShinyButton
              onClick={() => {
                if (onConnect) onConnect(provider);
                else navigate(`/provider/${provider.id}`, { state: { openConnect: true } });
              }}
              className="text-xs font-semibold px-4 h-9"
            >
              Connect
              <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </ShinyButton>
          </div>
        </div>
      </div>

      {/* Explanation Dialog */}
      <MatchExplanationDialog
        open={showExplanationModal}
        onOpenChange={setShowExplanationModal}
        provider={provider}
        match={match}
      />
    </>
  );
};
