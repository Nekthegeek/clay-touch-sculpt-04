import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Settings, Zap, Maximize2 } from 'lucide-react';

interface ToolStrengthControlsProps {
  toolStrength: number;
  toolSize: number;
  onStrengthChange: (value: number) => void;
  onSizeChange: (value: number) => void;
  currentTool: string;
}

export const ToolStrengthControls: React.FC<ToolStrengthControlsProps> = ({
  toolStrength,
  toolSize,
  onStrengthChange,
  onSizeChange,
  currentTool
}) => {
  const getToolDescription = (tool: string) => {
    const descriptions: { [key: string]: string } = {
      push: 'Push clay inward',
      pull: 'Pull clay outward', 
      smooth: 'Smooth rough surfaces',
      flatten: 'Flatten surfaces',
      inflate: 'Inflate areas',
      twist: 'Twist geometry',
      paint: 'Paint surfaces',
      'vertex-select': 'Select vertices',
      'vertex-move': 'Move vertices'
    };
    return descriptions[tool] || 'Sculpting tool';
  };

  return (
    <Card className="fixed top-20 right-4 w-72 floating-panel z-30">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-sm">
          <Settings className="w-4 h-4" />
          Tool Settings
          <Badge variant="outline" className="ml-auto capitalize">
            {currentTool.replace('-', ' ')}
          </Badge>
        </CardTitle>
        <p className="text-xs text-muted-foreground">
          {getToolDescription(currentTool)}
        </p>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Tool Strength */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="flex items-center gap-1 text-xs font-medium">
              <Zap className="w-3 h-3" />
              Strength
            </label>
            <span className="text-xs text-muted-foreground">{toolStrength}%</span>
          </div>
          <Slider
            value={[toolStrength]}
            onValueChange={(values) => onStrengthChange(values[0])}
            min={1}
            max={100}
            step={1}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Gentle</span>
            <span>Strong</span>
          </div>
        </div>

        {/* Tool Size */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="flex items-center gap-1 text-xs font-medium">
              <Maximize2 className="w-3 h-3" />
              Size
            </label>
            <span className="text-xs text-muted-foreground">{toolSize.toFixed(1)}</span>
          </div>
          <Slider
            value={[toolSize]}
            onValueChange={(values) => onSizeChange(values[0])}
            min={0.1}
            max={2.0}
            step={0.1}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Fine</span>
            <span>Broad</span>
          </div>
        </div>

        {/* Tool-specific hints */}
        <div className="bg-muted/50 p-2 rounded-md">
          <p className="text-xs text-muted-foreground">
            {currentTool === 'paint' && 'Click and drag to paint surfaces'}
            {currentTool === 'push' && 'Higher strength pushes deeper'}
            {currentTool === 'pull' && 'Higher strength pulls further out'}
            {currentTool === 'smooth' && 'Lower strength for subtle smoothing'}
            {currentTool === 'vertex-select' && 'Click vertices to select them'}
            {currentTool === 'vertex-move' && 'Drag to move selected vertices'}
            {(!['paint', 'push', 'pull', 'smooth', 'vertex-select', 'vertex-move'].includes(currentTool)) && 
             'Adjust strength and size for best results'}
          </p>
        </div>

        {/* Quick presets */}
        <div className="flex gap-1">
          <button
            onClick={() => {
              onStrengthChange(25);
              onSizeChange(0.3);
            }}
            className="flex-1 text-xs py-1 px-2 bg-muted hover:bg-muted/80 rounded transition-colors"
          >
            Fine Detail
          </button>
          <button
            onClick={() => {
              onStrengthChange(75);
              onSizeChange(1.0);
            }}
            className="flex-1 text-xs py-1 px-2 bg-muted hover:bg-muted/80 rounded transition-colors"
          >
            Rough Work
          </button>
        </div>
      </CardContent>
    </Card>
  );
};