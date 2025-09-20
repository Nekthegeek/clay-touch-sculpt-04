import React, { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { X, Lightbulb, Smartphone, Hand } from 'lucide-react';

interface ContextualTooltipProps {
  currentTool: string;
  isVisible: boolean;
  onDismiss: () => void;
  className?: string;
}

const toolTips: Record<string, { icon: React.ReactNode; title: string; tips: string[]; gesture?: string }> = {
  push: {
    icon: <Hand className="h-4 w-4" />,
    title: 'Push Tool',
    tips: [
      'Tap and hold to push clay inward',
      'Use lighter pressure for subtle details',
      'Move in circles for smooth pushing'
    ],
    gesture: 'Single finger tap & hold'
  },
  pull: {
    icon: <Hand className="h-4 w-4" />,
    title: 'Pull Tool',
    tips: [
      'Tap and drag to pull clay outward',
      'Great for creating bumps and spikes',
      'Use quick gestures for sharp details'
    ],
    gesture: 'Single finger drag'
  },
  smooth: {
    icon: <Hand className="h-4 w-4" />,
    title: 'Smooth Tool',
    tips: [
      'Swipe gently to smooth rough areas',
      'Perfect for blending and finishing',
      'Use overlapping strokes for best results'
    ],
    gesture: 'Light swipe motions'
  },
  pinch: {
    icon: <Hand className="h-4 w-4" />,
    title: 'Pinch Tool',
    tips: [
      'Use two fingers to pinch and squeeze',
      'Creates sharp edges and ridges',
      'Pinch repeatedly for detailed textures'
    ],
    gesture: 'Two finger pinch'
  }
};

export const ContextualTooltip: React.FC<ContextualTooltipProps> = ({
  currentTool,
  isVisible,
  onDismiss,
  className
}) => {
  const toolInfo = toolTips[currentTool] || toolTips.push;

  if (!isVisible) return null;

  return (
    <div className={`floating-panel-sm animate-slide-up ${className}`}>
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <Lightbulb className="h-4 w-4 text-primary animate-pulse" />
          <h3 className="text-sm font-semibold">{toolInfo.title}</h3>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6 -mt-1 -mr-1"
          onClick={onDismiss}
        >
          <X className="h-3 w-3" />
        </Button>
      </div>

      {toolInfo.gesture && (
        <div className="flex items-center gap-2 mb-3 p-2 bg-accent/10 rounded-lg">
          <Smartphone className="h-3 w-3 text-accent" />
          <span className="text-xs text-accent font-medium">{toolInfo.gesture}</span>
        </div>
      )}

      <div className="space-y-2">
        {toolInfo.tips.map((tip, index) => (
          <div key={index} className="flex items-start gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-primary/60 mt-1.5 flex-shrink-0" />
            <p className="text-xs text-muted-foreground leading-relaxed">{tip}</p>
          </div>
        ))}
      </div>
    </div>
  );
};