import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { aiService } from '@/services/ai/AIService';
import { providerService } from '@/services/providerService';
import { Provider } from '@/types/provider';
import { MapPin, Sparkles, ShieldCheck, Bookmark } from 'lucide-react';
import { Button } from '@/components/ui/button';

export const Profile: React.FC = () => {
  const navigate = useNavigate();
  const [activeProviderName] = useState(aiService.getActiveProviderName());
  const [demoMode, setDemoMode] = useState(aiService.isDemoMode());
  const savedProviders: Provider[] = providerService.getAllProviders().slice(0, 2);

  const toggleDemoMode = () => {
    const next = !demoMode;
    setDemoMode(next);
    aiService.setDemoMode(next);
  };

  return (
    <div className="min-h-screen bg-background py-8 md:py-12 px-4 md:px-section-1 lg:px-section-2 pb-24">
      <div className="max-w-[1000px] mx-auto space-y-6">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-primary bg-primary-soft px-2.5 py-0.5 rounded-full">
            Account & Settings
          </span>
          <h1 className="font-serif text-3xl md:text-4xl text-foreground font-normal mt-1">
            User Profile & AI Configuration
          </h1>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* User Details */}
          <div className="bg-card border border-border rounded-2xl p-6 shadow-xs space-y-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-primary/10 text-primary flex items-center justify-center font-bold text-2xl">
                A
              </div>
              <div>
                <h2 className="text-lg font-bold text-foreground">Ankit Sharma</h2>
                <p className="text-xs text-muted-foreground">ankit.sharma@example.com</p>
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 mt-1">
                  <ShieldCheck className="w-3.5 h-3.5" /> Verified Citizen
                </span>
              </div>
            </div>

            <div className="space-y-3 pt-3 border-t border-border text-xs">
              <div>
                <span className="text-muted-foreground block mb-1">Default Neighborhood:</span>
                <div className="flex items-center gap-1.5 font-bold text-foreground bg-secondary p-2.5 rounded-xl border border-border">
                  <MapPin className="w-4 h-4 text-primary" />
                  <span>Dharampeth, Nagpur (440010)</span>
                </div>
              </div>
            </div>
          </div>

          {/* AI Configuration & Demo Mode */}
          <div className="md:col-span-2 bg-card border border-border rounded-2xl p-6 shadow-xs space-y-5">
            <div className="flex items-center gap-2 pb-3 border-b border-border">
              <Sparkles className="w-5 h-5 text-primary" />
              <div>
                <h3 className="text-base font-bold text-foreground">LocalConnect AI Intelligence Engine</h3>
                <p className="text-xs text-muted-foreground">Provider Abstraction & Dual-Engine Fallback</p>
              </div>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between p-3 bg-secondary/50 rounded-xl border border-border">
                <div>
                  <span className="font-bold text-foreground block">Active NLP Engine:</span>
                  <span className="text-muted-foreground">
                    Google Gemini 1.5/2.0 API + Offline Deterministic Rule Normalizer
                  </span>
                </div>
                <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-700 font-mono font-bold">
                  {activeProviderName}
                </span>
              </div>

              <div className="flex items-center justify-between p-3 bg-secondary/50 rounded-xl border border-border">
                <div>
                  <span className="font-bold text-foreground block">Hackathon Demo Mode:</span>
                  <span className="text-muted-foreground">
                    Guarantees instant fallback if external AI network is offline
                  </span>
                </div>
                <button
                  onClick={toggleDemoMode}
                  className={`px-3 py-1 rounded-full font-bold text-xs transition-colors ${
                    demoMode
                      ? 'bg-primary text-white'
                      : 'bg-secondary text-muted-foreground border border-border'
                  }`}
                >
                  {demoMode ? 'ENABLED (SAFE)' : 'DISABLED'}
                </button>
              </div>

              <div className="flex items-center justify-between p-3 bg-secondary/50 rounded-xl border border-border">
                <div>
                  <span className="font-bold text-foreground block">Multilingual Support:</span>
                  <span className="text-muted-foreground">
                    Indian English, Hinglish, Marathi landmark mappings
                  </span>
                </div>
                <span className="px-2.5 py-1 rounded-full bg-primary/10 text-primary font-mono font-bold">
                  ACTIVE
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Bookmarked Providers */}
        <div className="bg-card border border-border rounded-2xl p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-2">
            <Bookmark className="w-5 h-5 text-primary" />
            <h3 className="text-base font-bold text-foreground">Saved Local Providers</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {savedProviders.map((p) => (
              <div
                key={p.id}
                onClick={() => navigate(`/provider/${p.id}`)}
                className="p-4 bg-secondary/40 hover:bg-secondary/70 border border-border rounded-xl transition-all cursor-pointer flex items-center justify-between gap-3"
              >
                <div className="flex items-center gap-3">
                  <img
                    src={p.avatar}
                    alt={p.name}
                    className="w-12 h-12 rounded-lg object-cover"
                  />
                  <div>
                    <h4 className="font-bold text-sm text-foreground">{p.name}</h4>
                    <p className="text-xs text-muted-foreground">{p.title}</p>
                    <span className="text-[10px] text-primary font-medium">{p.location.area}</span>
                  </div>
                </div>
                <Button size="sm" variant="outline" className="text-xs h-8">
                  View
                </Button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
