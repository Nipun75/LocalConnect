import { useState, useEffect } from 'react';
import { DynamicWeight } from '@/components/originkit/DynamicWeight';
import '@fontsource-variable/urbanist';

export const DynamicSupportingText = () => {
  const [reduceMotion, setReduceMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReduceMotion(mediaQuery.matches);

    const handler = (e: MediaQueryListEvent) => setReduceMotion(e.matches);
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  const typographyClass = "text-[22px] md:text-[28px] lg:text-[36px] text-muted-foreground font-semibold leading-relaxed";
  
  if (reduceMotion) {
    return (
      <p 
        style={{ fontFamily: '"Urbanist Variable", sans-serif', fontWeight: 600 }}
        className={`${typographyClass} max-w-[600px] mb-8 mx-auto`}
      >
        Find local. Connect better.
      </p>
    );
  }

  return (
    <div className="w-full mb-8 mx-auto flex items-center justify-center">
      <div style={{ fontFamily: '"Urbanist Variable", sans-serif' }} className="text-muted-foreground">
        <DynamicWeight
          text="Find local. Connect better."
          className={typographyClass}
          minWeight={600}
          maxWeight={900}
          radius={150}
        />
      </div>
    </div>
  );
};
