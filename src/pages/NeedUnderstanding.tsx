import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { NeedParserAssistant } from '@/features/need/NeedParserAssistant';
import { ConversationalRefinement } from '@/features/need/ConversationalRefinement';
import { Sparkles, MessageSquare, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

export const NeedUnderstanding: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const initialQuery = location.state?.query || '';
  const [activeTab, setActiveTab] = useState<'quick' | 'chat'>('quick');

  return (
    <div className="min-h-screen bg-background py-8 md:py-12 px-4 md:px-section-1">
      <div className="max-w-[1100px] mx-auto">
        {/* Back navigation & Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate('/')}
              className="rounded-full hover:bg-secondary"
            >
              <ArrowLeft className="w-5 h-5 text-muted-foreground" />
            </Button>
            <div>
              <div className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-primary bg-primary-soft px-2.5 py-1 rounded-full mb-1">
                <Sparkles className="w-3.5 h-3.5" />
                AI Requirement Parser
              </div>
              <h1 className="font-serif text-3xl md:text-4xl text-foreground font-normal">
                Describe What You Need
              </h1>
            </div>
          </div>

          {/* Mode Switcher */}
          <div className="flex items-center bg-secondary p-1 rounded-lg border border-border">
            <button
              onClick={() => setActiveTab('quick')}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
                activeTab === 'quick'
                  ? 'bg-card text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              ⚡ Quick Parser
            </button>
            <button
              onClick={() => setActiveTab('chat')}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all flex items-center gap-1 ${
                activeTab === 'chat'
                  ? 'bg-card text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <MessageSquare className="w-3 h-3" />
              Conversational Chat
            </button>
          </div>
        </div>

        {/* Content Body */}
        {activeTab === 'quick' ? (
          <NeedParserAssistant initialQuery={initialQuery} />
        ) : (
          <ConversationalRefinement />
        )}
      </div>
    </div>
  );
};
