import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Download, Upload, FileJson } from 'lucide-react';
import { ProjectData } from '@/types/project';

interface ProjectImportExportProps {
  currentProject: ProjectData | null;
  onExportProject: () => void;
  onImportProject: (file: File) => void;
}

export const ProjectImportExport: React.FC<ProjectImportExportProps> = ({
  currentProject,
  onExportProject,
  onImportProject
}) => {
  const handleFileImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      onImportProject(file);
      event.target.value = '';
    }
  };

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-medium flex items-center gap-2">
        <FileJson className="h-4 w-4" />
        Import / Export
      </h3>
      
      <div className="grid grid-cols-2 gap-3">
        {/* Import */}
        <div className="space-y-2">
          <Label htmlFor="fileImport" className="text-xs cursor-pointer">
            Import Project File
          </Label>
          <Label htmlFor="fileImport" className="cursor-pointer">
            <Button variant="outline" className="w-full" asChild>
              <span>
                <Upload className="h-4 w-4 mr-2" />
                Import
              </span>
            </Button>
            <Input
              id="fileImport"
              type="file"
              accept=".json"
              onChange={handleFileImport}
              className="hidden"
            />
          </Label>
        </div>

        {/* Export */}
        <div className="space-y-2">
          <Label className="text-xs">
            Export Current Project
          </Label>
          <Button 
            variant="outline"
            onClick={onExportProject}
            disabled={!currentProject}
            className="w-full"
          >
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      <div className="text-xs text-muted-foreground space-y-1">
        <p>• Import: Load a project file (.json) to restore a saved sculpture</p>
        <p>• Export: Download your current project as a JSON file for backup</p>
      </div>
    </div>
  );
};