import { useEffect, useState, useCallback } from 'react';

interface MobileOptimizations {
  isPortrait: boolean;
  isLandscape: boolean;
  screenSize: 'small' | 'medium' | 'large';
  hasNotch: boolean;
  isStandalone: boolean;
  devicePixelRatio: number;
  viewportHeight: number;
  safeArea: {
    top: number;
    bottom: number;
    left: number;
    right: number;
  };
}

export const useMobileOptimizations = (): MobileOptimizations => {
  const [state, setState] = useState<MobileOptimizations>({
    isPortrait: false,
    isLandscape: false,
    screenSize: 'medium',
    hasNotch: false,
    isStandalone: false,
    devicePixelRatio: 1,
    viewportHeight: 0,
    safeArea: { top: 0, bottom: 0, left: 0, right: 0 }
  });

  const updateOptimizations = useCallback(() => {
    const width = window.innerWidth;
    const height = window.innerHeight;
    const orientation = window.screen?.orientation?.angle ?? 0;
    
    // Detect safe area insets (for devices with notches)
    const computedStyle = getComputedStyle(document.documentElement);
    const safeAreaTop = parseInt(computedStyle.getPropertyValue('env(safe-area-inset-top)') || '0');
    const safeAreaBottom = parseInt(computedStyle.getPropertyValue('env(safe-area-inset-bottom)') || '0');
    const safeAreaLeft = parseInt(computedStyle.getPropertyValue('env(safe-area-inset-left)') || '0');
    const safeAreaRight = parseInt(computedStyle.getPropertyValue('env(safe-area-inset-right)') || '0');

    // Determine screen size category
    let screenSize: 'small' | 'medium' | 'large' = 'medium';
    if (width < 375) screenSize = 'small';
    else if (width > 768) screenSize = 'large';

    setState({
      isPortrait: height > width,
      isLandscape: width > height,
      screenSize,
      hasNotch: safeAreaTop > 0 || safeAreaBottom > 0,
      isStandalone: window.matchMedia('(display-mode: standalone)').matches,
      devicePixelRatio: window.devicePixelRatio || 1,
      viewportHeight: height,
      safeArea: {
        top: safeAreaTop,
        bottom: safeAreaBottom,
        left: safeAreaLeft,
        right: safeAreaRight
      }
    });
  }, []);

  useEffect(() => {
    updateOptimizations();

    const handleResize = () => updateOptimizations();
    const handleOrientationChange = () => {
      // Delay to allow for orientation change to complete
      setTimeout(updateOptimizations, 100);
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleOrientationChange);

    // Also listen for viewport changes on mobile
    if ('visualViewport' in window) {
      window.visualViewport?.addEventListener('resize', updateOptimizations);
    }

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleOrientationChange);
      if ('visualViewport' in window) {
        window.visualViewport?.removeEventListener('resize', updateOptimizations);
      }
    };
  }, [updateOptimizations]);

  return state;
};

// Custom hook for mobile performance optimizations
export const useMobilePerformance = () => {
  const [isHighPerformance, setIsHighPerformance] = useState(true);

  useEffect(() => {
    // Check device capabilities
    const checkPerformance = () => {
      const memory = (navigator as any).deviceMemory;
      const cores = navigator.hardwareConcurrency;
      const connection = (navigator as any).connection;
      
      let performanceScore = 0;
      
      // Memory check (GB)
      if (memory >= 4) performanceScore += 3;
      else if (memory >= 2) performanceScore += 2;
      else performanceScore += 1;
      
      // CPU cores check
      if (cores >= 6) performanceScore += 3;
      else if (cores >= 4) performanceScore += 2;
      else performanceScore += 1;
      
      // Network check
      if (connection) {
        if (connection.effectiveType === '4g') performanceScore += 2;
        else if (connection.effectiveType === '3g') performanceScore += 1;
      }
      
      // Set performance mode based on score
      setIsHighPerformance(performanceScore >= 6);
    };

    checkPerformance();
  }, []);

  return {
    isHighPerformance,
    // Performance settings based on device capabilities
    settings: {
      antialiasing: isHighPerformance,
      shadows: isHighPerformance,
      particleCount: isHighPerformance ? 100 : 50,
      renderDistance: isHighPerformance ? 15 : 10,
      frameTarget: isHighPerformance ? 60 : 30
    }
  };
};