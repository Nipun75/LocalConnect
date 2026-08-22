import React from 'react';
import { Provider } from '@/types/provider';
import { ProviderMatch, RankingWeights, DEFAULT_RANKING_WEIGHTS } from '@/types/ai';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Check, AlertCircle, ShieldCheck, MapPin, DollarSign, Clock, Star, Award } from 'lucide-react';

interface MatchExplanationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  provider: Provider;
  match: ProviderMatch;
  weights?: RankingWeights;
}

export const MatchExplanationDialog: React.FC<MatchExplanationDialogProps> = ({
  open,
  onOpenChange,
  provider,
  match,
  weights = DEFAULT_RANKING_WEIGHTS,
}) => {
  const { score_breakdown, explanation } = match;

  const factorList = [
    {
      name: 'Skill & Service Fit',
      weight: `${Math.round(weights.skill_relevance * 100)}%`,
      score: score_breakdown.skill_relevance,
      icon: Award,
      color: 'text-blue-600',
    },
    {
      name: 'Requirement Similarity',
      weight: `${Math.round(weights.requirement_similarity * 100)}%`,
      score: score_breakdown.requirement_similarity,
      icon: Check,
      color: 'text-indigo-600',
    },
    {
      name: 'Hyperlocal Proximity',
      weight: `${Math.round(weights.distance * 100)}%`,
      score: score_breakdown.distance,
      icon: MapPin,
      color: 'text-emerald-600',
    },
    {
      name: 'Schedule Availability',
      weight: `${Math.round(weights.availability * 100)}%`,
      score: score_breakdown.availability,
      icon: Clock,
      color: 'text-amber-600',
    },
    {
      name: 'Budget Compatibility',
      weight: `${Math.round(weights.budget_compatibility * 100)}%`,
      score: score_breakdown.budget_compatibility,
      icon: DollarSign,
      color: 'text-green-600',
    },
    {
      name: 'Verified Local Trust',
      weight: `${Math.round(weights.trust_reputation * 100)}%`,
      score: score_breakdown.trust_reputation,
      icon: ShieldCheck,
      color: 'text-purple-600',
    },
    {
      name: 'Response Reliability',
      weight: `${Math.round(weights.response_reliability * 100)}%`,
      score: score_breakdown.response_reliability,
      icon: Star,
      color: 'text-teal-600',
    },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full bg-primary/10 text-primary text-xs font-bold font-mono">
              {match.match_score}% OVERALL MATCH
            </span>
            <span className="text-xs text-muted-foreground">Explainable AI Audit</span>
          </div>
          <DialogTitle className="text-xl font-bold text-foreground">
            Why AI Recommended {provider.name}
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            Recommendations are generated strictly from verified provider profile data, distance measurements, and customer review records.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5 pt-2">
          {/* AI Synthesis Summary */}
          <div className="p-3.5 bg-secondary/70 rounded-xl border border-border">
            <p className="text-xs font-semibold text-primary uppercase tracking-wider mb-1">
              Match Verdict:
            </p>
            <p className="text-sm text-foreground font-medium">{explanation.headline}</p>
          </div>

          {/* Factual Highlights */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">
              Verified Match Signals:
            </h4>
            <ul className="space-y-1.5">
              {explanation.bullet_points.map((pt, i) => (
                <li key={i} className="flex items-start gap-2 text-xs text-foreground font-medium">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>{pt}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Caveats if any */}
          {explanation.caveats && explanation.caveats.length > 0 && (
            <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl">
              <h4 className="text-xs font-bold uppercase tracking-wider text-amber-900 dark:text-amber-300 mb-1 flex items-center gap-1.5">
                <AlertCircle className="w-3.5 h-3.5" /> Noticeable Deviations / Caveats:
              </h4>
              <ul className="space-y-1 text-xs text-amber-900/90 dark:text-amber-200">
                {explanation.caveats.map((cav, idx) => (
                  <li key={idx}>&bull; {cav}</li>
                ))}
              </ul>
            </div>
          )}

          {/* 7-Factor Scorecard Breakdown */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">
              7-Factor Weighted Algorithm Scorecard:
            </h4>
            <div className="space-y-3">
              {factorList.map((factor) => {
                const IconComponent = factor.icon;
                return (
                  <div key={factor.name} className="space-y-1">
                    <div className="flex items-center justify-between text-xs font-medium">
                      <div className="flex items-center gap-1.5">
                        <IconComponent className={`w-3.5 h-3.5 ${factor.color}`} />
                        <span className="text-foreground">{factor.name}</span>
                        <span className="text-[10px] text-muted-foreground">({factor.weight} wt)</span>
                      </div>
                      <span className="font-mono font-bold text-foreground">{factor.score} / 100</span>
                    </div>
                    <div className="w-full bg-secondary h-2 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary transition-all rounded-full"
                        style={{ width: `${factor.score}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
