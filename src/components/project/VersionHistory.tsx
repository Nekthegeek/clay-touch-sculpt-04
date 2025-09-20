import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Save, 
  Clock, 
  Trash2, 
  RotateCcw, 
  GitBranch,
  MessageSquare,
  History
} from 'lucide-react';
import { ProjectVersion } from '@/types/project';

interface VersionHistoryProps {
  versions: ProjectVersion[];
  currentProjectId: string | null;
  onSaveVersion: (comment?: string) => void;
  onLoadVersion: (versionId: string) => void;
  onDeleteVersion: (versionId: string) => void;
}

export const VersionHistory: React.FC<VersionHistoryProps> = ({
  versions,
  currentProjectId,
  onSaveVersion,
  onLoadVersion,
  onDeleteVersion
}) => {
  const [versionComment, setVersionComment] = useState('');

  const handleSaveVersion = () => {
    onSaveVersion(versionComment.trim() || undefined);
    setVersionComment('');
  };

  const formatTimestamp = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 24) {
      return date.toLocaleTimeString([], { 
        hour: '2-digit', 
        minute: '2-digit' 
      });
    } else if (diffInHours < 24 * 7) {
      return date.toLocaleDateString([], { 
        weekday: 'short', 
        month: 'short', 
        day: 'numeric' 
      });
    } else {
      return date.toLocaleDateString([], { 
        month: 'short', 
        day: 'numeric', 
        year: 'numeric' 
      });
    }
  };

  if (!currentProjectId) {
    return (
      <div className="space-y-4">
        <h3 className="text-sm font-medium">Version History</h3>
        <div className="text-center py-6">
          <History className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
          <p className="text-sm text-muted-foreground">
            Save a project first to track version history
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-medium flex items-center gap-2">
        <GitBranch className="h-4 w-4" />
        Version History
      </h3>
      
      {/* Save New Version */}
      <div className="space-y-3 p-3 border rounded-lg bg-muted/20">
        <div>
          <Label htmlFor="versionComment" className="text-xs">
            Version Comment (optional)
          </Label>
          <Input
            id="versionComment"
            value={versionComment}
            onChange={(e) => setVersionComment(e.target.value)}
            placeholder="Describe what changed..."
            className="mt-1"
          />
        </div>
        <Button 
          onClick={handleSaveVersion}
          size="sm"
          className="w-full"
        >
          <Save className="h-3 w-3 mr-2" />
          Save Current Version
        </Button>
      </div>

      {/* Version List */}
      <div className="space-y-2 max-h-64 overflow-y-auto">
        {versions.length === 0 ? (
          <div className="text-center py-6">
            <Clock className="h-6 w-6 mx-auto text-muted-foreground mb-2" />
            <p className="text-sm text-muted-foreground mb-1">
              No versions saved yet
            </p>
            <p className="text-xs text-muted-foreground">
              Save your first version to track changes
            </p>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between text-xs text-muted-foreground px-1">
              <span>{versions.length} version{versions.length !== 1 ? 's' : ''}</span>
              <span>Latest first</span>
            </div>
            
            {versions.map((version, index) => (
              <div
                key={version.id}
                className="flex items-start gap-3 p-3 border rounded-lg hover:bg-muted/30 transition-colors"
              >
                <div className="flex flex-col items-center gap-1 mt-1">
                  <div className="w-2 h-2 rounded-full bg-primary" />
                  {index < versions.length - 1 && (
                    <div className="w-px h-6 bg-border" />
                  )}
                </div>
                
                <div className="flex-1 min-w-0 space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-medium">
                          Version #{versions.length - index}
                        </span>
                        {index === 0 && (
                          <Badge variant="secondary" className="text-xs">
                            Latest
                          </Badge>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        {formatTimestamp(version.timestamp)}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onLoadVersion(version.id)}
                      >
                        <RotateCcw className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onDeleteVersion(version.id)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                  
                  {version.comment && (
                    <div className="flex items-start gap-2">
                      <MessageSquare className="h-3 w-3 text-muted-foreground mt-0.5" />
                      <p className="text-xs text-muted-foreground">
                        {version.comment}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </>
        )}
      </div>

      {versions.length > 0 && (
        <div className="text-xs text-muted-foreground text-center pt-2 border-t">
          Auto-saves every 5 minutes when changes are detected
        </div>
      )}
    </div>
  );
};