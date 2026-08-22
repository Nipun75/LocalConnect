import React from 'react';
import { ShieldCheck } from 'lucide-react';
import { TrustScoreBreakdown } from '@/types/provider';

interface TrustScoreBadgeProps {
  trustBreakdown: TrustScoreBreakdown;
  size?: 'sm' | 'md' | 'lg';
  onClick?: () => void;
}

export const TrustScoreBadge: React.FC<TrustScoreBadgeProps> = ({
  trustBreakdown,
  size = 'md',
  onClick,
}) => {
  const score = trustBreakdown.total_score;

  let colorClasses = 'bg-purple-500/10 text-purple-700 border-purple-500/30';
  if (score >= 95) colorClasses = 'bg-emerald-500/10 text-emerald-700 border-emerald-500/30';
  else if (score >= 90) colorClasses = 'bg-blue-500/10 text-blue-700 border-blue-500/30';

  const sizeClasses =
    size === 'sm'
      ? 'px-2 py-0.5 text-xs'
      : size === 'lg'
      ? 'px-4 py-2 text-base'
      : 'px-3 py-1 text-sm';

  return (
    <div
      onClick={onClick}
      className={`inline-flex items-center gap-1.5 rounded-full border font-mono font-bold transition-transform ${
        onClick ? 'cursor-pointer hover:scale-105' : ''
      } ${colorClasses} ${sizeClasses}`}
      title="Click to view full trust verification breakdown"
    >
      <ShieldCheck className="w-4 h-4" />
      <span>{score}/100 TRUST SCORE</span>
    </div>
  );
};
