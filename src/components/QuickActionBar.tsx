import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Undo, Redo, Save, Download, Plus, HelpCircle, Palette } from 'lucide-react';
import { toast } from 'sonner';

interface QuickActionBarProps {
  onUndo: () => void;
  onRedo: () => void;
  onSave: () => void;
  onExport: () => void;
  onAddObject: () => void;
  onShowHelp: () => void;
  onShowColorPicker: () => void;
  canUndo: boolean;
  canRedo: boolean;
  currentTool: string;
}

export const QuickActionBar: React.FC<QuickActionBarProps> = ({
  onUndo,
  onRedo,
  onSave,
  onExport,
  onAddObject,
  onShowHelp,
  onShowColorPicker,
  canUndo,
  canRedo,
  currentTool
}) => {
  const quickActions = [
    {
      icon: Undo,
      label: 'Undo',
      shortcut: 'Ctrl+Z',
      onClick: onUndo,
      disabled: !canUndo,
      variant: 'ghost' as const
    },
    {
      icon: Redo,
      label: 'Redo',
      shortcut: 'Ctrl+Y',
      onClick: onRedo,
      disabled: !canRedo,
      variant: 'ghost' as const
    },
    {
      icon: Plus,
      label: 'Add Object',
      shortcut: 'Ctrl+N',
      onClick: onAddObject,
      disabled: false,
      variant: 'ghost' as const
    },
    {
      icon: Palette,
      label: 'Colors',
      shortcut: 'C',
      onClick: onShowColorPicker,
      disabled: false,
      variant: 'ghost' as const
    },
    {
      icon: Save,
      label: 'Save',
      shortcut: 'Ctrl+S',
      onClick: onSave,
      disabled: false,
      variant: 'secondary' as const
    },
    {
      icon: Download,
      label: 'Export',
      shortcut: 'Ctrl+E',
      onClick: onExport,
      disabled: false,
      variant: 'secondary' as const
    }
  ];

  return (
    <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-30">
      <div className="floating-panel flex items-center gap-2">
        {/* Current Tool Badge */}
        <Badge variant="outline" className="bg-primary/10 text-primary border-primary/30">
          {currentTool.charAt(0).toUpperCase() + currentTool.slice(1)}
        </Badge>
        
        {/* Quick Actions */}
        {quickActions.map((action) => {
          const Icon = action.icon;
          return (
            <Button
              key={action.label}
              variant={action.variant}
              size="sm"
              className="touch-target group relative"
              onClick={action.onClick}
              disabled={action.disabled}
            >
              <Icon className="h-4 w-4" />
              
              {/* Tooltip */}
              <div className="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none z-50">
                <div className="bg-card border border-border shadow-floating text-card-foreground text-xs px-2 py-1 rounded whitespace-nowrap">
                  <div className="font-medium">{action.label}</div>
                  <div className="text-muted-foreground">{action.shortcut}</div>
                </div>
              </div>
            </Button>
          );
        })}
        
        {/* Help Button */}
        <div className="w-px h-6 bg-border mx-1" />
        <Button
          variant="ghost"
          size="sm"
          className="touch-target group relative"
          onClick={onShowHelp}
        >
          <HelpCircle className="h-4 w-4" />
          
          {/* Tooltip */}
          <div className="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none z-50">
            <div className="bg-card border border-border shadow-floating text-card-foreground text-xs px-2 py-1 rounded whitespace-nowrap">
              <div className="font-medium">Help</div>
              <div className="text-muted-foreground">Shift+?</div>
            </div>
          </div>
        </Button>
      </div>
    </div>
  );
};