import { Outlet } from 'react-router-dom';
import { Navbar } from './Navbar';
import { BottomNav } from './BottomNav';

export function RootLayout() {
  return (
    <div className="min-h-screen flex flex-col bg-background font-sans text-foreground">
      <Navbar />
      <main className="flex-1 flex flex-col relative w-full mx-auto">
        <Outlet />
      </main>
      <Footer />
      <BottomNav />
    </div>
  );
}

// Need to import Footer
import { Footer } from './Footer';
