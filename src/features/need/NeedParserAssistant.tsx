import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mic, MicOff, Sparkles, ArrowRight, Loader2, RefreshCw } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ShinyButton } from '@/components/ui/shiny-button';
import { aiService } from '@/services/ai/AIService';
import { ParsedRequirement } from '@/types/ai';
import { RequirementSummaryChips } from './RequirementSummaryChips';

interface NeedParserAssistantProps {
  initialQuery?: string;
  onParsed?: (requirement: ParsedRequirement) => void;
  autoFocus?: boolean;
}

export const QUICK_DEMO_PROMPTS = [
  {
    title: '🎓 Maths Tutor (Class 12)',
    query: 'I need a maths tutor for my 12th-standard brother, weekends, within 3 km, budget ₹500.',
    tag: 'Tutor Demo',
  },
  {
    title: '❄️ AC Repair (Hinglish)',
    query: 'AC cooling nahi kar raha, kal shaam tak Dharampeth me 1000 ke andar technician chahiye.',
    tag: 'Hinglish Demo',
  },
  {
    title: '⚡ Emergency Electrician',
    query: 'Need an emergency electrician in Dharampeth right now for short circuit.',
    tag: 'Urgent Demo',
  },
  {
    title: '📸 Wedding Photographer',
    query: 'Looking for a wedding photographer for December 20 under ₹15,000.',
    tag: 'Event Demo',
  },
  {
    title: '🧘 Female Yoga Trainer',
    query: 'Need a female yoga instructor nearby for home sessions, budget around ₹500.',
    tag: 'Wellness Demo',
  },
];

