import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ShinyButton } from '@/components/ui/shiny-button';

interface MockRequest {
  id: string;
  service: string;
  providerName: string;
  providerAvatar: string;
  date: string;
  status: 'In Discussion' | 'Connected' | 'Completed';
  budget: string;
  location: string;
}

const MOCK_USER_REQUESTS: MockRequest[] = [
  {
    id: 'req_101',
    service: 'Class 12 Mathematics Tutor',
    providerName: 'Priya Deshmukh',
    providerAvatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=256',
    date: 'August 22, 2026',
    status: 'In Discussion',
    budget: '₹450 / session',
    location: 'Dharampeth, Nagpur',
  },
  {
    id: 'req_102',
    service: 'Emergency Short Circuit Fix',
    providerName: 'Rajesh Kolhe',
    providerAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=256',
    date: 'August 14, 2026',
    status: 'Completed',
    budget: '₹300 / visit',
    location: 'Dharampeth, Nagpur',
  },
];

export const Requests: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background py-8 md:py-12 px-4 md:px-section-1 lg:px-section-2 pb-24">
      <div className="max-w-[1000px] mx-auto space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-primary bg-primary-soft px-2.5 py-0.5 rounded-full">
              Activity & Requests
            </span>
            <h1 className="font-serif text-3xl md:text-4xl text-foreground font-normal mt-1">
              Your Service Connections
            </h1>
          </div>

          <ShinyButton
            onClick={() => navigate('/need/understanding')}
            className="text-xs font-semibold px-4 h-10"
          >
            <Sparkles className="w-3.5 h-3.5 mr-1.5" /> Post a New Need
          </ShinyButton>
        </div>

        <div className="space-y-4">
          {MOCK_USER_REQUESTS.map((req) => (
            <div
              key={req.id}
              className="bg-card border border-border rounded-2xl p-5 md:p-6 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
            >
              <div className="flex items-start gap-4">
                <img
                  src={req.providerAvatar}
                  alt={req.providerName}
                  className="w-14 h-14 rounded-xl object-cover border border-border shrink-0"
                />
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold font-mono ${
                        req.status === 'In Discussion'
                          ? 'bg-amber-500/10 text-amber-700 border border-amber-500/20'
                          : 'bg-emerald-500/10 text-emerald-700 border border-emerald-500/20'
                      }`}
                    >
                      {req.status}
                    </span>
                    <span className="text-xs text-muted-foreground">{req.date}</span>
                  </div>

                  <h3 className="text-base font-bold text-foreground">{req.service}</h3>
                  <p className="text-xs text-muted-foreground">
                    Connected with <span className="font-semibold text-foreground">{req.providerName}</span> &bull; {req.location}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-end border-t md:border-t-0 pt-3 md:pt-0 border-border">
                <div className="text-left md:text-right">
                  <span className="text-xs font-bold text-foreground block">{req.budget}</span>
                  <span className="text-[10px] text-muted-foreground">Agreed rate</span>
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate('/need/understanding', { state: { query: req.service } })}
                  className="text-xs h-9"
                >
                  Find More Matches
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
