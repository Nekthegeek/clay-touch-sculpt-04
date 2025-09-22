# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Project Overview

This is **clay-touch-sculpt-04**, a 3D clay sculpting application built as a cross-platform app using React + TypeScript + Vite, with native mobile support via Capacitor. The app allows users to interactively sculpt 3D clay objects using various tools like push, pull, smooth, and twist.

## Essential Commands

### Development
```powershell
# Start development server (Vite dev server on port 8080)
npm run dev

# Production build
npm run build

# Development build (for testing)
npm run build:dev

# Preview production build locally
npm run preview

# Lint code (ESLint)
npm run lint
```

### Native Mobile Development
```powershell
# Build web assets and sync to native projects
npm run build
npx cap sync

# Open native IDEs
npx cap open android
npx cap open ios

# Live reload for Android development
npm run dev
adb reverse tcp:8080 tcp:8080  # Forward device port to localhost
npx cap run android
```

**Important**: The `capacitor.config.ts` currently points to a hosted preview URL. For local development on native platforms, either comment out `server.url` or use `npx cap run android -l --external`.

## Code Architecture

### Core Application Flow
- **Entry Point**: `src/main.tsx` → `src/App.tsx` → `src/pages/Index.tsx`
- **Main Studio**: `src/components/AdvancedClayStudio.tsx` (primary 3D sculpting interface)
- **Fallback Studio**: `src/components/ClayStudio.tsx` (simpler version)

### 3D Sculpting Engine
- **ClayObject**: `src/components/ClayObject.tsx` - Individual sculptable 3D objects with mesh deformation
- **Core Pattern**: Uses `@react-three/fiber` + `three.js` with direct `BufferGeometry` manipulation
- **Deformation Logic**: Modifies vertex positions, calls `positions.needsUpdate = true` and `geometry.computeVertexNormals()`
- **Performance**: Batches pointer events with `requestAnimationFrame` to avoid frame drops

### Key Systems

#### Project Management
- **Storage**: `src/services/projectManager.ts` - localStorage-based project persistence
- **Types**: `src/types/project.ts` - defines `ClayObjectData`, `ProjectData`, `ProjectVersion`
- **Versioning**: `src/services/versionManager.ts` - automatic versioning with 20-version limit
- **Templates**: `src/services/templateManager.ts` - built-in and custom project templates

#### Command System
- **Undo/Redo**: `src/hooks/useCommandManager.ts` - command pattern for reversible operations
- **Commands**: `src/services/commandManager.ts` - `AddObjectCommand`, `DeleteObjectCommand`, etc.

#### Mobile Optimization
- **Touch Gestures**: `src/hooks/useTouchGestures.ts` - long-press, double-tap, pinch gestures
- **Performance**: `src/hooks/useMobileOptimizations.ts` - adaptive rendering based on device capabilities
- **Navigation**: `src/components/MobileNavigation.tsx` - mobile-optimized UI

#### Export System
- **STL Export**: `src/services/stlExporter.ts` - converts 3D geometry to STL format
- **Project Export**: JSON format with geometry data

### Directory Structure
```
src/
├── components/          # React components
│   ├── AdvancedClayStudio.tsx  # Main 3D studio interface
│   ├── ClayObject.tsx          # Individual sculptable objects
│   ├── ToolPanel.tsx           # Desktop tool selection
│   └── MobileNavigation.tsx    # Mobile UI
├── services/           # Business logic
│   ├── projectManager.ts      # Project save/load
│   ├── stlExporter.ts         # 3D model export
│   └── commandManager.ts      # Undo/redo system
├── hooks/             # Custom React hooks
│   ├── useCommandManager.ts   # Command pattern
│   ├── useGeometryCache.ts    # 3D geometry caching
│   └── useMobileOptimizations.ts
├── types/             # TypeScript definitions
└── pages/             # Route components
```

## Development Patterns

### Path Aliases
- Use `@/components/...`, `@/services/...` etc. (configured in `vite.config.ts`)

### 3D Sculpting Tools
- **Tool Types**: `push`, `pull`, `smooth`, `pinch`, `flatten`, `inflate`, `twist`, `vertex-select`, `vertex-move`, `paint`
- **Adding New Tools**: 
  1. Update `currentTool` type union in `AdvancedClayStudio.tsx`
  2. Add tool button in `ToolPanel.tsx`
  3. Implement deformation logic in `ClayObject.tsx`'s `handleVertexManipulation`

### Project Persistence
- **Auto-save**: Projects save to localStorage with geometry data
- **Format**: Use `getSerializedGeometry()` to capture current mesh state
- **Loading**: Geometry is restored from cached data

### Mobile Touch Handling
- **Long Press**: Increases tool intensity (2x strength)
- **Double Tap**: Triggers smooth tool burst
- **Pinch Gestures**: Can trigger inflate tool
- **Haptic Feedback**: `triggerHaptic('light'|'medium'|'heavy')`

## Important Notes

### Performance Considerations
- **Geometry Updates**: Only call `positions.needsUpdate = true` and `computeVertexNormals()` when vertices actually change
- **RAF Batching**: Pointer events are batched with `requestAnimationFrame` to maintain 60fps
- **Mobile Performance**: App automatically reduces quality on lower-end devices

### Mobile-First Design
- **Touch Targets**: Minimum 48px touch targets for mobile
- **Safe Areas**: CSS handles device notches with `env(safe-area-inset-*)`
- **Viewport**: Uses `-webkit-fill-available` for proper mobile height

### Capacitor Integration
- **Plugins Used**: Device, Haptics, StatusBar
- **Native Build**: `dist/` folder is synced to `android/` and `ios/` projects
- **Live Reload**: Requires port forwarding with `adb reverse` for Android

### State Management
- **Local State**: React `useState` for UI interactions
- **Persistent State**: localStorage via service classes
- **3D State**: Direct three.js object manipulation with React refs

## Testing Strategy
- **Manual Testing**: Run `npm run dev` and test core sculpting functionality
- **No Unit Tests**: Project lacks test scripts - consider manual smoke tests
- **Device Testing**: Test on both desktop and mobile devices for touch interactions

## Common Workflows

### Adding a New Sculpting Tool
1. Add tool name to type union in `AdvancedClayStudio.tsx`
2. Add tool button and icon in `ToolPanel.tsx` and `MobileNavigation.tsx`
3. Implement deformation logic in `ClayObject.tsx` switch statement
4. Test with different tool strength and size settings

### Modifying Project Structure
1. Update types in `src/types/project.ts`
2. Modify serialization in `src/services/projectManager.ts`
3. Update geometry caching in `src/hooks/useGeometryCache.ts`
4. Ensure export compatibility in `src/services/stlExporter.ts`

### Debugging 3D Issues
- Check console for three.js warnings
- Verify `positions.needsUpdate = true` is called after vertex modifications
- Ensure `computeVertexNormals()` is called for proper lighting
- Use React Developer Tools to inspect geometry refs