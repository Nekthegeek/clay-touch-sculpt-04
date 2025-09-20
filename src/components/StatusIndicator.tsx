import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Clock, CheckCircle, AlertCircle, Zap } from 'lucide-react';

interface StatusIndicatorProps {
  status: 'idle' | 'sculpting' | 'saving' | 'exporting' | 'complete';
  progress?: number;
  currentTool?: string;
  toolStrength?: number;
  className?: string;
}

export const StatusIndicator: React.FC<StatusIndicatorProps> = ({
  status,
  progress = 0,
  currentTool,
  toolStrength,
  className
}) => {
  const getStatusIcon = () => {
    switch (status) {
      case 'sculpting':
        return <Zap className="h-3 w-3 text-primary animate-pulse" />;
      case 'saving':
        return <Clock className="h-3 w-3 text-accent animate-spin" />;
      case 'exporting':
        return <Clock className="h-3 w-3 text-accent animate-spin" />;
      case 'complete':
        return <CheckCircle className="h-3 w-3 text-green-500" />;
      default:
        return <AlertCircle className="h-3 w-3 text-muted-foreground" />;
    }
  };

  const getStatusText = () => {
    switch (status) {
      case 'sculpting':
        return currentTool ? `${currentTool.charAt(0).toUpperCase() + currentTool.slice(1)}ing` : 'Sculpting';
      case 'saving':
        return 'Saving...';
      case 'exporting':
        return 'Exporting...';
      case 'complete':
        return 'Complete';
      default:
        return 'Ready';
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case 'sculpting':
        return 'bg-primary/10 text-primary border-primary/20';
      case 'saving':
      case 'exporting':
        return 'bg-accent/10 text-accent border-accent/20';
      case 'complete':
        return 'bg-green-500/10 text-green-500 border-green-500/20';
      default:
        return 'bg-muted/10 text-muted-foreground border-muted/20';
    }
  };

  return (
    <div className={`floating-panel-sm ${className}`}>
      <div className="flex items-center gap-3 mb-2">
        <div className="flex items-center gap-2">
          {getStatusIcon()}
          <Badge variant="outline" className={getStatusColor()}>
            {getStatusText()}
          </Badge>
        </div>
        {currentTool && (
          <Badge variant="secondary" className="text-xs">
            {currentTool.toUpperCase()}
          </Badge>
        )}
      </div>
      
      {(status === 'saving' || status === 'exporting') && (
        <Progress value={progress} className="h-2" />
      )}
      
      {toolStrength !== undefined && status === 'sculpting' && (
        <div className="flex items-center gap-2 mt-2">
          <span className="text-xs text-muted-foreground">Strength:</span>
          <div className="flex-1">
            <Progress value={toolStrength} className="h-1" />
          </div>
          <span className="text-xs font-mono w-8">{toolStrength}%</span>
        </div>
      )}
    </div>
  );
};