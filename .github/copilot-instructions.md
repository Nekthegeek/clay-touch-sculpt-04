<!-- Copied/Generated: Project-specific guidance for AI coding agents -->
# Guidance for AI coding agents — clay-touch-sculpt-04

This file contains concise, actionable instructions to help an AI coding agent be immediately productive in this repository. Keep suggestions small, well-scoped, and tied to the code locations referenced below.

1. Big picture
   - This is a Vite + React + TypeScript app using Tailwind and shadcn-ui (see `package.json`).
   - Core client live app entry: `src/main.tsx` -> `src/App.tsx` -> `src/pages/Index.tsx`.
   - The interactive 3D sculpting UI lives under `src/components/` (notably `ClayStudio.tsx`, `ToolPanel.tsx`, `TopBar.tsx`). `ClayStudio.tsx` is the place to look for react-three-fiber + three.js logic and interactive mesh deformation patterns.
   - Local project persistence and import/export is handled by `src/services/projectManager.ts` (uses localStorage; keep this in mind for stateful changes and tests).

2. Build / dev / run commands
   - Development server: `npm run dev` (runs `vite`, host set in `vite.config.ts` to `::`, port 8080).
   - Production build: `npm run build` and preview with `npm run preview`.
   - Linting: `npm run lint` (uses ESLint config in repo root).

3. Patterns & conventions to follow
   - Route structure: routing is in `src/App.tsx` using `react-router-dom`. Add new routes in `Routes` and ensure custom routes are placed above the catch-all `*` route.
   - Component alias: `@` maps to `./src` (see `vite.config.ts`). Import with `@/components/...` or `@/services/...`.
   - State persistence: projects are saved in browser `localStorage` by `projectManager`. Any feature that modifies projects should call `projectManager.saveProject(...)` to remain consistent with existing UX (toasts are used for user feedback).
   - 3D interactions: `ClayStudio.tsx` uses `@react-three/fiber`, `three`, and `drei` helpers. Mesh deformation directly manipulates BufferGeometry attributes and calls `attributes.position.needsUpdate = true` and `geometry.computeVertexNormals()` — preserve this pattern when adding geometry changes to avoid visual glitches.
   - UI components: shadcn-style UI primitives live in `src/components/ui/*`. Reuse these for consistent styling and to avoid duplicating design tokens.

4. Integration points & external dependencies
   - Capacitor: `@capacitor/*` packages present; repository includes `android/` and `ios/` folders for native builds. Native platform work may require Capacitor CLI usage (e.g., `npx cap sync`, `npx cap open android`). These flows are out-of-scope for quick web-focused edits but note their existence.
      - Capacitor server: `capacitor.config.ts` sets a hosted `server.url` (a Lovable preview URL) and `cleartext: true`. When running in native shells, Capacitor may point the webview to that URL instead of the local dev server. Check `capacitor.config.ts` before changing dev-server flow.

   5. Capacitor / native quick notes
      - To sync web assets to native projects after a build:
         - Build web: `npm run build` (output goes to `dist` per `capacitor.config.ts`).
         - Sync to native: `npx cap sync` (copies `dist` into Android/iOS projects).
         - Open Android Studio: `npx cap open android` or Xcode: `npx cap open ios` for native debugging.
      - For local native development you may want to remove or override `server.url` in `capacitor.config.ts` so the native webview uses the device's dev server (or use `npx cap run android -l --external` with a properly reachable host).
      - Android/iOS manifests include the Internet permission and standard Capacitor entries. Typical gotchas: ensure device/emulator can reach your dev host (firewalls, different subnets) when using `server.url` or live-sync.

      Run on device (Windows PowerShell) — quick recipe
         - Build web and sync to native when doing a full install:

      ```powershell
      # Install deps (once)
      npm i

      # Build web assets
      npm run build

      # Copy web assets into native projects
      npx cap sync

      # Open native IDE (optional)
      npx cap open android
      # or
      npx cap open ios
      ```

         - Live-reload during Android development (device or emulator) using a local dev server:

      ```powershell
      # Start Vite dev server (make sure firewall allows incoming connections)
      npm run dev

      # On a physical device connected via USB, forward device port to localhost (adb must be in PATH):
      # For Vite default port 8080
      adb reverse tcp:8080 tcp:8080

      # Then run the app in Android (this will pick up localhost:8080)
      npx cap run android
      ```

         - Note: Because `capacitor.config.ts` currently sets `server.url` to a hosted preview URL, native builds may load that remote URL instead of your local dev server. To use a local dev server while running on a device, either:
            - Temporarily remove or comment out `server.url` from `capacitor.config.ts`, or
            - Use `npx cap run android -l --external` and ensure your machine's IP is reachable by the device (update host in `vite` server or use `--host`), or
            - Keep `server.url` but manually open the app and use debugging tools in Android Studio/Xcode.

         - Common pitfalls:
            - Windows firewall blocking dev-server inbound connections — allow `node`/`vite` or open port 8080.
            - `adb reverse` only works with Android; for iOS you'll usually need an emulator on the same machine or a tunnel.
   - Three.js and react-three-fiber: heavy CPU/GPU code lives in components under `src/components/*` — be cautious with frequent re-renders and large BufferGeometry operations.
   - React Query: `@tanstack/react-query` is used for async data flows across the app—look for QueryClientProvider in `src/App.tsx`.

5. Tests & quality gates
   - There are no test scripts in `package.json`. For small changes, prefer manual smoke tests: run `npm run dev`, interact with `ClayStudio` (sculpt, save, export/import) and check console for errors.
   - Run `npm run lint` to catch style/type issues; TypeScript compiler is enforced via `tsconfig` but there is no explicit `npm run typecheck` script — consider adding one for larger changes.

6. Editing guidance & examples (concrete)
   - To add a new tool (e.g., 'stamp') to the sculpt UI:
     - Add the tool option in `ClayStudio.tsx` type union for `currentTool` and update `ToolPanel.tsx` to surface the tool button.
     - Implement the deformation in `ClayBall`'s `handlePointerMove` — follow existing pattern for calculating `intersects`, modifying `positions` and setting `positions.needsUpdate = true` and `geometry.computeVertexNormals()`.
   - To persist additional metadata with projects:
     - Update `types/project.ts` to add fields.
     - Update `src/services/projectManager.ts` to include/read the new fields when creating, saving, and importing projects.

7. What to avoid
   - Avoid unbounded BufferGeometry updates on every frame; batch updates and set `needsUpdate` only when vertices change.
   - Avoid direct DOM / document-dependent code in components that may be server-rendered. This is a client-only app, but prefer React lifecycles and effects for DOM interactions.

8. Where to look for more context
   - High-level README: `README.md` (project scaffold and lovably-generated notes).
   - Vite config and aliases: `vite.config.ts`.
   - Capacitor native integration: `android/`, `ios/` folders and `capacitor.config.ts`.

If anything in this file is unclear or you'd like more examples (routing, adding a new react-three tool, or native-capacitor flows), tell me which area to expand and I will iterate.
