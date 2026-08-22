import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Send, Sparkles, ArrowRight, Bot, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ShinyButton } from '@/components/ui/shiny-button';
import { ParsedRequirement, ConversationalMessage } from '@/types/ai';
import { aiService } from '@/services/ai/AIService';
import { RequirementSummaryChips } from './RequirementSummaryChips';

interface ConversationalRefinementProps {
  initialRequirement?: ParsedRequirement;
}

export const ConversationalRefinement: React.FC<ConversationalRefinementProps> = ({
  initialRequirement,
}) => {
  const [messages, setMessages] = useState<ConversationalMessage[]>([
    {
      id: 'msg_1',
      sender: 'ai',
      text: initialRequirement
        ? `I understood you need a ${initialRequirement.service}. You can refine your search here (e.g. "show someone cheaper", "must be available Sunday", "near Dharampeth").`
        : "Hello! Tell me what service you need in your own words. I'll understand the details and find the right person nearby.",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      parsed_requirement: initialRequirement,
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [currentReq, setCurrentReq] = useState<ParsedRequirement | null>(initialRequirement || null);
  const [isProcessing, setIsProcessing] = useState(false);
  const navigate = useNavigate();

  const handleSend = async (textToSend?: string) => {
    const text = textToSend || inputText;
    if (!text.trim() || isProcessing) return;

    const userMsg: ConversationalMessage = {
      id: `msg_${Date.now()}`,
      sender: 'user',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText('');
    setIsProcessing(true);

    try {
      let updatedReq: ParsedRequirement;
      if (!currentReq) {
        updatedReq = await aiService.parseRequirement(text);
      } else {
        updatedReq = await aiService.refineRequirement(currentReq, text);
      }
      setCurrentReq(updatedReq);

      let aiResponseText = `I've updated your criteria for ${updatedReq.service}.`;
      if (updatedReq.follow_up_question && updatedReq.missing_fields.length > 0) {
        aiResponseText = `Got it. ${updatedReq.follow_up_question}`;
      } else {
        aiResponseText = `Great! I've updated your requirements: ${updatedReq.service} in ${updatedReq.location.name} (Budget: ₹${updatedReq.budget.max || 'Flexible'}, ${updatedReq.schedule.days?.join(' & ') || updatedReq.schedule.date || 'Flexible schedule'}). Ready to view top matches!`;
      }

      const aiMsg: ConversationalMessage = {
        id: `msg_${Date.now() + 1}`,
        sender: 'ai',
        text: aiResponseText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        parsed_requirement: updatedReq,
      };

      setMessages((prev) => [...prev, aiMsg]);
    } catch (err) {
      console.error('Refinement error:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleGoToMatches = () => {
    if (currentReq) {
      sessionStorage.setItem('active_requirement', JSON.stringify(currentReq));
      navigate('/results', { state: { requirement: currentReq } });
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Chat Messages Column */}
      <div className="lg:col-span-2 flex flex-col h-[520px] bg-card border border-border rounded-xl shadow-sm overflow-hidden">
        <div className="p-4 border-b border-border bg-secondary/40 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-primary flex items-center justify-center text-white">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-foreground">Conversational Match Assistant</h3>
              <p className="text-[11px] text-muted-foreground">Natural Language Refinement</p>
            </div>
          </div>
          {currentReq && (
            <Button size="sm" onClick={handleGoToMatches} className="h-8 text-xs font-semibold gap-1">
              Find Matches <ArrowRight className="w-3.5 h-3.5" />
            </Button>
          )}
        </div>

        {/* Message Log */}
        <div className="flex-1 p-4 overflow-y-auto space-y-4">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex gap-3 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {msg.sender === 'ai' && (
                <div className="w-7 h-7 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0 mt-0.5">
                  <Bot className="w-4 h-4" />
                </div>
              )}
              <div
                className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm ${
                  msg.sender === 'user'
                    ? 'bg-primary text-primary-foreground rounded-br-none'
                    : 'bg-secondary text-foreground rounded-bl-none border border-border'
                }`}
              >
                <p>{msg.text}</p>
                <span className="text-[10px] opacity-70 block mt-1 text-right">
                  {msg.timestamp}
                </span>
              </div>
              {msg.sender === 'user' && (
                <div className="w-7 h-7 rounded-full bg-secondary text-foreground flex items-center justify-center shrink-0 mt-0.5">
                  <User className="w-4 h-4" />
                </div>
              )}
            </div>
          ))}
          {isProcessing && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground animate-pulse p-2">
              <Sparkles className="w-3.5 h-3.5 text-primary animate-spin" />
              Assistant is thinking and refining criteria...
            </div>
          )}
        </div>

        {/* Input Bar */}
        <div className="p-3 border-t border-border bg-background">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex gap-2"
          >
            <Input
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="e.g. Only available this Sunday, or cheaper than ₹450..."
              className="flex-1 text-sm bg-card"
            />
            <Button type="submit" size="icon" disabled={!inputText.trim() || isProcessing} className="shrink-0">
              <Send className="w-4 h-4" />
            </Button>
          </form>
        </div>
      </div>

      {/* Structured State Live Panel */}
      <div className="bg-card border border-border rounded-xl p-5 shadow-sm flex flex-col justify-between h-[520px]">
        <div>
          <div className="flex items-center gap-2 mb-4 pb-3 border-b border-border">
            <Sparkles className="w-4 h-4 text-primary" />
            <h4 className="text-sm font-bold uppercase tracking-wider text-foreground">
              Live Structured Need
            </h4>
          </div>

          {currentReq ? (
            <div className="space-y-4">
              <div className="p-3 bg-secondary/50 rounded-lg border border-border">
                <RequirementSummaryChips
                  requirement={currentReq}
                  onUpdateRequirement={(up) => setCurrentReq(up)}
                  editable={true}
                />
              </div>

              <div className="space-y-2 text-xs">
                <div className="flex justify-between py-1 border-b border-border/60">
                  <span className="text-muted-foreground">Service:</span>
                  <span className="font-semibold text-foreground">{currentReq.service}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-border/60">
                  <span className="text-muted-foreground">Target Area:</span>
                  <span className="font-semibold text-foreground">{currentReq.location.name}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-border/60">
                  <span className="text-muted-foreground">Max Budget:</span>
                  <span className="font-semibold text-emerald-600">
                    {currentReq.budget.max ? `₹${currentReq.budget.max}` : 'Flexible'}
                  </span>
                </div>
                <div className="flex justify-between py-1 border-b border-border/60">
                  <span className="text-muted-foreground">Schedule:</span>
                  <span className="font-semibold text-foreground">
                    {currentReq.schedule.days?.join(', ') || currentReq.schedule.date || 'Flexible'}
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-16 text-muted-foreground text-xs">
              <Sparkles className="w-8 h-8 text-muted-foreground/40 mx-auto mb-2" />
              Type your requirement in the chat to see structured parameters update in real-time.
            </div>
          )}
        </div>

        {currentReq && (
          <ShinyButton onClick={handleGoToMatches} className="w-full h-11 text-sm font-semibold mt-4">
            Search Ranked Providers
            <ArrowRight className="w-4 h-4 ml-1.5" />
          </ShinyButton>
        )}
      </div>
    </div>
  );
};
