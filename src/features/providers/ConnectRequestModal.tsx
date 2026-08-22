import React, { useState } from 'react';
import { Provider } from '@/types/provider';
import { ParsedRequirement } from '@/types/ai';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { CheckCircle2, Send, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ShinyButton } from '@/components/ui/shiny-button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

interface ConnectRequestModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  provider: Provider;
  requirement?: ParsedRequirement;
}

export const ConnectRequestModal: React.FC<ConnectRequestModalProps> = ({
  open,
  onOpenChange,
  provider,
  requirement,
}) => {
  const [userName, setUserName] = useState('');
  const [userPhone, setUserPhone] = useState('');
  const [message, setMessage] = useState(
    requirement
      ? `Hi ${provider.name}, I found you via LocalConnect AI Match for ${requirement.service}. Would like to discuss sessions for ${requirement.schedule.days?.join(' & ') || 'weekends'}.`
      : `Hi ${provider.name}, I would like to connect regarding your services.`
  );
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-700 text-xs font-bold font-mono">
              DIRECT CONNECTION
            </span>
          </div>
          <DialogTitle className="text-xl font-bold text-foreground">
            Connect with {provider.name}
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            Your connection request will be delivered directly to the verified provider.
          </DialogDescription>
        </DialogHeader>

        {submitted ? (
          <div className="py-6 text-center space-y-3 animate-in fade-in">
            <div className="w-12 h-12 rounded-full bg-emerald-500/10 text-emerald-600 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-foreground">Connection Request Sent!</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              {provider.name} typically responds in ~{provider.trust_signals.avg_response_time_minutes} minutes. You will receive an SMS confirmation once accepted.
            </p>
            <Button onClick={() => onOpenChange(false)} className="w-full mt-2 text-xs">
              Done
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 pt-2">
            {/* Quick Provider Snapshot */}
            <div className="p-3 bg-secondary/50 rounded-xl border border-border flex items-center justify-between text-xs">
              <div className="flex items-center gap-2.5">
                <img
                  src={provider.avatar}
                  alt={provider.name}
                  className="w-10 h-10 rounded-lg object-cover"
                />
                <div>
                  <p className="font-bold text-foreground">{provider.name}</p>
                  <p className="text-muted-foreground">{provider.pricing.display_string}</p>
                </div>
              </div>
              <div className="text-right">
                <span className="font-mono font-bold text-purple-600">
                  {provider.trust_breakdown.total_score}/100
                </span>
                <span className="text-[10px] text-muted-foreground block">Trust Score</span>
              </div>
            </div>

            {/* Inputs */}
            <div className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-foreground block mb-1">Your Name:</label>
                <Input
                  required
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  placeholder="e.g. Ankit Sharma"
                  className="text-xs"
                />
              </div>

              <div>
                <label className="font-semibold text-foreground block mb-1">Your Mobile Number:</label>
                <Input
                  required
                  type="tel"
                  value={userPhone}
                  onChange={(e) => setUserPhone(e.target.value)}
                  placeholder="e.g. +91 98765 43210"
                  className="text-xs"
                />
              </div>

              <div>
                <label className="font-semibold text-foreground block mb-1">Message to Provider:</label>
                <Textarea
                  rows={3}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="text-xs resize-none"
                />
              </div>
            </div>

            <div className="p-2.5 bg-emerald-500/5 rounded-lg border border-emerald-500/15 flex items-center gap-2 text-[11px] text-emerald-800 dark:text-emerald-300">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Direct, zero commission connection with verified local professional</span>
            </div>

            <ShinyButton type="submit" className="w-full h-10 text-xs font-semibold">
              <Send className="w-3.5 h-3.5 mr-1.5" />
              Send Connection Request
            </ShinyButton>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
};
