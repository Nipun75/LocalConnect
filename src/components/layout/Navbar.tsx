import { Link, useLocation } from 'react-router-dom';
import { Logo } from '@/components/ui/Logo';
import { cn } from '@/lib/utils';
import { User, Bell, Sparkles } from 'lucide-react';

export function Navbar() {
  const location = useLocation();

  const links = [
    { href: '/', label: 'Home' },
    { href: '/discover', label: 'Discover' },
    { href: '/requests', label: 'Requests' },
    { href: '/profile', label: 'Settings & AI' },
  ];

  const isHome = location.pathname === '/';

  return (
    <nav className={cn(
      "w-full z-50 transition-colors",
      isHome 
        ? "absolute top-0 left-0 right-0 bg-transparent border-none"
        : "sticky top-0 bg-background/85 backdrop-blur-md border-b border-border shadow-xs"
    )}>
      <div className="max-w-[1440px] mx-auto px-4 md:px-section-1 lg:px-section-2 h-16 md:h-20 lg:h-24 flex items-center justify-between">
        
        {/* Left: Logo */}
        <div className="flex-1 flex justify-start items-center">
          <Link to="/" className="focus-ring rounded-md">
            <Logo className="h-11 md:h-14 lg:h-[68px] w-auto" />
          </Link>
        </div>

        {/* Center: Navigation */}
        <div className="hidden md:flex items-center justify-center gap-comp-3 shrink-0">
          {links.map((link) => (
            <Link
              key={link.href}
              to={link.href}
              className={cn(
                "text-text-navigation transition-colors hover:text-primary focus-ring rounded-sm px-3 py-2 font-bold",
                location.pathname === link.href ? "text-primary" : "text-muted-foreground"
              )}
              style={{ fontFamily: '"Google Sans", sans-serif' }}
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* Right: Actions */}
        <div className="flex-1 hidden md:flex items-center justify-end gap-comp-2">
          <Link
            to="/need/understanding"
            className="flex items-center gap-1.5 text-xs font-semibold px-3.5 py-1.5 rounded-full bg-primary/10 text-primary hover:bg-primary/20 transition-colors border border-primary/20 mr-2"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI Match</span>
          </Link>
          <Link
            to="/requests"
            className="text-muted-foreground hover:text-primary transition-colors focus-ring rounded-full p-2"
            title="Activity & Notifications"
          >
            <Bell className="w-5 h-5" />
          </Link>
          <Link
            to="/profile"
            className="text-muted-foreground hover:text-primary transition-colors focus-ring rounded-full p-2"
            title="User Profile & Settings"
          >
            <User className="w-5 h-5" />
          </Link>
        </div>
        
      </div>
    </nav>
  );
}
