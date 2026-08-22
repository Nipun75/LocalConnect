import React from 'react';
import { Provider } from '@/types/provider';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { CheckCircle2, UserCheck, Award, MessageSquare, Clock } from 'lucide-react';

interface TrustBreakdownModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  provider: Provider;
}

export const TrustBreakdownModal: React.FC<TrustBreakdownModalProps> = ({
  open,
  onOpenChange,
  provider,
}) => {
  const { trust_signals, trust_breakdown } = provider;

  const metrics = [
    {
      title: 'Identity & Address Verification',
      score: `${trust_breakdown.identity_points} / 25 pts`,
      icon: UserCheck,
      details: [
        trust_signals.identity_verified ? 'Government Photo ID verified (Aadhaar / Passport)' : 'Identity unverified',
        trust_signals.address_verified ? 'Residential address in Nagpur verified' : 'Address unverified',
        trust_signals.skill_certified ? 'Professional degrees & teaching certifications verified' : 'Self-declared skills',
      ],
    },
    {
      title: 'Experience & Track Record',
      score: `${trust_breakdown.experience_points} / 25 pts`,
      icon: Award,
      details: [
        `${trust_signals.completed_jobs_count} verified service jobs completed on LocalConnect`,
        `${trust_signals.repeat_customers_count} repeat local customers`,
        `${provider.experience_years} years of total active experience`,
      ],
    },
    {
      title: 'Customer Feedback & Ratings',
      score: `${trust_breakdown.rating_points} / 30 pts`,
      icon: MessageSquare,
      details: [
        `${trust_signals.average_rating}★ overall average score`,
        `${trust_signals.review_count} verified written customer reviews`,
        `${trust_signals.community_endorsements_count} neighborhood recommendations`,
      ],
    },
    {
      title: 'Responsiveness & Reliability',
      score: `${trust_breakdown.responsiveness_points} / 20 pts`,
      icon: Clock,
      details: [
        `${trust_signals.response_rate_percent}% response rate to inquiries`,
        `Average response time ~${trust_signals.avg_response_time_minutes} minutes`,
        `${trust_signals.cancellation_rate_percent}% cancellation rate (Low risk)`,
      ],
    },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full bg-purple-500/10 text-purple-700 text-xs font-bold font-mono">
              VERIFIED TRUST AUDIT
            </span>
          </div>
          <DialogTitle className="text-xl font-bold text-foreground">
            Trust Breakdown for {provider.name}
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            LocalConnect calculates trust using transparent, verifiable platform metrics without black-box inferences.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 pt-2">
          {/* Total Trust Score Banner */}
          <div className="p-4 bg-secondary/70 rounded-xl border border-border flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-purple-600 text-white font-mono font-bold text-lg flex items-center justify-center shadow-xs">
                {trust_breakdown.total_score}
              </div>
              <div>
                <h4 className="text-sm font-bold text-foreground">Overall Trust Score</h4>
                <p className="text-xs text-muted-foreground">Calculated across 4 verified dimensions</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-1 max-w-[200px] justify-end">
              {trust_breakdown.badges.slice(0, 2).map((badge) => (
                <span key={badge} className="px-2 py-0.5 rounded-full bg-card text-[10px] font-semibold border border-border text-foreground">
                  {badge}
                </span>
              ))}
            </div>
          </div>

          {/* 4 Trust Dimensions */}
          <div className="space-y-3">
            {metrics.map((m) => {
              const Icon = m.icon;
              return (
                <div key={m.title} className="p-3.5 bg-card rounded-xl border border-border space-y-2">
                  <div className="flex items-center justify-between text-xs font-bold text-foreground">
                    <div className="flex items-center gap-1.5">
                      <Icon className="w-4 h-4 text-primary" />
                      <span>{m.title}</span>
                    </div>
                    <span className="font-mono text-primary">{m.score}</span>
                  </div>
                  <ul className="space-y-1">
                    {m.details.map((d, i) => (
                      <li key={i} className="flex items-start gap-1.5 text-xs text-foreground/80 font-medium">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                        <span>{d}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
