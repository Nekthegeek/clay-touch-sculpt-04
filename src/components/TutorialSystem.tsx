import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { X, ChevronRight, ChevronLeft, Play, RotateCcw } from 'lucide-react';
import { toast } from 'sonner';

interface TutorialStep {
  id: string;
  title: string;
  description: string;
  target?: string;
  action?: string;
  tool?: string;
}

const tutorialSteps: TutorialStep[] = [
  {
    id: 'welcome',
    title: 'Welcome to Clay Studio',
    description: 'Learn how to sculpt amazing 3D creations! This tutorial will guide you through the basics.',
    action: 'Click Next to continue'
  },
  {
    id: 'tools',
    title: 'Sculpting Tools',
    description: 'Use different tools to shape your clay. Push inward, pull outward, smooth surfaces, and more.',
    target: 'tool-panel',
    tool: 'push'
  },
  {
    id: 'sculpting',
    title: 'Start Sculpting',
    description: 'Click and drag on the clay object to sculpt it. Try the Push tool first!',
    target: 'canvas',
    action: 'Click and drag on the clay ball'
  },
  {
    id: 'tools-switch',
    title: 'Switch Tools',
    description: 'Try different tools like Pull, Smooth, and Inflate to create various effects.',
    target: 'tool-panel',
    tool: 'pull'
  },
  {
    id: 'colors',
    title: 'Paint Mode',
    description: 'Switch to Paint mode to add colors to your sculpture.',
    target: 'tool-panel',
    tool: 'paint'
  },
  {
    id: 'objects',
    title: 'Manage Objects',
    description: 'Add new objects, duplicate existing ones, or change colors using the Object Manager.',
    target: 'object-manager'
  },  
  {
    id: 'save-export',
    title: 'Save & Export',
    description: 'Save your project for later or export it as an STL file for 3D printing.',
    target: 'top-bar'
  },
  {
    id: 'complete',
    title: 'Tutorial Complete!',
    description: 'You\'re ready to create amazing clay sculptures. Have fun exploring!',
    action: 'Start creating!'
  }
];

interface TutorialSystemProps {
  isOpen: boolean;
  onClose: () => void;
  currentTool: string;
  onToolChange: (tool: 'push' | 'pull' | 'smooth' | 'pinch' | 'flatten' | 'inflate' | 'twist' | 'vertex-select' | 'vertex-move' | 'paint') => void;
}

export const TutorialSystem: React.FC<TutorialSystemProps> = ({
  isOpen,
  onClose,
  currentTool,
  onToolChange
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);

  useEffect(() => {
    // Check if tutorial was completed before
    const completed = localStorage.getItem('clay-studio-tutorial-completed');
    setIsCompleted(!!completed);
  }, []);

  const handleNext = () => {
    if (currentStep < tutorialSteps.length - 1) {
      const nextStep = currentStep + 1;
      setCurrentStep(nextStep);
      
      // Auto-change tool if specified
      const step = tutorialSteps[nextStep];
      if (step.tool && step.tool !== currentTool) {
        onToolChange(step.tool as any);
      }
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = () => {
    localStorage.setItem('clay-studio-tutorial-completed', 'true');
    setIsCompleted(true);
    onClose();
    toast.success('Tutorial completed! Happy sculpting!');
  };

  const handleSkip = () => {
    localStorage.setItem('clay-studio-tutorial-completed', 'true');
    setIsCompleted(true);
    onClose();
  };

  const handleRestart = () => {
    setCurrentStep(0);
    localStorage.removeItem('clay-studio-tutorial-completed');
    setIsCompleted(false);
  };

  if (!isOpen) return null;

  const step = tutorialSteps[currentStep];
  const progress = ((currentStep + 1) / tutorialSteps.length) * 100;

  return (
    <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4">
      <Card className="w-full max-w-md animate-scale-in">
        <CardHeader className="relative">
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="absolute right-2 top-2 h-8 w-8 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
          
          <div className="flex items-center justify-between mb-2">
            <Badge variant="secondary">
              Step {currentStep + 1} of {tutorialSteps.length}
            </Badge>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleRestart}
              className="h-8 w-8 p-0"
            >
              <RotateCcw className="h-3 w-3" />
            </Button>
          </div>
          
          <Progress value={progress} className="mb-4" />
          
          <CardTitle className="text-lg">{step.title}</CardTitle>
          <CardDescription>{step.description}</CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {step.action && (
            <div className="bg-muted/50 p-3 rounded-md">
              <p className="text-sm font-medium text-muted-foreground">
                <Play className="inline w-3 h-3 mr-1" />
                {step.action}
              </p>
            </div>
          )}
          
          {step.tool && (
            <div className="bg-primary/5 border border-primary/20 p-3 rounded-md">
              <p className="text-sm">
                <strong>Current Tool:</strong> <Badge variant="outline" className="ml-1">{step.tool}</Badge>
              </p>
            </div>
          )}
          
          <div className="flex justify-between">
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={currentStep === 0}
              className="flex items-center gap-2"
            >
              <ChevronLeft className="w-4 h-4" />
              Previous
            </Button>
            
            <div className="flex gap-2">
              <Button variant="ghost" onClick={handleSkip}>
                Skip Tutorial
              </Button>
              
              {currentStep === tutorialSteps.length - 1 ? (
                <Button onClick={handleComplete} className="flex items-center gap-2">
                  Complete
                  <Play className="w-4 h-4" />
                </Button>
              ) : (
                <Button onClick={handleNext} className="flex items-center gap-2">
                  Next
                  <ChevronRight className="w-4 h-4" />
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};