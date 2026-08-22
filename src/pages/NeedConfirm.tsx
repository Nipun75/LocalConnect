import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ParsedRequirement } from '@/types/ai';
import { RequirementSummaryChips } from '@/features/need/RequirementSummaryChips';
import { ShinyButton } from '@/components/ui/shiny-button';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ArrowRight, CheckCircle2 } from 'lucide-react';

export const NeedConfirm: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [requirement, setRequirement] = useState<ParsedRequirement | null>(null);

  useEffect(() => {
    if (location.state?.requirement) {
      setRequirement(location.state.requirement);
    } else {
      const stored = sessionStorage.getItem('active_requirement');
      if (stored) {
        setRequirement(JSON.parse(stored));
      }
    }
  }, [location.state]);

  const handleProceed = () => {
    if (requirement) {
      navigate('/results', { state: { requirement } });
    }
  };

  if (!requirement) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-4">
        <p className="text-muted-foreground mb-4">No active requirement found.</p>
        <Button onClick={() => navigate('/need/understanding')}>Start a New Need</Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-10 px-4 md:px-section-1">
      <div className="max-w-2xl mx-auto bg-card border border-border rounded-2xl p-6 md:p-8 shadow-sm">
        <div className="flex items-center gap-3 mb-6">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="rounded-full">
            <ArrowLeft className="w-5 h-5 text-muted-foreground" />
          </Button>
          <div>
            <span className="text-xs font-semibold text-primary uppercase tracking-wider">
              Step 2 of 2 &bull; Verification
            </span>
            <h1 className="text-2xl font-serif font-normal text-foreground">
              Confirm Your Request Details
            </h1>
          </div>
        </div>

        <div className="space-y-6">
          <div className="p-4 bg-secondary/50 rounded-xl border border-border">
            <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
              Original Natural Language Input:
            </div>
            <p className="text-sm font-medium text-foreground italic">"{requirement.raw_query}"</p>
          </div>

          <div className="space-y-3">
            <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              AI Extracted Filters & Criteria:
            </div>
            <RequirementSummaryChips
              requirement={requirement}
              onUpdateRequirement={(up) => setRequirement(up)}
              editable={true}
            />
          </div>

          <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            <div className="text-xs text-emerald-950 dark:text-emerald-200">
              <p className="font-semibold mb-0.5">7-Factor Hyperlocal Matching Ready</p>
              <p className="opacity-90">
                Our algorithm will rank verified nearby {requirement.service} providers based on skill fit (30%), similarity (20%), distance (15%), availability (10%), budget (10%), trust (10%), and response rate (5%).
              </p>
            </div>
          </div>

          <div className="pt-4 flex items-center justify-between gap-4 border-t border-border">
            <Button variant="outline" onClick={() => navigate('/need/understanding')}>
              Modify Query
            </Button>
            <ShinyButton onClick={handleProceed} className="px-8 h-12 text-sm font-semibold">
              Find Matching Providers
              <ArrowRight className="w-4 h-4 ml-1.5" />
            </ShinyButton>
          </div>
        </div>
      </div>
    </div>
  );
};
