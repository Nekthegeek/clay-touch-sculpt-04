import { ClayObjectData } from './projectManager';

type SetObjectsAction = (
  value: ClayObjectData[] | ((prev: ClayObjectData[]) => ClayObjectData[])
) => void;

export interface Command {
  execute(): void;
  undo(): void;
  description: string;
}

export class AddObjectCommand implements Command {
  constructor(
    private objects: ClayObjectData[],
    private setObjects: SetObjectsAction,
    private newObject: ClayObjectData,
    private setSelectedObjectId: (id: string | null) => void
  ) {}

  execute(): void {
    const newObjects = [...this.objects, this.newObject];
    this.setObjects(newObjects);
    this.setSelectedObjectId(this.newObject.id);
  }

  undo(): void {
    const newObjects = this.objects.filter(obj => obj.id !== this.newObject.id);
    this.setObjects(newObjects);
    this.setSelectedObjectId(newObjects[0]?.id || null);
  }

  get description(): string {
    return `Add object "${this.newObject.name}"`;
  }
}

export class DeleteObjectCommand implements Command {
  private previousObjects: ClayObjectData[] | null = null;
  private postDeleteObjects: ClayObjectData[] | null = null;

  constructor(
    private objects: ClayObjectData[],
    private setObjects: SetObjectsAction,
    private deletedObject: ClayObjectData,
    private setSelectedObjectId: (id: string | null) => void,
    private previousSelectedId: string | null
  ) {}

  execute(): void {
    this.setObjects(prev => {
      const snapshot = [...prev];
      const filtered = prev.filter(obj => obj.id !== this.deletedObject.id);

      this.previousObjects = snapshot;
      this.postDeleteObjects = filtered;
      this.objects = filtered;

      return filtered;
    });

    const nextSelectedId = this.postDeleteObjects?.[0]?.id ?? null;
    this.setSelectedObjectId(nextSelectedId);
  }

  undo(): void {
    if (this.previousObjects) {
      const restored = this.previousObjects;
      this.setObjects(() => {
        this.objects = restored;
        return restored;
      });
    } else {
      this.setObjects(prev => {
        if (prev.some(obj => obj.id === this.deletedObject.id)) {
          this.objects = prev;
          return prev;
        }

        const restored = [...prev, this.deletedObject];
        this.objects = restored;
        return restored;
      });
    }

    this.postDeleteObjects = null;
    this.setSelectedObjectId(this.previousSelectedId);
  }

  get description(): string {
    return `Delete object "${this.deletedObject.name}"`;
  }
}

export class DuplicateObjectCommand implements Command {
  constructor(
    private objects: ClayObjectData[],
    private setObjects: SetObjectsAction,
    private duplicatedObject: ClayObjectData,
    private setSelectedObjectId: (id: string | null) => void
  ) {}

  execute(): void {
    const newObjects = [...this.objects, this.duplicatedObject];
    this.setObjects(newObjects);
    this.setSelectedObjectId(this.duplicatedObject.id);
  }

  undo(): void {
    const newObjects = this.objects.filter(obj => obj.id !== this.duplicatedObject.id);
    this.setObjects(newObjects);
  }

  get description(): string {
    return `Duplicate object "${this.duplicatedObject.name}"`;
  }
}

export class ColorChangeCommand implements Command {
  constructor(
    private objects: ClayObjectData[],
    private setObjects: SetObjectsAction,
    private objectId: string,
    private newColor: string,
    private oldColor: string,
    private setCurrentColor: (color: string) => void,
    private selectedObjectId: string | null
  ) {}

  execute(): void {
    const newObjects = this.objects.map(obj =>
      obj.id === this.objectId ? { ...obj, color: this.newColor } : obj
    );
    this.setObjects(newObjects);
    if (this.selectedObjectId === this.objectId) {
      this.setCurrentColor(this.newColor);
    }
  }

  undo(): void {
    const newObjects = this.objects.map(obj =>
      obj.id === this.objectId ? { ...obj, color: this.oldColor } : obj
    );
    this.setObjects(newObjects);
    if (this.selectedObjectId === this.objectId) {
      this.setCurrentColor(this.oldColor);
    }
  }

  get description(): string {
    return `Change color of object`;
  }
}

class CommandManager {
  private history: Command[] = [];
  private currentIndex: number = -1;
  private readonly maxHistorySize = 50;

  executeCommand(command: Command): void {
    // Remove any commands after current index (when undoing then doing new action)
    this.history = this.history.slice(0, this.currentIndex + 1);
    
    // Execute the command
    command.execute();
    
    // Add to history
    this.history.push(command);
    this.currentIndex++;
    
    // Limit history size
    if (this.history.length > this.maxHistorySize) {
      this.history.shift();
      this.currentIndex--;
    }
  }

  undo(): boolean {
    if (this.canUndo()) {
      const command = this.history[this.currentIndex];
      command.undo();
      this.currentIndex--;
      return true;
    }
    return false;
  }

  redo(): boolean {
    if (this.canRedo()) {
      this.currentIndex++;
      const command = this.history[this.currentIndex];
      command.execute();
      return true;
    }
    return false;
  }

  canUndo(): boolean {
    return this.currentIndex >= 0;
  }

  canRedo(): boolean {
    return this.currentIndex < this.history.length - 1;
  }

  getUndoDescription(): string | null {
    if (this.canUndo()) {
      return this.history[this.currentIndex].description;
    }
    return null;
  }

  getRedoDescription(): string | null {
    if (this.canRedo()) {
      return this.history[this.currentIndex + 1].description;
    }
    return null;
  }

  clear(): void {
    this.history = [];
    this.currentIndex = -1;
  }

  getHistoryLength(): number {
    return this.history.length;
  }
}

export const commandManager = new CommandManager();