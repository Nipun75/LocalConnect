import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Loader2, Copy, Check, Wand2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ShinyButton } from '@/components/ui/shiny-button';
import { aiService } from '@/services/ai/AIService';
import { ProfileEnhancementResult } from '@/types/ai';

interface ProfileEnhancerModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultCategory?: string;
  providerName?: string;
}

export const ProfileEnhancerModal: React.FC<ProfileEnhancerModalProps> = ({
  open,
  onOpenChange,
  defaultCategory = 'Education & Tutors',
  providerName = 'Rahul Sharma',
}) => {
  const [category] = useState(defaultCategory);
  const [rawSkills, setRawSkills] = useState('I teach maths for 10th and 12th class, calculus, board exams');
  const [rawExperience, setRawExperience] = useState('5 years private tutoring, good results in CBSE');
  const [rawAvailability, setRawAvailability] = useState('Weekends Saturday and Sunday evenings');

  const [isEnhancing, setIsEnhancing] = useState(false);
  const [enhancedResult, setEnhancedResult] = useState<ProfileEnhancementResult | null>(null);
  const [copied, setCopied] = useState(false);

  const handleEnhance = async () => {
    setIsEnhancing(true);
    try {
      const res = await aiService.enhanceProfile({
        provider_name: providerName,
        category,
        raw_skills: rawSkills,
        raw_experience: rawExperience,
        raw_availability: rawAvailability,
      });
      setEnhancedResult(res);
    } catch (err) {
      console.error('Enhancement error:', err);
    } finally {
      setIsEnhancing(false);
    }
  };

  const handleCopy = () => {
    if (!enhancedResult) return;
    const text = `${enhancedResult.suggested_title}\n\n${enhancedResult.professional_tagline}\n\n${enhancedResult.enhanced_bio}\n\nHighlights:\n${enhancedResult.bullet_highlights.map((b) => `• ${b}`).join('\n')}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full bg-primary/10 text-primary text-xs font-bold font-mono">
              AI PROFILE ENHANCER
            </span>
          </div>
          <DialogTitle className="text-xl font-bold text-foreground">
            Enrich Your Service Listing
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            Convert your raw experience and skills into a polished, professional description without exaggerating credentials.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 pt-2">
          {/* Input Fields */}
          <div className="space-y-3">
            <div>
              <label className="text-xs font-semibold text-foreground block mb-1">
                Your Primary Skills / Subjects:
              </label>
              <Input
                value={rawSkills}
                onChange={(e) => setRawSkills(e.target.value)}
                placeholder="e.g. Maths, 10th-12th board prep, calculus"
                className="text-xs"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-foreground block mb-1">
                Experience & Track Record:
              </label>
              <Input
                value={rawExperience}
                onChange={(e) => setRawExperience(e.target.value)}
                placeholder="e.g. 5 years tutoring, CBSE syllabus"
                className="text-xs"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-foreground block mb-1">
                Availability & Timings:
              </label>
              <Input
                value={rawAvailability}
                onChange={(e) => setRawAvailability(e.target.value)}
                placeholder="e.g. Weekends, Saturday & Sunday"
                className="text-xs"
              />
            </div>

            <ShinyButton
              onClick={handleEnhance}
              disabled={isEnhancing}
              className="w-full text-xs h-10 font-semibold"
            >
              {isEnhancing ? (
                <Loader2 className="w-4 h-4 animate-spin mr-1.5" />
              ) : (
                <Wand2 className="w-4 h-4 mr-1.5" />
              )}
              Generate Polished Profile Listing
            </ShinyButton>
          </div>

          {/* AI Result */}
          {enhancedResult && (
            <div className="p-4 bg-secondary/60 rounded-xl border border-primary/20 space-y-3 animate-in fade-in">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-primary uppercase tracking-wider">
                  AI Enhanced Output:
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleCopy}
                  className="text-xs text-muted-foreground hover:text-primary gap-1 h-7"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  {copied ? 'Copied!' : 'Copy'}
                </Button>
              </div>

              <div>
                <span className="text-[10px] text-muted-foreground uppercase font-bold">
                  Suggested Headline Title:
                </span>
                <p className="text-sm font-bold text-foreground">{enhancedResult.suggested_title}</p>
              </div>

              <div>
                <span className="text-[10px] text-muted-foreground uppercase font-bold">
                  Professional Tagline:
                </span>
                <p className="text-xs text-foreground font-medium">{enhancedResult.professional_tagline}</p>
              </div>

              <div>
                <span className="text-[10px] text-muted-foreground uppercase font-bold">
                  Enhanced Bio:
                </span>
                <p className="text-xs text-foreground leading-relaxed">{enhancedResult.enhanced_bio}</p>
              </div>

              <div>
                <span className="text-[10px] text-muted-foreground uppercase font-bold">
                  Highlights:
                </span>
                <ul className="space-y-1 mt-1">
                  {enhancedResult.bullet_highlights.map((b, i) => (
                    <li key={i} className="text-xs text-foreground font-medium flex items-center gap-1.5">
                      <span className="text-primary font-bold">&bull;</span>
                      <span>{b}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
