import React from 'react';
import { RankingWeights, DEFAULT_RANKING_WEIGHTS } from '@/types/ai';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Sliders, RotateCcw, Award, Check, MapPin, Clock, DollarSign, ShieldCheck, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface AlgorithmWeightDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  weights: RankingWeights;
  onWeightsChange: (weights: RankingWeights) => void;
}

export const AlgorithmWeightDrawer: React.FC<AlgorithmWeightDrawerProps> = ({
  open,
  onOpenChange,
  weights,
  onWeightsChange,
}) => {
  const handleSliderChange = (key: keyof RankingWeights, value: number) => {
    onWeightsChange({
      ...weights,
      [key]: value / 100,
    });
  };

  const handleReset = () => {
    onWeightsChange(DEFAULT_RANKING_WEIGHTS);
  };

  const sliders = [
    {
      key: 'skill_relevance' as keyof RankingWeights,
      label: 'Service & Skill Relevance',
      desc: 'Matches subject keywords, experience tags, and domain taxonomy',
      icon: Award,
      val: Math.round(weights.skill_relevance * 100),
      color: 'accent-blue-600',
    },
    {
      key: 'requirement_similarity' as keyof RankingWeights,
      label: 'Requirement Similarity',
      desc: 'Matches specific educational board, level, and preferences',
      icon: Check,
      val: Math.round(weights.requirement_similarity * 100),
      color: 'accent-indigo-600',
    },
    {
      key: 'distance' as keyof RankingWeights,
      label: 'Distance & Hyperlocal Proximity',
      desc: 'Penalizes providers located farther away from landmark',
      icon: MapPin,
      val: Math.round(weights.distance * 100),
      color: 'accent-emerald-600',
    },
    {
      key: 'availability' as keyof RankingWeights,
      label: 'Schedule Availability',
      desc: 'Aligns requested days (e.g. weekends) with open provider slots',
      icon: Clock,
      val: Math.round(weights.availability * 100),
      color: 'accent-amber-600',
    },
    {
      key: 'budget_compatibility' as keyof RankingWeights,
      label: 'Budget Compatibility',
      desc: 'Evaluates rates against user target budget threshold',
      icon: DollarSign,
      val: Math.round(weights.budget_compatibility * 100),
      color: 'accent-green-600',
    },
    {
      key: 'trust_reputation' as keyof RankingWeights,
      label: 'Local Trust & Verification',
      desc: 'Aadhaar identity, completed jobs, and verified parent reviews',
      icon: ShieldCheck,
      val: Math.round(weights.trust_reputation * 100),
      color: 'accent-purple-600',
    },
    {
      key: 'response_reliability' as keyof RankingWeights,
      label: 'Response Reliability',
      desc: 'Fast reply response rate and low cancellation history',
      icon: Star,
      val: Math.round(weights.response_reliability * 100),
      color: 'accent-teal-600',
    },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                <Sliders className="w-4 h-4" />
              </div>
              <DialogTitle className="text-lg font-bold text-foreground">
                Customize Matching Algorithm
              </DialogTitle>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleReset}
              className="text-xs text-muted-foreground hover:text-primary gap-1"
            >
              <RotateCcw className="w-3 h-3" /> Reset Defaults
            </Button>
          </div>
          <DialogDescription className="text-xs text-muted-foreground">
            Adjust the weights assigned to each matching parameter. Candidate ranking and scores update dynamically.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 pt-2">
          {sliders.map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.key} className="space-y-1 bg-secondary/40 p-3 rounded-xl border border-border">
                <div className="flex items-center justify-between text-xs font-semibold">
                  <div className="flex items-center gap-1.5 text-foreground">
                    <Icon className="w-3.5 h-3.5 text-primary" />
                    <span>{item.label}</span>
                  </div>
                  <span className="font-mono text-primary font-bold">{item.val}%</span>
                </div>
                <p className="text-[10px] text-muted-foreground">{item.desc}</p>
                <input
                  type="range"
                  min="0"
                  max="60"
                  step="5"
                  value={item.val}
                  onChange={(e) => handleSliderChange(item.key, parseInt(e.target.value, 10))}
                  className={`w-full h-1.5 bg-secondary-foreground/20 rounded-lg cursor-pointer ${item.color}`}
                />
              </div>
            );
          })}
        </div>

        <div className="pt-2 border-t border-border flex justify-end">
          <Button onClick={() => onOpenChange(false)} className="text-xs font-semibold px-6">
            Apply & View Ranking
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
