import { useEffect, useCallback } from 'react';
import { Haptics, ImpactStyle } from '@capacitor/haptics';
import { Device } from '@capacitor/device';
import { StatusBar, Style } from '@capacitor/status-bar';
import { Capacitor } from '@capacitor/core';

export const useNativeFeatures = () => {
  const isNative = Capacitor.isNativePlatform();

  // Initialize native features
  useEffect(() => {
    if (isNative) {
      // Setup status bar
      StatusBar.setStyle({ style: Style.Dark });
      StatusBar.setBackgroundColor({ color: '#1C1C1E' });
      
      // Log device info for debugging
      Device.getInfo().then(info => {
        console.log('Device Info:', info);
      });
    }
  }, [isNative]);

  // Enhanced haptic feedback for native apps
  const triggerNativeHaptic = useCallback(async (style: 'light' | 'medium' | 'heavy' = 'light') => {
    if (!isNative) {
      // Fallback for web
      if ('vibrate' in navigator) {
        const patterns = { light: [10], medium: [30], heavy: [50] };
        navigator.vibrate(patterns[style]);
      }
      return;
    }

    try {
      const hapticStyles = {
        light: ImpactStyle.Light,
        medium: ImpactStyle.Medium,
        heavy: ImpactStyle.Heavy
      };
      
      await Haptics.impact({ style: hapticStyles[style] });
    } catch (error) {
      console.warn('Haptic feedback not available:', error);
    }
  }, [isNative]);

  // Selection feedback
  const triggerSelection = useCallback(async () => {
    if (isNative) {
      try {
        await Haptics.selectionStart();
        setTimeout(() => Haptics.selectionEnd(), 100);
      } catch (error) {
        console.warn('Selection haptic not available:', error);
      }
    }
  }, [isNative]);

  return {
    isNative,
    triggerNativeHaptic,
    triggerSelection
  };
};