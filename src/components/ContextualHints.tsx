import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { X, Lightbulb, Hand, Move, Palette } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ContextualHintsProps {
  currentTool: string;
  selectedObjectId: string | null;
  className?: string;
}

const toolHints = {
  push: {
    icon: Hand,
    title: 'Push Tool Active',
    hints: [
      'Click and drag to push clay inward',
      'Use longer strokes for smoother results',
      'Adjust strength with +/- keys'
    ]
  },
  pull: {
    icon: Move,
    title: 'Pull Tool Active',
    hints: [
      'Click and drag to pull clay outward',
      'Create peaks and raised surfaces',
      'Combine with smooth tool for organic shapes'
    ]
  },
  smooth: {
    icon: Move,
    title: 'Smooth Tool Active',
    hints: [
      'Click and drag to smooth rough surfaces',
      'Use circular motions for best results',
      'Great for finishing touches'
    ]
  },
  paint: {
    icon: Palette,
    title: 'Paint Tool Active',
    hints: [
      'Click to paint colors on your sculpture',
      'Switch colors in the color panel',
      'Paint mode shows color preview'
    ]
  },
  // Add more tool-specific hints
  default: {
    icon: Lightbulb,
    title: 'Sculpting Tips',
    hints: [
      'Use 1-9 keys to quickly switch tools',
      'Hold Shift while sculpting for finer control',
      'Press Ctrl+Z to undo, Ctrl+Y to redo'
    ]
  }
};

export const ContextualHints: React.FC<ContextualHintsProps> = ({
  currentTool,
  selectedObjectId,
  className
}) => {
  const [isVisible, setIsVisible] = useState(true);
  const [currentHint, setCurrentHint] = useState(0);
  
  const hints = toolHints[currentTool as keyof typeof toolHints] || toolHints.default;
  const Icon = hints.icon;

  useEffect(() => {
    setCurrentHint(0);
  }, [currentTool]);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentHint((prev) => (prev + 1) % hints.hints.length);
    }, 4000);

    return () => clearInterval(interval);
  }, [hints.hints.length]);

  if (!isVisible) return null;

  return (
    <Card className={cn(
      "fixed top-6 right-6 w-80 z-20 shadow-floating border-primary/20",
      className
    )}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            <Icon className="h-4 w-4 text-primary" />
            <h3 className="font-semibold text-sm">{hints.title}</h3>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsVisible(false)}
            className="h-6 w-6 p-0 opacity-60 hover:opacity-100"
          >
            <X className="h-3 w-3" />
          </Button>
        </div>
        
        <div className="space-y-2">
          {hints.hints.map((hint, index) => (
            <div
              key={index}
              className={cn(
                "text-sm transition-all duration-500 p-2 rounded-md",
                index === currentHint 
                  ? "bg-primary/10 text-foreground border-l-2 border-primary" 
                  : "text-muted-foreground opacity-60"
              )}
            >
              {hint}
            </div>
          ))}
        </div>
        
        {/* Progress indicators */}
        <div className="flex gap-1 mt-3 justify-center">
          {hints.hints.map((_, index) => (
            <div
              key={index}
              className={cn(
                "h-1 w-8 rounded-full transition-all duration-300",
                index === currentHint ? "bg-primary" : "bg-muted"
              )}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  );
};