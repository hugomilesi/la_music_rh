import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { X, ChevronDown, Maximize2, Minimize2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';

interface MobileModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  showHeader?: boolean;
  showCloseButton?: boolean;
  closeOnOverlayClick?: boolean;
  className?: string;
  headerActions?: React.ReactNode;
  footer?: React.ReactNode;
  fullscreenOnMobile?: boolean;
  swipeToClose?: boolean;
}

export function MobileModal({
  isOpen,
  onClose,
  title,
  children,
  size = 'md',
  showHeader = true,
  showCloseButton = true,
  closeOnOverlayClick = true,
  className,
  headerActions,
  footer,
  fullscreenOnMobile = true,
  swipeToClose = true
}: MobileModalProps) {
  const isMobile = useIsMobile();
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [dragY, setDragY] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [startY, setStartY] = useState(0);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = 'unset';
      };
    }
  }, [isOpen]);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  // Touch handlers for swipe to close
  const handleTouchStart = (e: React.TouchEvent) => {
    if (!swipeToClose || !isMobile) return;
    setStartY(e.touches[0].clientY);
    setIsDragging(true);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || !swipeToClose || !isMobile) return;
    const currentY = e.touches[0].clientY;
    const diff = currentY - startY;
    if (diff > 0) {
      setDragY(diff);
    }
  };

  const handleTouchEnd = () => {
    if (!isDragging || !swipeToClose || !isMobile) return;
    setIsDragging(false);
    
    if (dragY > 100) {
      onClose();
    }
    setDragY(0);
  };

  const getSizeClasses = () => {
    if (isMobile && fullscreenOnMobile) {
      return 'w-full h-full max-w-none max-h-none rounded-none';
    }

    if (isFullscreen) {
      return 'w-full h-full max-w-none max-h-none rounded-none';
    }

    const sizeMap = {
      sm: 'max-w-sm',
      md: 'max-w-md',
      lg: 'max-w-lg',
      xl: 'max-w-xl',
      full: 'max-w-full'
    };

    return cn(
      sizeMap[size],
      'w-full max-h-[90vh]',
      isMobile ? 'mx-4 rounded-t-2xl' : 'rounded-lg'
    );
  };

  const getModalPosition = () => {
    if (isMobile && fullscreenOnMobile) {
      return 'inset-0';
    }

    if (isFullscreen) {
      return 'inset-0';
    }

    if (isMobile) {
      return 'bottom-0 left-0 right-0';
    }

    return 'top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2';
  };

  if (!isOpen) return null;

  const modalContent = (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
      {/* Overlay */}
      <div 
        className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
        onClick={closeOnOverlayClick ? onClose : undefined}
      />

      {/* Modal */}
      <div
        className={cn(
          "relative bg-white shadow-2xl transition-all duration-300 ease-out",
          getSizeClasses(),
          getModalPosition(),
          className
        )}
        style={{
          transform: isMobile && isDragging ? `translateY(${dragY}px)` : undefined
        }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* Drag indicator for mobile */}
        {isMobile && swipeToClose && !isFullscreen && (
          <div className="flex justify-center pt-2 pb-1">
            <div className="w-12 h-1 bg-gray-300 rounded-full" />
          </div>
        )}

        {/* Header */}
        {showHeader && (
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <div className="flex items-center gap-3">
              {title && (
                <h2 className="text-lg font-semibold text-gray-900 truncate">
                  {title}
                </h2>
              )}
            </div>
            
            <div className="flex items-center gap-2">
              {headerActions}
              
              {/* Fullscreen toggle (desktop only) */}
              {!isMobile && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsFullscreen(!isFullscreen)}
                  className="p-2"
                >
                  {isFullscreen ? (
                    <Minimize2 className="w-4 h-4" />
                  ) : (
                    <Maximize2 className="w-4 h-4" />
                  )}
                </Button>
              )}
              
              {/* Close button */}
              {showCloseButton && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onClose}
                  className="p-2"
                >
                  <X className="w-4 h-4" />
                </Button>
              )}
            </div>
          </div>
        )}

        {/* Content */}
        <div className="flex-1 overflow-hidden">
          {isMobile || isFullscreen ? (
            <ScrollArea className="h-full max-h-[calc(100vh-8rem)]">
              <div className="p-4">
                {children}
              </div>
            </ScrollArea>
          ) : (
            <ScrollArea className="max-h-[70vh]">
              <div className="p-4">
                {children}
              </div>
            </ScrollArea>
          )}
        </div>

        {/* Footer */}
        {footer && (
          <div className="border-t border-gray-200 p-4">
            {footer}
          </div>
        )}
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}

