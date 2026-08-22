import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { providerService } from '@/services/providerService';
import { ArrowLeft, CheckCircle2, UserCheck, Award, MessageSquare, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';

export const ProviderTrust: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const provider = providerService.getProviderById(id || '') || providerService.getAllProviders()[0];
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
        `${provider.experience_years} years of total active experience in Nagpur`,
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
    <div className="min-h-screen bg-background py-8 md:py-12 px-4 md:px-section-1 lg:px-section-2">
      <div className="max-w-[900px] mx-auto space-y-6">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate(-1)}
          className="text-xs text-muted-foreground hover:text-foreground gap-1.5"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Profile
        </Button>

        <div className="bg-card border border-border rounded-2xl p-6 md:p-8 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-border">
            <div className="flex items-center gap-4">
              <img
                src={provider.avatar}
                alt={provider.name}
                className="w-16 h-16 rounded-xl object-cover"
              />
              <div>
                <span className="text-xs font-mono font-bold text-purple-600 bg-purple-500/10 px-2.5 py-0.5 rounded-full">
                  VERIFIED TRUST AUDIT
                </span>
                <h1 className="text-2xl font-bold text-foreground mt-1">
                  {provider.name}
                </h1>
                <p className="text-xs text-muted-foreground">{provider.title}</p>
              </div>
            </div>

            <div className="text-center sm:text-right bg-secondary/60 p-3 rounded-xl border border-border">
              <span className="font-mono font-bold text-2xl text-purple-600">
                {trust_breakdown.total_score}/100
              </span>
              <span className="text-xs text-muted-foreground block font-medium">
                Overall Trust Score
              </span>
            </div>
          </div>

          <div className="space-y-4">
            <h2 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
              Verification Breakdown & Metrics:
            </h2>
            <div className="space-y-3">
              {metrics.map((m) => {
                const Icon = m.icon;
                return (
                  <div key={m.title} className="p-4 bg-secondary/30 rounded-xl border border-border space-y-2">
                    <div className="flex items-center justify-between text-xs font-bold text-foreground">
                      <div className="flex items-center gap-2">
                        <Icon className="w-4 h-4 text-primary" />
                        <span>{m.title}</span>
                      </div>
                      <span className="font-mono text-primary">{m.score}</span>
                    </div>
                    <ul className="space-y-1.5 pt-1">
                      {m.details.map((d, i) => (
                        <li key={i} className="flex items-start gap-2 text-xs text-foreground/80 font-medium">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                          <span>{d}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-xs text-emerald-950 dark:text-emerald-200">
            <p className="font-semibold mb-1">LocalConnect Trust Promise</p>
            <p className="opacity-90 leading-relaxed">
              We never fabricate qualifications, ratings, response rates, or client reviews. Every metric is computed automatically from platform usage logs and verified government document checks.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
