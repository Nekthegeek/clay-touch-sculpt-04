import { useCallback, useRef, useState } from 'react';
import { useNativeFeatures } from './useNativeFeatures';

interface TouchGestureOptions {
  onTap?: (event: TouchEvent) => void;
  onDoubleTap?: (event: TouchEvent) => void;
  onLongPress?: (event: TouchEvent) => void;
  onPinch?: (scale: number, event: TouchEvent) => void;
  onSwipe?: (direction: 'up' | 'down' | 'left' | 'right', event: TouchEvent) => void;
  onRotate?: (rotation: number, event: TouchEvent) => void;
  longPressDelay?: number;
  doubleTapDelay?: number;
  swipeThreshold?: number;
}

export const useTouchGestures = (options: TouchGestureOptions = {}) => {
  const {
    onTap,
    onDoubleTap,
    onLongPress,
    onPinch,
    onSwipe,
    onRotate,
    longPressDelay = 500,
    doubleTapDelay = 300,
    swipeThreshold = 50
  } = options;

  const { triggerNativeHaptic, triggerSelection } = useNativeFeatures();

  const touchState = useRef({
    startTime: 0,
    startPosition: { x: 0, y: 0 },
    lastTap: 0,
    longPressTimer: null as NodeJS.Timeout | null,
    initialDistance: 0,
    initialRotation: 0,
    isMultiTouch: false,
    gestureStarted: false
  });

  const [isLongPressing, setIsLongPressing] = useState(false);

  // Enhanced haptic feedback helper with native support
  const triggerHaptic = useCallback((type: 'light' | 'medium' | 'heavy' = 'light') => {
    triggerNativeHaptic(type);
  }, [triggerNativeHaptic]);

  // Calculate distance between two touch points
  const getDistance = useCallback((touches: TouchList) => {
    if (touches.length < 2) return 0;
    const touch1 = touches[0];
    const touch2 = touches[1];
    return Math.sqrt(
      Math.pow(touch2.clientX - touch1.clientX, 2) +
      Math.pow(touch2.clientY - touch1.clientY, 2)
    );
  }, []);

  // Calculate rotation angle between two touch points
  const getRotation = useCallback((touches: TouchList) => {
    if (touches.length < 2) return 0;
    const touch1 = touches[0];
    const touch2 = touches[1];
    return Math.atan2(
      touch2.clientY - touch1.clientY,
      touch2.clientX - touch1.clientX
    ) * 180 / Math.PI;
  }, []);

  const handleTouchStart = useCallback((event: TouchEvent) => {
    const touch = event.touches[0];
    const now = Date.now();
    
    touchState.current.startTime = now;
    touchState.current.startPosition = { x: touch.clientX, y: touch.clientY };
    touchState.current.isMultiTouch = event.touches.length > 1;
    touchState.current.gestureStarted = false;

    if (event.touches.length === 2) {
      touchState.current.initialDistance = getDistance(event.touches);
      touchState.current.initialRotation = getRotation(event.touches);
    }

    // Clear any existing long press timer
    if (touchState.current.longPressTimer) {
      clearTimeout(touchState.current.longPressTimer);
    }

    // Start long press timer for single touch
    if (event.touches.length === 1 && onLongPress) {
      touchState.current.longPressTimer = setTimeout(() => {
        setIsLongPressing(true);
        triggerHaptic('medium');
        onLongPress(event);
        touchState.current.gestureStarted = true;
      }, longPressDelay);
    }
  }, [onLongPress, longPressDelay, triggerHaptic, getDistance, getRotation]);

  const handleTouchMove = useCallback((event: TouchEvent) => {
    if (touchState.current.isMultiTouch && event.touches.length === 2) {
      const currentDistance = getDistance(event.touches);
      const currentRotation = getRotation(event.touches);

      // Pinch gesture
      if (onPinch && touchState.current.initialDistance > 0) {
        const scale = currentDistance / touchState.current.initialDistance;
        onPinch(scale, event);
      }

      // Rotation gesture
      if (onRotate) {
        const rotation = currentRotation - touchState.current.initialRotation;
        onRotate(rotation, event);
      }

      touchState.current.gestureStarted = true;
    }

    // Cancel long press if touch moves significantly
    const touch = event.touches[0];
    const deltaX = Math.abs(touch.clientX - touchState.current.startPosition.x);
    const deltaY = Math.abs(touch.clientY - touchState.current.startPosition.y);
    
    if ((deltaX > 10 || deltaY > 10) && touchState.current.longPressTimer) {
      clearTimeout(touchState.current.longPressTimer);
      touchState.current.longPressTimer = null;
      setIsLongPressing(false);
    }
  }, [onPinch, onRotate, getDistance, getRotation]);

  const handleTouchEnd = useCallback((event: TouchEvent) => {
    const now = Date.now();
    const touch = event.changedTouches[0];
    
    // Clear long press timer
    if (touchState.current.longPressTimer) {
      clearTimeout(touchState.current.longPressTimer);
      touchState.current.longPressTimer = null;
    }
    
    setIsLongPressing(false);

    // Don't process tap if a gesture was started
    if (touchState.current.gestureStarted) {
      touchState.current.gestureStarted = false;
      return;
    }

    // Calculate swipe
    const deltaX = touch.clientX - touchState.current.startPosition.x;
    const deltaY = touch.clientY - touchState.current.startPosition.y;
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

    if (distance > swipeThreshold && onSwipe) {
      const absX = Math.abs(deltaX);
      const absY = Math.abs(deltaY);
      
      let direction: 'up' | 'down' | 'left' | 'right';
      if (absX > absY) {
        direction = deltaX > 0 ? 'right' : 'left';
      } else {
        direction = deltaY > 0 ? 'down' : 'up';
      }
      
      triggerHaptic('light');
      onSwipe(direction, event);
      return;
    }

    // Handle tap gestures (only for single touch that didn't become a long press)
    if (event.changedTouches.length === 1 && !touchState.current.isMultiTouch) {
      const timeSinceLastTap = now - touchState.current.lastTap;
      
      if (timeSinceLastTap < doubleTapDelay && onDoubleTap) {
        triggerHaptic('medium');
        onDoubleTap(event);
        touchState.current.lastTap = 0; // Reset to prevent triple tap
      } else {
        touchState.current.lastTap = now;
        // Delay single tap to check for double tap
        setTimeout(() => {
          if (now === touchState.current.lastTap && onTap) {
            triggerSelection(); // Use selection haptic for taps
            onTap(event);
          }
        }, doubleTapDelay);
      }
    }
  }, [onTap, onDoubleTap, onSwipe, doubleTapDelay, swipeThreshold, triggerHaptic]);

  return {
    touchHandlers: {
      onTouchStart: handleTouchStart,
      onTouchMove: handleTouchMove,
      onTouchEnd: handleTouchEnd,
    },
    isLongPressing,
    triggerHaptic
  };
};