// Bottom Sheet variant for mobile
export function BottomSheet({
  isOpen,
  onClose,
  title,
  children,
  className,
  snapPoints = ['25%', '50%', '90%'],
  defaultSnap = 1
}: {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  className?: string;
  snapPoints?: string[];
  defaultSnap?: number;
}) {
  const [currentSnap, setCurrentSnap] = useState(defaultSnap);
  const [dragY, setDragY] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [startY, setStartY] = useState(0);

  const handleTouchStart = (e: React.TouchEvent) => {
    setStartY(e.touches[0].clientY);
    setIsDragging(true);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return;
    const currentY = e.touches[0].clientY;
    const diff = currentY - startY;
    setDragY(diff);
  };

  const handleTouchEnd = () => {
    if (!isDragging) return;
    setIsDragging(false);
    
    // Determine snap point based on drag distance
    if (dragY > 100) {
      if (currentSnap < snapPoints.length - 1) {
        setCurrentSnap(currentSnap + 1);
      } else {
        onClose();
      }
    } else if (dragY < -100) {
      if (currentSnap > 0) {
        setCurrentSnap(currentSnap - 1);
      }
    }
    
    setDragY(0);
  };

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-50">
      {/* Overlay */}
      <div 
        className="fixed inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Bottom Sheet */}
      <div
        className={cn(
          "fixed bottom-0 left-0 right-0 bg-white rounded-t-2xl shadow-2xl transition-all duration-300 ease-out",
          className
        )}
        style={{
          height: snapPoints[currentSnap],
          transform: isDragging ? `translateY(${Math.max(0, dragY)}px)` : undefined
        }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* Drag handle */}
        <div className="flex justify-center pt-3 pb-2">
          <div className="w-12 h-1 bg-gray-300 rounded-full" />
        </div>

        {/* Header */}
        {title && (
          <div className="px-4 pb-2">
            <h2 className="text-lg font-semibold text-gray-900 text-center">
              {title}
            </h2>
          </div>
        )}

        {/* Content */}
        <ScrollArea className="flex-1 px-4 pb-4">
          {children}
        </ScrollArea>
      </div>
    </div>,
    document.body
  );
}

// Action Sheet for mobile
export function ActionSheet({
  isOpen,
  onClose,
  title,
  actions,
  cancelText = 'Cancelar'
}: {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  actions: Array<{
    label: string;
    onClick: () => void;
    variant?: 'default' | 'destructive';
    icon?: React.ReactNode;
  }>;
  cancelText?: string;
}) {
  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      {/* Overlay */}
      <div 
        className="fixed inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Action Sheet */}
      <div className="w-full max-w-sm mx-4 mb-4 space-y-2">
        {/* Actions */}
        <div className="bg-white rounded-2xl overflow-hidden">
          {title && (
            <div className="px-4 py-3 text-center border-b border-gray-200">
              <p className="text-sm text-gray-500">{title}</p>
            </div>
          )}
          
          {actions.map((action, index) => (
            <button
              key={index}
              onClick={() => {
                action.onClick();
                onClose();
              }}
              className={cn(
                "w-full px-4 py-3 text-left flex items-center gap-3 hover:bg-gray-50 transition-colors",
                action.variant === 'destructive' && "text-red-600",
                index < actions.length - 1 && "border-b border-gray-200"
              )}
            >
              {action.icon}
              <span className="font-medium">{action.label}</span>
            </button>
          ))}
        </div>

        {/* Cancel */}
        <button
          onClick={onClose}
          className="w-full bg-white rounded-2xl px-4 py-3 font-semibold text-blue-600 hover:bg-gray-50 transition-colors"
        >
          {cancelText}
        </button>
      </div>
    </div>,
    document.body
  );
}