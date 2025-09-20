import React from 'react';
import { Move, ArrowUpDown, Waves, Zap, Square, Circle, RotateCw, MousePointer, Navigation, Paintbrush } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface ToolPanelProps {
  currentTool: 'push' | 'pull' | 'smooth' | 'pinch' | 'flatten' | 'inflate' | 'twist' | 'vertex-select' | 'vertex-move' | 'paint';
  onToolChange: (tool: 'push' | 'pull' | 'smooth' | 'pinch' | 'flatten' | 'inflate' | 'twist' | 'vertex-select' | 'vertex-move' | 'paint') => void;
}

const tools = [
  {
    id: 'push' as const,
    icon: Move,
    label: 'Push',
    description: 'Push clay inward',
  },
  {
    id: 'pull' as const,
    icon: ArrowUpDown,
    label: 'Pull',
    description: 'Pull clay outward',
  },
  {
    id: 'smooth' as const,
    icon: Waves,
    label: 'Smooth',
    description: 'Smooth surface',
  },
  {
    id: 'pinch' as const,
    icon: Zap,
    label: 'Pinch',
    description: 'Pinch and shape',
  },
  {
    id: 'flatten' as const,
    icon: Square,
    label: 'Flatten',
    description: 'Flatten surface',
  },
  {
    id: 'inflate' as const,
    icon: Circle,
    label: 'Inflate',
    description: 'Inflate outward',
  },
  {
    id: 'twist' as const,
    icon: RotateCw,
    label: 'Twist',
    description: 'Twist and rotate',
  },
  {
    id: 'vertex-select' as const,
    icon: MousePointer,
    label: 'Select',
    description: 'Select vertices',
  },
  {
    id: 'vertex-move' as const,
    icon: Navigation,
    label: 'Move',
    description: 'Move vertices',
  },
  {
    id: 'paint' as const,
    icon: Paintbrush,
    label: 'Paint',
    description: 'Paint texture',
  },
];

export const ToolPanel: React.FC<ToolPanelProps> = ({ currentTool, onToolChange }) => {
  return (
    <div className="absolute left-4 top-1/2 transform -translate-y-1/2 z-10">
      <div className="floating-panel flex flex-col gap-2">
        {tools.map((tool) => {
          const Icon = tool.icon;
          const isActive = currentTool === tool.id;

          return (
            <Button
              key={tool.id}
              variant="ghost"
              size="icon"
              className={cn(
                "touch-target w-12 h-12 relative group",
                isActive 
                  ? "bg-primary text-primary-foreground shadow-clay" 
                  : "btn-tool"
              )}
              onClick={() => onToolChange(tool.id)}
            >
              <Icon className="h-5 w-5" />
              
              {/* Enhanced Tooltip */}
              <div className="absolute left-full ml-3 top-1/2 transform -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none z-50">
                <div className="bg-card border border-border shadow-floating text-card-foreground text-sm px-3 py-2 rounded-lg whitespace-nowrap">
                  <div className="font-medium">{tool.label}</div>
                  <div className="text-xs text-muted-foreground mt-1">{tool.description}</div>
                  <div className="text-xs text-accent mt-1">Key: {tools.indexOf(tool) + 1}</div>
                </div>
              </div>
            </Button>
          );
        })}
      </div>
    </div>
  );
};