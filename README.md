# CyberSim — Cybersecurity Decision Simulator

CyberSim is a native Electron desktop application for offline cybersecurity decision training. It combines an Electron 28 shell, a React 18 + Vite renderer, Zustand state, local SQLite persistence through `better-sqlite3`, and IPC-only data operations.

## Stack

- Electron 28
- React 18 + Vite
- Tailwind CSS + custom CSS
- Zustand
- SQLite via `better-sqlite3`
- Recharts
- React Router v6 with `HashRouter`
- Lucide React
- Framer Motion
- electron-builder

## Getting Started

1. Install dependencies:

```bash
npm install
```

2. Start the desktop app in development:

```bash
npm run dev
```

3. Build the renderer bundle:

```bash
npm run build
```

4. Package native installers:

```bash
npm run dist
```

Platform-specific packaging:

```bash
npm run dist:win
npm run dist:mac
npm run dist:linux
```

## Notes

- The SQLite database is created in the Electron `userData` directory as `cybersim.db`.
- All database operations are handled in the Electron main process through IPC.
- Local fonts are copied into `src/assets/fonts` during `npm install` by the `postinstall` script.
- The app is designed to run fully offline after dependencies are installed.
