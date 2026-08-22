import React from 'react';
import { Provider } from '@/types/provider';
import { ProviderMatch, ProviderComparison, ParsedRequirement } from '@/types/ai';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Sparkles, Star, ShieldCheck, MapPin, DollarSign, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ShinyButton } from '@/components/ui/shiny-button';

interface ProviderComparisonModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  matches: Array<{ provider: Provider; match: ProviderMatch }>;
  requirement: ParsedRequirement;
  comparisonData?: ProviderComparison | null;
  onSelectProvider?: (provider: Provider) => void;
}

export const ProviderComparisonModal: React.FC<ProviderComparisonModalProps> = ({
  open,
  onOpenChange,
  matches,
  requirement,
  comparisonData,
  onSelectProvider,
}) => {
  const topMatches = matches.slice(0, 3);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full bg-primary/10 text-primary text-xs font-bold font-mono">
              AI SIDE-BY-SIDE SYNTHESIS
            </span>
          </div>
          <DialogTitle className="text-xl md:text-2xl font-bold text-foreground">
            Compare Top 3 Matches for {requirement.service}
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            Direct comparison based on verified rates, customer feedback, trust scores, and distance in {requirement.location.name}.
          </DialogDescription>
        </DialogHeader>

        {/* AI Synthesis Verdict Box */}
        {comparisonData && (
          <div className="p-4 bg-primary-soft/60 rounded-xl border border-primary/20 flex items-start gap-3 my-2">
            <Sparkles className="w-5 h-5 text-primary shrink-0 mt-0.5" />
            <div className="text-xs">
              <span className="font-bold text-primary block mb-1 uppercase tracking-wider">
                AI Recommendation Verdict:
              </span>
              <p className="text-foreground font-medium leading-relaxed">
                {comparisonData.ai_verdict}
              </p>
            </div>
          </div>
        )}

        {/* 3-Column Comparison Matrix */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
          {topMatches.map(({ provider, match }, idx) => (
            <div
              key={provider.id}
              className={`rounded-xl border p-4 flex flex-col justify-between space-y-4 ${
                idx === 0
                  ? 'bg-primary/5 border-primary/40 ring-1 ring-primary/20 shadow-sm'
                  : 'bg-card border-border'
              }`}
            >
              {/* Header */}
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-md bg-secondary text-foreground">
                    #{idx + 1} Candidate
                  </span>
                  <span className="text-xs font-mono font-bold text-primary bg-primary-soft px-2 py-0.5 rounded-full">
                    {match.match_score}% Match
                  </span>
                </div>

                <div className="flex items-center gap-3 mb-2">
                  <img
                    src={provider.avatar}
                    alt={provider.name}
                    className="w-12 h-12 rounded-lg object-cover border border-border"
                  />
                  <div>
                    <h4 className="text-sm font-bold text-foreground">{provider.name}</h4>
                    <p className="text-[11px] text-muted-foreground line-clamp-1">{provider.title}</p>
                  </div>
                </div>
              </div>

              {/* Attributes Comparison */}
              <div className="space-y-2 text-xs divide-y divide-border/60">
                <div className="flex items-center justify-between pt-1.5">
                  <span className="text-muted-foreground flex items-center gap-1">
                    <DollarSign className="w-3 h-3 text-emerald-600" /> Pricing:
                  </span>
                  <span className="font-bold text-foreground">{provider.pricing.display_string}</span>
                </div>

                <div className="flex items-center justify-between pt-1.5">
                  <span className="text-muted-foreground flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-primary" /> Distance:
                  </span>
                  <span className="font-bold text-foreground">{match.distance_km} km away</span>
                </div>

                <div className="flex items-center justify-between pt-1.5">
                  <span className="text-muted-foreground flex items-center gap-1">
                    <Star className="w-3 h-3 text-amber-500 fill-current" /> Rating:
                  </span>
                  <span className="font-bold text-foreground">
                    {provider.trust_signals.average_rating}★ ({provider.trust_signals.review_count})
                  </span>
                </div>

                <div className="flex items-center justify-between pt-1.5">
                  <span className="text-muted-foreground flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3 text-purple-600" /> Trust Score:
                  </span>
                  <span className="font-mono font-bold text-foreground">
                    {provider.trust_breakdown.total_score} / 100
                  </span>
                </div>

                <div className="flex items-center justify-between pt-1.5">
                  <span className="text-muted-foreground flex items-center gap-1">
                    <Clock className="w-3 h-3 text-amber-600" /> Availability:
                  </span>
                  <span className="font-semibold text-foreground text-right text-[11px]">
                    {provider.availability.days.slice(0, 2).join(', ')}
                  </span>
                </div>
              </div>

              {/* Key Advantage Chip */}
              <div className="p-2 bg-secondary/80 rounded-lg text-[11px] font-medium text-foreground">
                <span className="text-muted-foreground block text-[10px] uppercase font-bold">
                  Key Strength:
                </span>
                {idx === 0 ? 'Optimal match across subject, budget & weekend slot' : provider.skills.slice(0, 2).join(', ')}
              </div>

              {/* Action Button */}
              {idx === 0 ? (
                <ShinyButton
                  onClick={() => {
                    onOpenChange(false);
                    if (onSelectProvider) onSelectProvider(provider);
                  }}
                  className="w-full text-xs h-9 font-semibold"
                >
                  Choose Top Match
                </ShinyButton>
              ) : (
                <Button
                  variant="outline"
                  onClick={() => {
                    onOpenChange(false);
                    if (onSelectProvider) onSelectProvider(provider);
                  }}
                  className="w-full text-xs h-9"
                >
                  Select {provider.name.split(' ')[0]}
                </Button>
              )}
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
};
