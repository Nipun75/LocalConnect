import React, { useState } from 'react';
import { ThumbsUp, ThumbsDown, Check } from 'lucide-react';
import { providerService } from '@/services/providerService';

interface RecommendationFeedbackProps {
  providerId: string;
  requestId: string;
}

export const RecommendationFeedback: React.FC<RecommendationFeedbackProps> = ({
  providerId,
  requestId,
}) => {
  const [feedback, setFeedback] = useState<'yes' | 'no' | null>(null);

  const handleFeedback = (useful: boolean) => {
    setFeedback(useful ? 'yes' : 'no');
    providerService.recordFeedback({
      provider_id: providerId,
      request_id: requestId,
      useful,
    });
  };

  if (feedback) {
    return (
      <span className="inline-flex items-center gap-1 text-[11px] text-muted-foreground bg-secondary/80 px-2.5 py-1 rounded-md">
        <Check className="w-3 h-3 text-emerald-600" />
        Thanks for feedback!
      </span>
    );
  }

  return (
    <div className="flex items-center gap-1 bg-secondary/60 px-2 py-1 rounded-lg border border-border/60 text-xs">
      <span className="text-[11px] text-muted-foreground hidden sm:inline mr-1">
        Useful match?
      </span>
      <button
        onClick={() => handleFeedback(true)}
        className="p-1 hover:text-emerald-600 hover:bg-emerald-500/10 rounded transition-colors text-muted-foreground"
        title="Yes, good match"
      >
        <ThumbsUp className="w-3.5 h-3.5" />
      </button>
      <button
        onClick={() => handleFeedback(false)}
        className="p-1 hover:text-rose-600 hover:bg-rose-500/10 rounded transition-colors text-muted-foreground"
        title="No, not relevant"
      >
        <ThumbsDown className="w-3.5 h-3.5" />
      </button>
    </div>
  );
};
