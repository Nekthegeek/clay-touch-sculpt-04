<!-- Expanded PR template for clay-touch-sculpt-04 -->
# Pull Request

Short summary (one or two sentences):

Background / motivation (why this change is needed):

## Change type
- [ ] Bugfix
- [ ] Feature
- [ ] Refactor
- [ ] Chore / tooling

## Files changed
- List key files changed (top-level):

## Checklist — quick local verification
- [ ] Code compiles / typechecks (TypeScript)
- [ ] Dev server runs locally: `npm run dev` (no console errors)
- [ ] Linting: `npm run lint` (or explain why skipped)

## Testing — perform these manual checks (describe results)

Web (required)
- Start dev server: `npm run dev`
- Open the app and visit `/`
- Open the Clay Studio and verify:
  - You can rotate the model with mouse/touch
  - The primary sculpt tools (push/pull/smooth) apply visible deformation
  - Saving a project via UI updates `localStorage` (check DevTools Application -> Local Storage)
  - Exported JSON downloads and contains `objects` array

Native / Mobile (if applicable)
- If touching native code, note platform tested (Android/iOS)
- Run `npm run build` then `npx cap sync`
- For Android live-reload during dev: ensure `adb` available and run `adb reverse tcp:8080 tcp:8080` before `npx cap run android`

## three.js / performance checklist (when changing geometry or render loop)
- [ ] Avoid setting BufferGeometry attributes on every frame; update only when vertices change and set `positions.needsUpdate = true`
- [ ] Call `geometry.computeVertexNormals()` after vertex updates
- [ ] Keep subdivision / segments reasonable (large `SphereGeometry` segments can slow rendering)
- [ ] Check for excessive re-renders (use refs or memoization to avoid re-creating geometries on render)

## Accessibility & UX
- [ ] Keyboard navigation unchanged / updated where applicable
- [ ] Any new UI follows design tokens in `src/components/ui/*`

## Reviewer notes
- Anything the reviewer should pay special attention to (e.g., approximations, temporary debug code left in, known limitations):

Link to project guidance: see `.github/copilot-instructions.md` for architecture, Capacitor notes, and dev workflows.

If this PR touches native/mobile files, include platform tested (Android/iOS), whether `npx cap sync` was run, and any device-specific notes.

## How to run (quick commands)

Web (development)
```powershell
# Install deps (once)
npm i

# Start dev server (Vite)
npm run dev
```

Web (build & preview)
```powershell
# Build production assets
npm run build

# Preview the built site locally
npm run preview
```

Native (Capacitor) — full build and open native IDE
```powershell
# Build web assets
npm run build

# Copy web to native projects
npx cap sync

# Open native IDE (Android Studio / Xcode)
npx cap open android
# or
npx cap open ios
```

Notes:
- `vite.config.ts` sets the dev server host to `::` and port `8080` by default — change with `--host` or by editing the config if needed.
- `capacitor.config.ts` may contain `server.url` (a hosted preview). If you want the native webview to point to your local dev server, remove/comment `server.url` or use `npx cap run android -l --external` and ensure your machine is reachable from the device.
