---
name: Bug report
about: Create a report to help us debug an issue with the app or native builds
title: ''
labels: bug
assignees: ''
---

**Describe the bug**
A clear and concise description of what the bug is.

**To reproduce**
Steps to reproduce the behavior:
1. Start with a fresh `npm i` and `npm run dev`
2. Navigate to `http://localhost:8080` (or the dev-server host)
3. Open the Clay Studio
4. Describe the interaction that produced the bug (e.g., "Use push tool and drag rapidly")

**Expected behavior**
What you expected to happen.

**Screenshots / Console**
If applicable, add screenshots or copy/paste relevant console errors.

**Environment (please complete the following information):**
- OS: (e.g. Windows 11, macOS Ventura)
- Browser: (e.g. Chrome 120)
- Node version: (e.g. 18.x)
- App version / commit: (if known)

**Native details (if applicable)**
- Platform: Android / iOS
- Steps taken: `npm run build` -> `npx cap sync` -> `npx cap run android`
- If using device dev-server, note whether `capacitor.config.ts` has `server.url` set or whether `adb reverse` was used.

**Additional context**
Any other context about the problem.

Link to contribution & PR guidance: see `.github/pull_request_template.md` and `.github/copilot-instructions.md`.
