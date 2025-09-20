import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Download, 
  Upload, 
  Trash2, 
  Save, 
  Sparkles, 
  Box, 
  Play 
} from 'lucide-react';
import { ProjectTemplate } from '@/types/project';

interface TemplateSectionProps {
  builtInTemplates: ProjectTemplate[];
  customTemplates: ProjectTemplate[];
  onLoadTemplate: (template: ProjectTemplate) => void;
  onSaveTemplate: (name: string, description?: string) => void;
  onDeleteTemplate: (templateId: string) => void;
  onExportTemplate: (templateId: string) => void;
  onImportTemplate: (file: File) => void;
}

export const TemplateSection: React.FC<TemplateSectionProps> = ({
  builtInTemplates,
  customTemplates,
  onLoadTemplate,
  onSaveTemplate,
  onDeleteTemplate,
  onExportTemplate,
  onImportTemplate
}) => {
  const [templateName, setTemplateName] = useState('');
  const [templateDescription, setTemplateDescription] = useState('');

  const handleSave = () => {
    if (!templateName.trim()) return;
    
    onSaveTemplate(templateName.trim(), templateDescription.trim() || undefined);
    setTemplateName('');
    setTemplateDescription('');
  };

  const handleFileImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      onImportTemplate(file);
      event.target.value = '';
    }
  };

  const TemplateGrid = ({ templates, showActions = true }: { 
    templates: ProjectTemplate[]; 
    showActions?: boolean;
  }) => (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      {templates.map((template) => (
        <div
          key={template.id}
          className="border rounded-lg p-3 hover:bg-muted/50 transition-colors"
        >
          <div className="flex items-start justify-between gap-2 mb-2">
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-medium truncate flex items-center gap-2">
                {template.isBuiltIn && <Sparkles className="h-3 w-3 text-primary" />}
                {template.name}
              </h4>
              <p className="text-xs text-muted-foreground">
                {template.objects.length} objects
              </p>
            </div>
            {template.isBuiltIn && (
              <Badge variant="secondary" className="text-xs">
                Built-in
              </Badge>
            )}
          </div>

          {template.description && (
            <p className="text-xs text-muted-foreground mb-3 line-clamp-2">
              {template.description}
            </p>
          )}

          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onLoadTemplate(template)}
              className="flex-1"
            >
              <Play className="h-3 w-3 mr-1" />
              Use Template
            </Button>
            
            {showActions && (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onExportTemplate(template.id)}
                >
                  <Download className="h-3 w-3" />
                </Button>
                {!template.isBuiltIn && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onDeleteTemplate(template.id)}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                )}
              </>
            )}
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium">Templates & Presets</h3>
        
        <div className="flex items-center gap-2">
          <Label htmlFor="templateImport" className="cursor-pointer">
            <Button variant="outline" size="sm" asChild>
              <span>
                <Upload className="h-3 w-3 mr-1" />
                Import
              </span>
            </Button>
            <Input
              id="templateImport"
              type="file"
              accept=".json"
              onChange={handleFileImport}
              className="hidden"
            />
          </Label>
        </div>
      </div>

      <Tabs defaultValue="built-in" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="built-in">Built-in</TabsTrigger>
          <TabsTrigger value="custom">My Templates</TabsTrigger>
          <TabsTrigger value="create">Create New</TabsTrigger>
        </TabsList>
        
        <TabsContent value="built-in" className="space-y-3">
          {builtInTemplates.length > 0 ? (
            <TemplateGrid templates={builtInTemplates} showActions={false} />
          ) : (
            <p className="text-sm text-muted-foreground text-center py-4">
              No built-in templates available
            </p>
          )}
        </TabsContent>
        
        <TabsContent value="custom" className="space-y-3">
          {customTemplates.length > 0 ? (
            <TemplateGrid templates={customTemplates} />
          ) : (
            <div className="text-center py-6">
              <Box className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
              <p className="text-sm text-muted-foreground">
                No custom templates yet. Create your first template!
              </p>
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="create" className="space-y-3">
          <div className="space-y-3">
            <div>
              <Label htmlFor="templateName" className="text-xs">
                Template Name *
              </Label>
              <Input
                id="templateName"
                value={templateName}
                onChange={(e) => setTemplateName(e.target.value)}
                placeholder="My Custom Template"
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="templateDescription" className="text-xs">
                Description (optional)
              </Label>
              <Textarea
                id="templateDescription"
                value={templateDescription}
                onChange={(e) => setTemplateDescription(e.target.value)}
                placeholder="Describe what this template is useful for..."
                className="mt-1 min-h-[60px]"
              />
            </div>

            <Button 
              onClick={handleSave}
              disabled={!templateName.trim()}
              className="w-full"
            >
              <Save className="h-4 w-4 mr-2" />
              Save Current Scene as Template
            </Button>

            <p className="text-xs text-muted-foreground">
              This will save your current objects and tool settings as a reusable template.
            </p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};