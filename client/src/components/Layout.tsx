import { ReactNode, useState } from 'react';
import { BottomNavigation } from './BottomNavigation';
import { ChatWidget } from './ChatWidget';
import { useLanguage } from '@/contexts/LanguageContext';

interface LayoutProps {
  children: ReactNode;
  onLoginRequest?: () => void;
}

export function Layout({ children, onLoginRequest }: LayoutProps) {
  const { isTransitioning } = useLanguage();
  const [isChatVisible, setIsChatVisible] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-950 via-purple-900 to-black text-white overflow-x-hidden">
      <div 
        className={`w-full max-w-md mx-auto relative min-h-screen pb-[87px] transition-opacity duration-200 ${
          isTransitioning ? 'opacity-90' : 'opacity-100'
        }`}
      >
        <div className="px-3 sm:px-4">
          {children}
        </div>
        <BottomNavigation onLoginRequest={onLoginRequest} />
        
        {/* Chat Widget */}
        <ChatWidget 
          isVisible={isChatVisible}
          onToggle={() => setIsChatVisible(!isChatVisible)}
        />
      </div>
    </div>
  );
}
