import React, { useState, useEffect, useRef, Suspense } from 'react';
import { cn } from '@/lib/utils';

// Intersection Observer Hook
function useIntersectionObserver(
  elementRef: React.RefObject<Element>,
  options: IntersectionObserverInit = {}
) {
  const [isIntersecting, setIsIntersecting] = useState(false);
  const [hasIntersected, setHasIntersected] = useState(false);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsIntersecting(entry.isIntersecting);
        if (entry.isIntersecting && !hasIntersected) {
          setHasIntersected(true);
        }
      },
      {
        threshold: 0.1,
        rootMargin: '50px',
        ...options
      }
    );

    observer.observe(element);

    return () => {
      observer.unobserve(element);
    };
  }, [elementRef, hasIntersected, options]);

  return { isIntersecting, hasIntersected };
}

// Lazy Load Component
interface LazyLoadProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  className?: string;
  height?: string | number;
  once?: boolean;
  offset?: string;
  threshold?: number;
  onLoad?: () => void;
}

export function LazyLoad({
  children,
  fallback,
  className,
  height = 'auto',
  once = true,
  offset = '50px',
  threshold = 0.1,
  onLoad
}: LazyLoadProps) {
  const elementRef = useRef<HTMLDivElement>(null);
  const { isIntersecting, hasIntersected } = useIntersectionObserver(
    elementRef,
    {
      threshold,
      rootMargin: offset
    }
  );

  const shouldRender = once ? hasIntersected : isIntersecting;

  useEffect(() => {
    if (shouldRender && onLoad) {
      onLoad();
    }
  }, [shouldRender, onLoad]);

  return (
    <div
      ref={elementRef}
      className={cn('lazy-load-container', className)}
      style={{ height: typeof height === 'number' ? `${height}px` : height }}
    >
      {shouldRender ? children : fallback}
    </div>
  );
}

// Lazy Image Component
interface LazyImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  fallback?: React.ReactNode;
  placeholder?: string;
  className?: string;
  onLoad?: () => void;
  onError?: () => void;
}

export function LazyImage({
  src,
  alt,
  fallback,
  placeholder,
  className,
  onLoad,
  onError,
  ...props
}: LazyImageProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [shouldLoad, setShouldLoad] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const { hasIntersected } = useIntersectionObserver(containerRef, {
    threshold: 0.1,
    rootMargin: '100px'
  });

  useEffect(() => {
    if (hasIntersected) {
      setShouldLoad(true);
    }
  }, [hasIntersected]);

  const handleLoad = () => {
    setIsLoaded(true);
    onLoad?.();
  };

  const handleError = () => {
    setHasError(true);
    onError?.();
  };

  const defaultFallback = (
    <div className="flex items-center justify-center bg-gray-100 text-gray-400 text-sm">
      Falha ao carregar imagem
    </div>
  );

  const defaultPlaceholder = (
    <div className="animate-pulse bg-gray-200 w-full h-full" />
  );

  return (
    <div
      ref={containerRef}
      className={cn('lazy-image-container relative overflow-hidden', className)}
    >
      {shouldLoad ? (
        <>
          <img
            ref={imgRef}
            src={src}
            alt={alt}
            onLoad={handleLoad}
            onError={handleError}
            className={cn(
              'transition-opacity duration-300',
              isLoaded ? 'opacity-100' : 'opacity-0',
              hasError && 'hidden'
            )}
            {...props}
          />
          {!isLoaded && !hasError && (
            <div className="absolute inset-0">
              {placeholder ? (
                <img src={placeholder} alt="" className="w-full h-full object-cover blur-sm" />
              ) : (
                defaultPlaceholder
              )}
            </div>
          )}
          {hasError && (fallback || defaultFallback)}
        </>
      ) : (
        <div className="w-full h-full">
          {placeholder ? (
            <img src={placeholder} alt="" className="w-full h-full object-cover blur-sm" />
          ) : (
            defaultPlaceholder
          )}
        </div>
      )}
    </div>
  );
}

// Lazy Component Loader
interface LazyComponentProps {
  loader: () => Promise<{ default: React.ComponentType<any> }>;
  fallback?: React.ReactNode;
  errorFallback?: React.ReactNode;
  className?: string;
  props?: any;
}

export function LazyComponent({
  loader,
  fallback,
  errorFallback,
  className,
  props = {}
}: LazyComponentProps) {
  const [Component, setComponent] = useState<React.ComponentType<any> | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const { hasIntersected } = useIntersectionObserver(containerRef, {
    threshold: 0.1,
    rootMargin: '100px'
  });

  useEffect(() => {
    if (hasIntersected && !Component && !isLoading) {
      setIsLoading(true);
      loader()
        .then((module) => {
          setComponent(() => module.default);
          setIsLoading(false);
        })
        .catch((err) => {
          setError(err);
          setIsLoading(false);
        });
    }
  }, [hasIntersected, Component, isLoading, loader]);

  const defaultFallback = (
    <div className="flex items-center justify-center p-8">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
    </div>
  );

  const defaultErrorFallback = (
    <div className="flex items-center justify-center p-8 text-red-600">
      <p>Erro ao carregar componente</p>
    </div>
  );

  return (
    <div ref={containerRef} className={cn('lazy-component-container', className)}>
      {error ? (
        errorFallback || defaultErrorFallback
      ) : Component ? (
        <Component {...props} />
      ) : (
        fallback || defaultFallback
      )}
    </div>
  );
}

