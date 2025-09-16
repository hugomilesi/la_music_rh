
import React, { useState, useEffect } from 'react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { Toaster } from '@/components/ui/toaster';
import { useIsMobile } from '@/hooks/use-mobile';
import { InstallPrompt } from '@/components/pwa/InstallPrompt';

interface MainLayoutProps {
  children: React.ReactNode;
}

export const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const isMobile = useIsMobile();

  // Component state tracking
  useEffect(() => {
    // Component mounted
  }, [sidebarOpen, sidebarCollapsed, isMobile]);

  // Auto-collapse sidebar on mobile
  useEffect(() => {
    if (isMobile) {
      setSidebarCollapsed(false); // Mobile sidebar não deve estar collapsed
      setSidebarOpen(false);
    } else {
      setSidebarCollapsed(false);
      setSidebarOpen(true); // Desktop sidebar deve estar sempre visível
    }
  }, [isMobile]);

  const toggleSidebar = () => {
    if (isMobile) {
      const newState = !sidebarOpen;
      setSidebarOpen(newState);
    } else {
      setSidebarCollapsed(!sidebarCollapsed);
    }
  };

  return (
    <div className="min-h-screen gradient-hr-cool flex relative mobile-safe">
      {/* Mobile Overlay - Melhorado */}
      {isMobile && sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden transition-all duration-300 ease-in-out"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setSidebarOpen(false);
          }}
          aria-label="Fechar menu"
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 40,
            backgroundColor: 'rgba(0, 0, 0, 0.6)',
            backdropFilter: 'blur(4px)'
          }}
        />
      )}
      
      {/* Sidebar */}
      <div 
        className={`${
          isMobile 
            ? `fixed left-0 top-0 h-full z-50 transform transition-transform duration-300 ease-in-out ${
                sidebarOpen ? 'translate-x-0' : '-translate-x-full'
              }`
            : `relative flex-shrink-0 transition-all duration-300 ease-in-out ${
                sidebarCollapsed ? 'w-16' : 'w-72'
              }`
        }`}
        style={isMobile ? {
          position: 'fixed',
          top: 0,
          left: 0,
          height: '100vh',
          width: '288px',
          zIndex: 50,
          transform: sidebarOpen ? 'translateX(0)' : 'translateX(-100%)',
          transition: 'transform 0.3s ease-in-out'
        } : {}}
      >
        <Sidebar 
          collapsed={isMobile ? false : sidebarCollapsed} 
          onToggle={toggleSidebar}
          isOpen={sidebarOpen}
        />
      </div>
      
      {/* Main Content */}
      <div 
        className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ease-in-out ${
          isMobile 
            ? 'w-full' 
            : sidebarCollapsed 
              ? 'ml-0' 
              : 'ml-0'
        }`}
      >
        <Header onToggleSidebar={toggleSidebar} />
        
        <main className="flex-1 p-2 sm:p-4 md:p-6 overflow-auto">
          <div className="w-full max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
      
      <Toaster />
      <InstallPrompt />
    </div>
  );
};
