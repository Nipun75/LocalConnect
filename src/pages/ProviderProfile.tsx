import React, { useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { providerService } from '@/services/providerService';
import { TrustScoreBadge } from '@/features/trust/TrustScoreBadge';
import { AIReviewSummary } from '@/features/trust/AIReviewSummary';
import { ConnectRequestModal } from '@/features/providers/ConnectRequestModal';
import { ProfileEnhancerModal } from '@/features/providers/ProfileEnhancerModal';
import {
  Star,
  MapPin,
  Clock,
  ShieldCheck,
  ArrowLeft,
  Wand2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ShinyButton } from '@/components/ui/shiny-button';
import { Badge } from '@/components/ui/badge';

export const ProviderProfile: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();

  const provider = providerService.getProviderById(id || '') || providerService.getAllProviders()[0];
  const [showConnectModal, setShowConnectModal] = useState(Boolean(location.state?.openConnect));
  const [showEnhancerModal, setShowEnhancerModal] = useState(false);

  if (!provider) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-4">
        <p className="text-muted-foreground mb-4">Provider not found.</p>
        <Button onClick={() => navigate('/results')}>Back to Matches</Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-8 md:py-12 px-4 md:px-section-1 lg:px-section-2 pb-24">
      <div className="max-w-[1100px] mx-auto space-y-6">
        {/* Top bar back */}
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(-1)}
            className="text-xs text-muted-foreground hover:text-foreground gap-1.5"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Results
          </Button>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowEnhancerModal(true)}
              className="text-xs font-semibold gap-1.5 h-8 text-primary border-primary/30"
            >
              <Wand2 className="w-3.5 h-3.5" /> AI Profile Helper
            </Button>
          </div>
        </div>

        {/* Hero Card */}
        <div className="bg-card border border-border rounded-2xl p-6 md:p-8 shadow-sm space-y-6">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 pb-6 border-b border-border">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
              <img
                src={provider.avatar}
                alt={provider.name}
                className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl object-cover border border-border shadow-sm shrink-0"
              />
              <div className="space-y-1.5">
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-2xl md:text-3xl font-bold text-foreground">
                    {provider.name}
                  </h1>
                  {provider.trust_signals.identity_verified && (
                    <Badge variant="secondary" className="gap-1 bg-emerald-500/10 text-emerald-700 border-emerald-500/20 text-xs">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                      Verified
                    </Badge>
                  )}
                </div>

                <p className="text-sm md:text-base text-muted-foreground font-medium">
                  {provider.title}
                </p>

                <div className="flex flex-wrap items-center gap-3 text-xs text-foreground font-medium pt-1">
                  <div className="flex items-center gap-1 text-amber-500 font-bold">
                    <Star className="w-4 h-4 fill-current" />
                    <span>{provider.trust_signals.average_rating}</span>
                    <span className="text-muted-foreground font-normal">
                      ({provider.trust_signals.review_count} verified reviews)
                    </span>
                  </div>
                  <span className="text-muted-foreground">&bull;</span>
                  <span className="text-emerald-700 font-semibold">
                    {provider.trust_signals.completed_jobs_count} completed jobs
                  </span>
                  <span className="text-muted-foreground">&bull;</span>
                  <span className="text-muted-foreground">
                    {provider.experience_years} yrs exp
                  </span>
                </div>
              </div>
            </div>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row md:flex-col items-stretch sm:items-center md:items-end gap-3 w-full md:w-auto">
              <TrustScoreBadge
                trustBreakdown={provider.trust_breakdown}
                size="md"
                onClick={() => navigate(`/provider/${provider.id}/trust`)}
              />
              <ShinyButton
                onClick={() => setShowConnectModal(true)}
                className="px-8 h-11 text-sm font-semibold w-full md:w-auto"
              >
                Connect with {provider.name.split(' ')[0]}
              </ShinyButton>
            </div>
          </div>

          {/* Key Attributes Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
            <div className="bg-secondary/40 p-3.5 rounded-xl border border-border space-y-1">
              <span className="text-muted-foreground font-medium flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-primary" /> Location & Radius
              </span>
              <p className="font-bold text-foreground text-sm">{provider.location.area}</p>
              <p className="text-muted-foreground">Serves up to {provider.service_radius_km} km</p>
            </div>

            <div className="bg-secondary/40 p-3.5 rounded-xl border border-border space-y-1">
              <span className="text-muted-foreground font-medium flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-amber-600" /> Availability
              </span>
              <p className="font-bold text-foreground text-sm">{provider.availability.days.slice(0, 2).join(' & ')}</p>
              <p className="text-muted-foreground">{provider.availability.specific_hours || 'Flexible slots'}</p>
            </div>

            <div className="bg-secondary/40 p-3.5 rounded-xl border border-border space-y-1">
              <span className="text-muted-foreground font-medium">Standard Pricing</span>
              <p className="font-bold text-foreground text-sm">{provider.pricing.display_string}</p>
              <p className="text-muted-foreground">No hidden platform fee</p>
            </div>

            <div className="bg-secondary/40 p-3.5 rounded-xl border border-border space-y-1">
              <span className="text-muted-foreground font-medium">Languages</span>
              <p className="font-bold text-foreground text-sm">{provider.languages.join(', ')}</p>
              <p className="text-muted-foreground">Mode: {provider.mode === 'both' ? 'In-Person & Online' : 'In-Person'}</p>
            </div>
          </div>

          {/* About / Bio */}
          <div className="space-y-2">
            <h3 className="text-sm font-bold uppercase tracking-wider text-foreground">
              About the Professional
            </h3>
            <p className="text-sm text-foreground/90 leading-relaxed font-medium">
              {provider.bio}
            </p>
          </div>

          {/* Services & Skills Chips */}
          <div className="space-y-2">
            <h3 className="text-sm font-bold uppercase tracking-wider text-foreground">
              Offered Services & Subjects
            </h3>
            <div className="flex flex-wrap gap-2">
              {provider.services.map((serv) => (
                <span
                  key={serv}
                  className="px-3 py-1 rounded-full bg-primary/10 text-primary border border-primary/20 text-xs font-semibold"
                >
                  {serv}
                </span>
              ))}
              {provider.skills.map((skill) => (
                <span
                  key={skill}
                  className="px-3 py-1 rounded-full bg-secondary text-foreground border border-border text-xs font-medium"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* AI Review Summary (Feature 16) */}
        <AIReviewSummary
          reviews={provider.reviews}
          providerTitle={provider.title}
        />

        {/* Individual Verified Reviews List */}
        <div className="bg-card border border-border rounded-2xl p-6 md:p-8 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-foreground">
              Verified Customer Reviews ({provider.reviews.length})
            </h3>
            <span className="text-xs text-muted-foreground">All reviews are from verified bookings</span>
          </div>

          <div className="space-y-3">
            {provider.reviews.map((rev) => (
              <div key={rev.id} className="p-4 bg-secondary/30 rounded-xl border border-border space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-foreground">{rev.author_name}</span>
                    <span className="text-[11px] text-muted-foreground">({rev.author_location})</span>
                  </div>
                  <div className="flex items-center gap-1 text-amber-500 text-xs font-bold">
                    <Star className="w-3 h-3 fill-current" />
                    <span>{rev.rating}</span>
                    <span className="text-muted-foreground font-normal ml-1">{rev.date}</span>
                  </div>
                </div>
                <p className="text-xs text-foreground/90 font-medium leading-relaxed">
                  "{rev.text}"
                </p>
                {rev.tags && rev.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 pt-1">
                    {rev.tags.map((t) => (
                      <span key={t} className="px-2 py-0.5 rounded-md bg-secondary text-[10px] text-muted-foreground font-medium">
                        #{t}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Connect Modal */}
      <ConnectRequestModal
        open={showConnectModal}
        onOpenChange={setShowConnectModal}
        provider={provider}
      />

      {/* AI Profile Enhancer */}
      <ProfileEnhancerModal
        open={showEnhancerModal}
        onOpenChange={setShowEnhancerModal}
        defaultCategory={provider.category}
        providerName={provider.name}
      />
    </div>
  );
};
