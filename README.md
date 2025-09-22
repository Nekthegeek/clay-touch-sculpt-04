# ClayPlay 3D

ClayPlay 3D is a **mobile-first Progressive Web App (PWA)** that lets hobbyists and makers finger-sculpt a virtual lump of clay and export their creations to `.STL` for 3D printing. It’s designed to feel **playful, tactile, and simple** on phones and tablets.

---

## ✨ Features

- 🎨 **Clay Studio**: Push, pull, smooth, and pinch a virtual clay sphere using touch gestures.
- ↩️ **Undo/Redo** support.
- 💾 **Save & Load**: Store sculpts locally in the browser (via IndexedDB).
- 📤 **Export to STL**: One-tap download of a 3D-printable file.
- 📱 **Mobile-first PWA**: Install to homescreen and work offline.
- 🧑‍🏫 **Onboarding overlay**: Quick tutorial on first run.

---

## 🛠️ Tech Stack

- **Frontend**: [Vite](https://vitejs.dev/), [React](https://react.dev/), [TypeScript](https://www.typescriptlang.org/)
- **UI**: [Tailwind CSS](https://tailwindcss.com/), [shadcn/ui](https://ui.shadcn.com/)
- **3D Engine**: [Three.js](https://threejs.org/) + [three-stdlib](https://github.com/pmndrs/three-stdlib)
- **State**: [Zustand](https://zustand-demo.pmnd.rs/)
- **Storage**: [localForage](https://github.com/localForage/localForage) (for local saves)
- **Optional Backend**: [Supabase](https://supabase.com/) for cloud saves and auth

---

## 🚀 Getting Started

### Prerequisites
- Node.js 20+
- npm

### Installation
```bash
git clone https://github.com/your-username/clayplay-3d.git
cd clayplay-3d
npm install