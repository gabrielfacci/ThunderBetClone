import { ReactNode } from 'react';
import { BottomNavigation } from './BottomNavigation';

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-950 via-purple-900 to-black text-white overflow-x-hidden">
      <div className="w-full max-w-md mx-auto relative min-h-screen pb-[87px]">
        <div className="px-3 sm:px-4">
          {children}
        </div>
        <BottomNavigation />
      </div>
    </div>
  );
}