// Lazy List Component
interface LazyListProps<T> {
  items: T[];
  renderItem: (item: T, index: number) => React.ReactNode;
  itemHeight?: number;
  containerHeight?: number;
  overscan?: number;
  className?: string;
  loadingComponent?: React.ReactNode;
  emptyComponent?: React.ReactNode;
}

export function LazyList<T>({
  items,
  renderItem,
  itemHeight = 60,
  containerHeight = 400,
  overscan = 5,
  className,
  loadingComponent,
  emptyComponent
}: LazyListProps<T>) {
  const [scrollTop, setScrollTop] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(e.currentTarget.scrollTop);
  };

  const visibleStart = Math.floor(scrollTop / itemHeight);
  const visibleEnd = Math.min(
    visibleStart + Math.ceil(containerHeight / itemHeight),
    items.length - 1
  );

  const startIndex = Math.max(0, visibleStart - overscan);
  const endIndex = Math.min(items.length - 1, visibleEnd + overscan);

  const visibleItems = items.slice(startIndex, endIndex + 1);

  if (items.length === 0) {
    return (
      <div className={cn('lazy-list-empty', className)}>
        {emptyComponent || <p className="text-gray-500 text-center p-8">Nenhum item encontrado</p>}
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className={cn('lazy-list-container overflow-auto', className)}
      style={{ height: containerHeight }}
      onScroll={handleScroll}
    >
      <div
        className="lazy-list-content relative"
        style={{ height: items.length * itemHeight }}
      >
        <div
          className="lazy-list-items"
          style={{
            transform: `translateY(${startIndex * itemHeight}px)`
          }}
        >
          {visibleItems.map((item, index) => (
            <div
              key={startIndex + index}
              className="lazy-list-item"
              style={{ height: itemHeight }}
            >
              {renderItem(item, startIndex + index)}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Lazy Tabs Component
interface LazyTabsProps {
  tabs: Array<{
    id: string;
    label: string;
    content: () => React.ReactNode;
  }>;
  defaultTab?: string;
  className?: string;
  onTabChange?: (tabId: string) => void;
}

export function LazyTabs({
  tabs,
  defaultTab,
  className,
  onTabChange
}: LazyTabsProps) {
  const [activeTab, setActiveTab] = useState(defaultTab || tabs[0]?.id);
  const [loadedTabs, setLoadedTabs] = useState<Set<string>>(new Set([activeTab]));

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
    setLoadedTabs(prev => new Set([...prev, tabId]));
    onTabChange?.(tabId);
  };

  return (
    <div className={cn('lazy-tabs', className)}>
      {/* Tab Headers */}
      <div className="flex border-b border-gray-200 mb-4">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => handleTabChange(tab.id)}
            className={cn(
              'px-4 py-2 font-medium text-sm border-b-2 transition-colors touch-target',
              activeTab === tab.id
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="lazy-tabs-content">
        {tabs.map((tab) => (
          <div
            key={tab.id}
            className={cn(
              'lazy-tab-panel',
              activeTab === tab.id ? 'block' : 'hidden'
            )}
          >
            {loadedTabs.has(tab.id) ? (
              <Suspense fallback={<div className="p-4 text-center">Carregando...</div>}>
                {tab.content()}
              </Suspense>
            ) : (
              <div className="p-4 text-center text-gray-500">Clique para carregar</div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// Performance Monitor Hook
export function usePerformanceMonitor() {
  const [metrics, setMetrics] = useState({
    renderTime: 0,
    memoryUsage: 0,
    fps: 0
  });

  useEffect(() => {
    let frameCount = 0;
    let lastTime = performance.now();
    let animationId: number;

    const measureFPS = () => {
      frameCount++;
      const currentTime = performance.now();
      
      if (currentTime - lastTime >= 1000) {
        const fps = Math.round((frameCount * 1000) / (currentTime - lastTime));
        
        setMetrics(prev => ({
          ...prev,
          fps,
          memoryUsage: (performance as any).memory?.usedJSHeapSize || 0
        }));
        
        frameCount = 0;
        lastTime = currentTime;
      }
      
      animationId = requestAnimationFrame(measureFPS);
    };

    animationId = requestAnimationFrame(measureFPS);

    return () => {
      cancelAnimationFrame(animationId);
    };
  }, []);

  return metrics;
}