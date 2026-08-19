import { Logo } from '@/components/ui/Logo';

export function Footer() {
  return (
    <footer className="w-full bg-card border-t border-border mt-auto">
      <div className="max-w-[1440px] mx-auto px-4 md:px-section-1 lg:px-section-2 py-section-1 md:py-section-2">
        <div className="flex flex-col md:flex-row justify-between items-start gap-8">
          <div className="max-w-xs">
            <Logo className="h-8 w-auto mb-4" variant="primary" />
            <p className="text-text-small text-muted-foreground">
              Need &rarr; Match &rarr; Connect.<br />
              The hyperlocal platform for discovering relevant local service providers.
            </p>
          </div>
          
          <div className="flex gap-16">
            <div className="flex flex-col gap-3">
              <h4 className="text-text-small font-semibold text-foreground uppercase tracking-wider">Product</h4>
              <a href="#" className="text-text-small text-muted-foreground hover:text-primary transition-colors focus-ring rounded-sm">Discover</a>
              <a href="#" className="text-text-small text-muted-foreground hover:text-primary transition-colors focus-ring rounded-sm">How it works</a>
              <a href="#" className="text-text-small text-muted-foreground hover:text-primary transition-colors focus-ring rounded-sm">Pricing</a>
            </div>
            <div className="flex flex-col gap-3">
              <h4 className="text-text-small font-semibold text-foreground uppercase tracking-wider">Company</h4>
              <a href="#" className="text-text-small text-muted-foreground hover:text-primary transition-colors focus-ring rounded-sm">About</a>
              <a href="#" className="text-text-small text-muted-foreground hover:text-primary transition-colors focus-ring rounded-sm">Trust & Safety</a>
              <a href="#" className="text-text-small text-muted-foreground hover:text-primary transition-colors focus-ring rounded-sm">Contact</a>
            </div>
          </div>
        </div>
        
        <div className="mt-section-1 pt-section-1 border-t border-border flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-text-caption text-muted-foreground">
            &copy; {new Date().getFullYear()} Local Connect. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            <a href="#" className="text-text-caption text-muted-foreground hover:text-primary transition-colors focus-ring rounded-sm">Privacy</a>
            <a href="#" className="text-text-caption text-muted-foreground hover:text-primary transition-colors focus-ring rounded-sm">Terms</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
