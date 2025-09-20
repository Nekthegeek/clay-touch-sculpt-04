import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import { Menu, FolderOpen, Settings, HelpCircle, Download, Save, Plus, Palette } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MobileNavigationProps {
  currentTool: string;
  onToolChange: (tool: string) => void;
  onSave: () => void;
  onExport: () => void;
  onAddObject: () => void;
  onShowProjects: () => void;
  onShowHelp: () => void;
  onShowColorPicker: () => void;
}

const mobileTools = [
  { id: 'push', label: 'Push', color: 'bg-red-500' },
  { id: 'pull', label: 'Pull', color: 'bg-blue-500' },
  { id: 'smooth', label: 'Smooth', color: 'bg-green-500' },
  { id: 'pinch', label: 'Pinch', color: 'bg-yellow-500' },
  { id: 'flatten', label: 'Flatten', color: 'bg-purple-500' },
  { id: 'inflate', label: 'Inflate', color: 'bg-pink-500' },
  { id: 'paint', label: 'Paint', color: 'bg-orange-500' },
];

export const MobileNavigation: React.FC<MobileNavigationProps> = ({
  currentTool,
  onToolChange,
  onSave,
  onExport,
  onAddObject,
  onShowProjects,
  onShowHelp,
  onShowColorPicker
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleToolSelect = (toolId: string) => {
    onToolChange(toolId as any);
    setIsOpen(false);
  };

  return (
    <>
      {/* Mobile Menu Button - Only visible on small screens */}
      <div className="fixed top-4 left-4 z-40 md:hidden">
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild>
            <Button 
              variant="ghost" 
              size="icon"
              className="bg-background/90 backdrop-blur-sm border border-border shadow-floating"
            >
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-80 p-0">
            <SheetHeader className="p-6 border-b">
              <SheetTitle className="flex items-center gap-2">
                <Palette className="h-5 w-5 text-primary" />
                ClayPlay 3D
              </SheetTitle>
            </SheetHeader>
            
            <div className="p-6 space-y-6">
              {/* Current Tool */}
              <div>
                <h3 className="text-sm font-medium mb-3">Current Tool</h3>
                <Badge variant="outline" className="bg-primary/10 text-primary border-primary/30">
                  {currentTool.charAt(0).toUpperCase() + currentTool.slice(1)}
                </Badge>
              </div>

              {/* Tool Selection */}
              <div>
                <h3 className="text-sm font-medium mb-3">Sculpting Tools</h3>
                <div className="grid grid-cols-2 gap-2">
                  {mobileTools.map((tool) => (
                    <Button
                      key={tool.id}
                      variant={currentTool === tool.id ? "default" : "outline"}
                      size="sm"
                      className={cn(
                        "justify-start gap-2 h-12",
                        currentTool === tool.id && "bg-primary text-primary-foreground"
                      )}
                      onClick={() => handleToolSelect(tool.id)}
                    >
                      <div className={cn("w-3 h-3 rounded-full", tool.color)} />
                      {tool.label}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Quick Actions */}
              <div>
                <h3 className="text-sm font-medium mb-3">Actions</h3>
                <div className="space-y-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full justify-start gap-2"
                    onClick={() => {
                      onAddObject();
                      setIsOpen(false);
                    }}
                  >
                    <Plus className="h-4 w-4" />
                    Add Object
                  </Button>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full justify-start gap-2"
                    onClick={() => {
                      onShowColorPicker();
                      setIsOpen(false);
                    }}
                  >
                    <Palette className="h-4 w-4" />
                    Colors
                  </Button>
                  
                  <Button
                    variant="outline"  
                    size="sm"
                    className="w-full justify-start gap-2"
                    onClick={() => {
                      onShowProjects();
                      setIsOpen(false);
                    }}
                  >
                    <FolderOpen className="h-4 w-4" />
                    Projects
                  </Button>
                </div>
              </div>

              {/* File Actions */}
              <div>
                <h3 className="text-sm font-medium mb-3">File</h3>
                <div className="space-y-2">
                  <Button
                    variant="secondary"
                    size="sm"
                    className="w-full justify-start gap-2"
                    onClick={() => {
                      onSave();
                      setIsOpen(false);
                    }}
                  >
                    <Save className="h-4 w-4" />
                    Save Project
                  </Button>
                  
                  <Button
                    variant="secondary"
                    size="sm"
                    className="w-full justify-start gap-2"
                    onClick={() => {
                      onExport();
                      setIsOpen(false);
                    }}
                  >
                    <Download className="h-4 w-4" />
                    Export STL
                  </Button>
                </div>
              </div>

              {/* Help */}
              <Button
                variant="ghost"
                size="sm"
                className="w-full justify-start gap-2"
                onClick={() => {
                  onShowHelp();
                  setIsOpen(false);
                }}
              >
                <HelpCircle className="h-4 w-4" />
                Help & Tips
              </Button>
            </div>
          </SheetContent>
        </Sheet>
      </div>

      {/* Mobile Tool Selector - Bottom of screen */}
      <div className="fixed bottom-4 left-4 right-4 z-30 md:hidden">
        <div className="bg-background/90 backdrop-blur-md border border-border rounded-2xl p-3 shadow-floating">
          <div className="flex gap-2 overflow-x-auto">
            {mobileTools.map((tool) => (
              <Button
                key={tool.id}
                variant={currentTool === tool.id ? "default" : "outline"}
                size="sm"
                className={cn(
                  "flex-none gap-1.5",
                  currentTool === tool.id && "bg-primary text-primary-foreground shadow-clay"
                )}
                onClick={() => handleToolSelect(tool.id)}
              >
                <div className={cn("w-2 h-2 rounded-full", tool.color)} />
                {tool.label}
              </Button>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};