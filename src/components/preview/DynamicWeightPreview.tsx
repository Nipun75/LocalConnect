import { DynamicWeight } from '@/components/originkit/DynamicWeight';
import '@fontsource-variable/urbanist';

export const DynamicWeightPreview = () => {
  return (
    <div className="min-h-screen bg-bg w-full flex flex-col items-center justify-center p-4 relative overflow-hidden">
      
      <div className="absolute top-8 left-1/2 -translate-x-1/2 flex items-center justify-center">
        <span className="text-[10px] md:text-xs font-mono uppercase tracking-widest text-brand-blue bg-brand-blue/10 px-3 py-1 rounded-full border border-brand-blue/20">
          DYNAMIC WEIGHT — PREVIEW
        </span>
      </div>

      <div className="text-center w-full max-w-4xl mx-auto px-4 relative z-10 flex flex-col items-center justify-center min-h-[50vh]">
        
        <div style={{ fontFamily: '"Urbanist Variable", sans-serif' }} className="text-muted-foreground w-full flex items-center justify-center">
          <DynamicWeight 
            text="Find local. Connect better." 
            className="text-[24px] md:text-[32px] lg:text-[40px] text-muted-foreground leading-relaxed w-full justify-center text-center"
            minWeight={400}
            maxWeight={800}
            radius={200}
          />
        </div>
      </div>

      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 opacity-50">
        <p className="text-xs text-muted-foreground">Hover to preview variable font interpolation</p>
      </div>
    </div>
  );
};