export const NeedParserAssistant: React.FC<NeedParserAssistantProps> = ({
  initialQuery = '',
  onParsed,
  autoFocus = true,
}) => {
  const [query, setQuery] = useState(initialQuery);
  const [isListening, setIsListening] = useState(false);
  const [isParsing, setIsParsing] = useState(false);
  const [parsedResult, setParsedResult] = useState<ParsedRequirement | null>(null);
  const [speechSupported, setSpeechSupported] = useState(false);
  const recognitionRef = useRef<any>(null);
  const navigate = useNavigate();

  // Check Web Speech API support
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        setSpeechSupported(true);
        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.lang = 'en-IN'; // Indian English / Hinglish support

        recognition.onresult = (event: any) => {
          const transcript = event.results[0][0].transcript;
          setQuery(transcript);
          setIsListening(false);
          handleParseQuery(transcript);
        };

        recognition.onerror = () => {
          setIsListening(false);
        };

        recognition.onend = () => {
          setIsListening(false);
        };

        recognitionRef.current = recognition;
      }
    }
  }, []);

  // Parse initial query if provided
  useEffect(() => {
    if (initialQuery && !parsedResult) {
      handleParseQuery(initialQuery);
    }
  }, [initialQuery]);

  const toggleListening = () => {
    if (!speechSupported) {
      alert('Speech recognition is not supported in this browser. Please type your requirement.');
      return;
    }

    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
    } else {
      setIsListening(true);
      recognitionRef.current?.start();
    }
  };

  const handleParseQuery = async (textToParse: string) => {
    if (!textToParse.trim()) return;
    setIsParsing(true);
    try {
      const result = await aiService.parseRequirement(textToParse);
      setParsedResult(result);
      if (onParsed) onParsed(result);
    } catch (err) {
      console.error('Parsing error:', err);
    } finally {
      setIsParsing(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      handleParseQuery(query);
    }
  };

  const handleProceedToMatches = () => {
    if (parsedResult) {
      // Store in session/state and navigate to results
      sessionStorage.setItem('active_requirement', JSON.stringify(parsedResult));
      navigate('/results', { state: { requirement: parsedResult } });
    }
  };

  return (
    <div className="w-full max-w-[850px] mx-auto flex flex-col gap-6">
      {/* Search Input Box */}
      <form
        onSubmit={handleSubmit}
        className="relative bg-card border-2 border-border-interactive focus-within:border-primary rounded-xl p-2 md:p-3 shadow-md transition-all"
      >
        <div className="flex items-center gap-2">
          <div className="p-2 text-primary">
            <Sparkles className="w-5 h-5 animate-pulse" />
          </div>

          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Tell us what you need in your own words... (e.g. Maths tutor for 12th, ₹500, weekends)"
            className="flex-1 border-0 focus-visible:ring-0 text-base md:text-lg bg-transparent shadow-none px-2 text-foreground placeholder:text-muted-foreground/70"
            autoFocus={autoFocus}
          />

          {/* Voice Input Button */}
          {speechSupported && (
            <Button
              type="button"
              variant={isListening ? 'destructive' : 'ghost'}
              size="icon"
              onClick={toggleListening}
              className={`rounded-full shrink-0 transition-all ${
                isListening ? 'animate-bounce' : 'text-muted-foreground hover:text-primary'
              }`}
              title={isListening ? 'Listening... Speak now' : 'Speak your requirement'}
            >
              {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
            </Button>
          )}

          <Button
            type="submit"
            disabled={!query.trim() || isParsing}
            className="rounded-lg px-5 h-11 shrink-0 font-medium"
          >
            {isParsing ? (
              <Loader2 className="w-4 h-4 animate-spin mr-1" />
            ) : (
              <ArrowRight className="w-4 h-4 mr-1" />
            )}
            Analyze
          </Button>
        </div>

        {/* Listening indicator */}
        {isListening && (
          <div className="flex items-center gap-2 px-3 pt-2 text-xs text-destructive font-medium animate-pulse">
            <span className="w-2 h-2 rounded-full bg-destructive animate-ping" />
            Listening to your speech (English / Hinglish)... Speak your requirement naturally.
          </div>
        )}
      </form>

      {/* Quick Demo Scenarios (Hackathon showcase buttons) */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            ⚡ Quick Demo Scenarios:
          </span>
          <span className="text-xs text-primary font-medium hidden sm:inline">
            1-Click Natural Language Testing
          </span>
        </div>
        <div className="flex flex-wrap gap-2">
          {QUICK_DEMO_PROMPTS.map((demo) => (
            <button
              key={demo.title}
              type="button"
              onClick={() => {
                setQuery(demo.query);
                handleParseQuery(demo.query);
              }}
              className="text-left px-3 py-1.5 rounded-lg border border-border bg-card hover:bg-primary-soft hover:border-primary/40 text-xs font-medium text-foreground transition-all flex items-center gap-1.5"
            >
              <span>{demo.title}</span>
            </button>
          ))}
        </div>
      </div>

      {/* AI Assistant Output Card */}
      {parsedResult && (
        <div className="bg-card border border-primary/30 rounded-xl p-5 md:p-6 shadow-lg animate-in fade-in slide-in-from-bottom-3 duration-300">
          <div className="flex items-start justify-between gap-4 mb-4">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold shadow-sm">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-foreground">
                  LocalConnect Match Assistant
                </h3>
                <p className="text-xs text-muted-foreground">
                  Understood in {parsedResult.language_detected === 'hinglish' ? 'Hinglish' : 'English'} &bull; Confidence: {Math.round(parsedResult.confidence_score * 100)}%
                </p>
              </div>
            </div>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleParseQuery(query)}
              className="text-xs text-muted-foreground hover:text-primary gap-1"
            >
              <RefreshCw className="w-3 h-3" /> Re-parse
            </Button>
          </div>

          <div className="space-y-4">
            <p className="text-body text-foreground font-medium">
              I can help you find a <span className="text-primary font-bold">{parsedResult.service}</span> nearby.
            </p>

            {/* Extracted Structured Requirement Chips */}
            <div className="bg-secondary/60 p-3.5 rounded-lg border border-border">
              <div className="text-xs text-muted-foreground font-semibold uppercase tracking-wider mb-2">
                Structured Parameters Extracted:
              </div>
              <RequirementSummaryChips
                requirement={parsedResult}
                onUpdateRequirement={(updated) => setParsedResult(updated)}
                editable={true}
              />
            </div>

            {/* Follow-up question if information is missing */}
            {parsedResult.follow_up_question && (
              <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-3 text-xs text-amber-900 dark:text-amber-200">
                <span className="font-semibold">Note:</span> {parsedResult.follow_up_question}
              </div>
            )}

            {/* Call to action */}
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3">
              <span className="text-xs text-muted-foreground">
                Ready to find verified local providers matching this exact criteria?
              </span>
              <ShinyButton
                onClick={handleProceedToMatches}
                className="w-full sm:w-auto px-6 h-11 text-sm font-semibold"
              >
                Find Best Matches
                <ArrowRight className="w-4 h-4 ml-1.5" />
              </ShinyButton>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
