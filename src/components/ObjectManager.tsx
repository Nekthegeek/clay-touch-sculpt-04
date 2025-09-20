import React from 'react';
import { Plus, Trash2, Copy, Palette } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface ClayObjectData {
  id: string;
  position: [number, number, number];
  color: string;
  size: number;
  name: string;
}

interface ObjectManagerProps {
  objects: ClayObjectData[];
  selectedObjectId: string | null;
  onAddObject: () => void;
  onDeleteObject: (id: string) => void;
  onDuplicateObject: (id: string) => void;
  onSelectObject: (id: string) => void;
  onColorChange: (id: string, color: string) => void;
  currentColor: string;
}

export const ObjectManager: React.FC<ObjectManagerProps> = ({
  objects,
  selectedObjectId,
  onAddObject,
  onDeleteObject,
  onDuplicateObject,
  onSelectObject,
  onColorChange,
  currentColor,
}) => {
  return (
    <div className="absolute right-4 top-1/2 transform -translate-y-1/2 z-10">
      <div className="floating-panel w-64 max-h-96 overflow-y-auto">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-sm text-foreground">Objects</h3>
          <Button
            variant="ghost"
            size="icon"
            className="touch-target w-8 h-8"
            onClick={onAddObject}
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>

        <div className="space-y-2">
          {objects.map((object) => {
            const isSelected = selectedObjectId === object.id;
            
            return (
              <div
                key={object.id}
                className={cn(
                  "p-2 rounded-md border transition-colors cursor-pointer",
                  isSelected 
                    ? "bg-primary/10 border-primary" 
                    : "bg-background/50 border-border hover:bg-accent/50"
                )}
                onClick={() => onSelectObject(object.id)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 flex-1">
                    <div 
                      className="w-4 h-4 rounded-full border border-border"
                      style={{ backgroundColor: object.color }}
                    />
                    <span className="text-xs font-medium truncate">
                      {object.name}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-1">
                    <input
                      type="color"
                      value={object.color}
                      onChange={(e) => onColorChange(object.id, e.target.value)}
                      className="w-6 h-6 rounded border-0 cursor-pointer"
                      title="Change color"
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      className="w-6 h-6"
                      onClick={(e) => {
                        e.stopPropagation();
                        onDuplicateObject(object.id);
                      }}
                    >
                      <Copy className="h-3 w-3" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="w-6 h-6 text-destructive"
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteObject(object.id);
                      }}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
                
                <div className="text-xs text-muted-foreground mt-1">
                  Size: {object.size.toFixed(1)} | 
                  Pos: ({object.position[0].toFixed(1)}, {object.position[1].toFixed(1)}, {object.position[2].toFixed(1)})
                </div>
              </div>
            );
          })}
        </div>

        {objects.length === 0 && (
          <div className="text-center py-4 text-muted-foreground text-xs">
            No objects yet. Click + to add one!
          </div>
        )}
      </div>
    </div>
  );
};