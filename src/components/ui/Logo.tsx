import { cn } from '@/lib/utils';
import { Link } from 'react-router-dom';

interface LogoProps {
  className?: string;
  variant?: 'primary' | 'compact' | 'symbol';
  withLink?: boolean;
}

export function Logo({ className, variant = 'primary', withLink = true }: LogoProps) {
  // Since we only have one raster asset, we scale/clip it appropriately or just render it.
  // In a final production build with SVG assets, this would swap vectors.
  const content = (
    <div className={cn("relative flex items-center justify-center overflow-hidden h-full w-full", className)}>
      <img 
        src="/brand/local-connect-logo-Photoroom.png" 
        alt="Local Connect Logo" 
        className={cn(
          "object-contain w-full h-full",
          variant === 'symbol' && "scale-150 object-left" // Rough clipping for MVP if needed, though ideal is SVG
        )}
      />
    </div>
  );

  if (withLink) {
    return (
      <Link to="/" className="inline-block transition-opacity hover:opacity-80 focus-ring rounded-md">
        {content}
      </Link>
    );
  }

  return content;
}
