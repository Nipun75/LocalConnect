import { Link, useLocation } from 'react-router-dom';
import { Logo } from '@/components/ui/Logo';
import { cn } from '@/lib/utils';
import { User, Bell } from 'lucide-react';

export function Navbar() {
  const location = useLocation();

  const links = [
    { href: '/', label: 'Home' },
    { href: '/discover', label: 'Discover' },
    { href: '/requests', label: 'Requests' },
  ];

  return (
    <nav className="sticky top-0 z-50 w-full bg-background/80 backdrop-blur-md border-b border-border">
      <div className="max-w-[1440px] mx-auto px-4 md:px-section-1 lg:px-section-2 h-16 md:h-20 lg:h-24 flex items-center justify-between">
        
        {/* Left: Logo */}
        <div className="flex-1 flex justify-start items-center">
          <Logo className="h-11 md:h-14 lg:h-[68px] w-auto" />
        </div>

        {/* Center: Navigation */}
        <div className="hidden md:flex items-center justify-center gap-comp-3 shrink-0">
          {links.map((link) => (
            <Link
              key={link.href}
              to={link.href}
              className={cn(
                "text-text-navigation transition-colors hover:text-primary focus-ring rounded-sm px-3 py-2 font-medium",
                location.pathname === link.href ? "text-primary" : "text-muted-foreground"
              )}
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* Right: Actions */}
        <div className="flex-1 hidden md:flex items-center justify-end gap-comp-2">
          <button className="text-muted-foreground hover:text-primary transition-colors focus-ring rounded-full p-2">
            <Bell className="w-5 h-5" />
          </button>
          <button className="text-muted-foreground hover:text-primary transition-colors focus-ring rounded-full p-2">
            <User className="w-5 h-5" />
          </button>
        </div>
        
      </div>
    </nav>
  );
}
