import React, { useState, useEffect } from 'react';
import { ReviewItem } from '@/types/provider';
import { ReviewSummary } from '@/types/ai';
import { aiService } from '@/services/ai/AIService';
import { Sparkles, ThumbsUp, AlertCircle, MessageSquare } from 'lucide-react';

interface AIReviewSummaryProps {
  reviews: ReviewItem[];
  providerTitle: string;
}

export const AIReviewSummary: React.FC<AIReviewSummaryProps> = ({
  reviews,
  providerTitle,
}) => {
  const [summary, setSummary] = useState<ReviewSummary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    async function loadSummary() {
      try {
        const res = await aiService.summarizeReviews(reviews, providerTitle);
        if (isMounted) setSummary(res);
      } catch (err) {
        console.error('Review summary error:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    loadSummary();
    return () => {
      isMounted = false;
    };
  }, [reviews, providerTitle]);

  if (loading || !summary) {
    return (
      <div className="p-4 bg-secondary/50 rounded-xl border border-border animate-pulse space-y-2">
        <div className="h-4 bg-secondary rounded w-1/3" />
        <div className="h-3 bg-secondary rounded w-2/3" />
      </div>
    );
  }

  return (
    <div className="bg-card border border-primary/20 rounded-2xl p-5 md:p-6 shadow-xs space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between gap-2 pb-3 border-b border-border">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-primary/10 text-primary flex items-center justify-center">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-foreground">AI Review Intelligence Summary</h3>
            <p className="text-[11px] text-muted-foreground">
              Synthesized from {summary.total_reviews_analyzed} verified client reviews
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-700 border border-emerald-500/20 text-xs font-bold font-mono">
          <span>{summary.overall_sentiment}</span>
          <span>({summary.sentiment_score}%)</span>
        </div>
      </div>

      {/* Highlights Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* What customers like */}
        <div className="space-y-2 bg-emerald-500/5 p-3.5 rounded-xl border border-emerald-500/15">
          <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-800 dark:text-emerald-300">
            <ThumbsUp className="w-3.5 h-3.5 text-emerald-600" />
            <span>What Customers Consistently Like:</span>
          </div>
          <ul className="space-y-1.5">
            {summary.positive_highlights.map((item, idx) => (
              <li key={idx} className="text-xs text-foreground font-medium flex items-start gap-1.5">
                <span className="text-emerald-600 font-bold">&bull;</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Potential considerations */}
        <div className="space-y-2 bg-amber-500/5 p-3.5 rounded-xl border border-amber-500/15">
          <div className="flex items-center gap-1.5 text-xs font-bold text-amber-800 dark:text-amber-300">
            <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
            <span>Important Booking Considerations:</span>
          </div>
          {summary.potential_concerns.length > 0 ? (
            <ul className="space-y-1.5">
              {summary.potential_concerns.map((item, idx) => (
                <li key={idx} className="text-xs text-foreground font-medium flex items-start gap-1.5">
                  <span className="text-amber-600 font-bold">&bull;</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-xs text-muted-foreground">
              No significant complaints or scheduling concerns noted in recent verified reviews.
            </p>
          )}
        </div>
      </div>

      {/* Typical Customer Experience Synthesis */}
      <div className="p-3 bg-secondary/60 rounded-xl text-xs text-foreground/90 font-medium flex items-start gap-2">
        <MessageSquare className="w-4 h-4 text-primary shrink-0 mt-0.5" />
        <p>"{summary.typical_experience}"</p>
      </div>
    </div>
  );
};
