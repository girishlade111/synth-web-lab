# Synth Web Lab

An AI-powered web IDE that runs entirely in the browser: describe what you want, and it generates working HTML/CSS/JS with a live preview, Monaco code editor, file manager, console, terminal, and one-click export. Originally generated with Lovable.

## What it does

Synth Web Lab is a client-side "AI code lab" — a mini Lovable/Bolt-style studio:

- Type a prompt → the AI service generates web code (HTML/CSS/JS) with streaming progress
- Edit the generated code in a full Monaco editor (VS Code's editor in the browser)
- See changes instantly in a sandboxed live preview pane
- Manage multiple files with a file explorer, create/rename/delete files
- Built-in console and terminal panels for output and commands
- Version history of generated code (code versions hook)
- Export your project (download the files) via the export utilities
- Dark/light theme toggle

## Features

- AI code generation with progress streaming (`aiService`)
- Monaco editor with syntax highlighting and IntelliSense-style completions
- Live preview rendered in an isolated iframe
- Resizable panel layout (editor / preview / console / prompt)
- File manager with multi-file project support
- Code version history — restore earlier generations
- Console + terminal panels for runtime output
- Export project files to disk
- About and 404 pages; react-router navigation
- shadcn/ui component library + Tailwind styling

## Tech stack

- Vite + React 18 + TypeScript
- Monaco Editor (`@monaco-editor/react`)
- Tailwind CSS + shadcn/ui (Radix UI primitives)
- react-router-dom, react-resizable-panels, TanStack Query
- Lucide icons, Framer Motion
- npm

## Quick start

```bash
npm install
npm run dev      # http://localhost:8080
```

Production build:

```bash
npm run build     # emits ./dist
npm run preview   # serve the production build locally
```

## Project structure

```
src/
  App.tsx                 # router (/, /about, 404)
  pages/Index.tsx         # main IDE page
  pages/AboutUs.tsx
  components/
    AIWebIDE.tsx          # main IDE shell (panels, tabs)
    MonacoEditor.tsx      # code editor wrapper
    LivePreview.tsx       # sandboxed iframe preview
    PromptPanel.tsx       # AI prompt input
    FileManager.tsx       # file explorer
    Console.tsx / Terminal.tsx
    ExportUtils.tsx       # project export
    AISuggestionButton.tsx, ThemeToggle.tsx, ...
    ui/                   # shadcn/ui components
  services/aiService.ts   # AI generation service
  hooks/                  # useCodeVersions, useFileManager, ...
public/                   # static assets
```

## Environment variables

The AI generation features call an AI backend — check `src/services/aiService.ts` for the API key / endpoint it expects (e.g. an API key stored in local storage or a `.env` variable). The editor/preview itself works fully offline with no keys.

## Deployment

Fully static — `dist/` can be served anywhere:

- GitHub Pages: build with `vite.config.ts` `base: '/synth-web-lab/'`, then push `dist/` to the `gh-pages` branch → `https://girishlade111.github.io/synth-web-lab/`
- Vercel / Netlify / Cloudflare Pages: connect the repo (`npm run build`, publish `dist`)

Note: `vite.config.ts` sets `base: '/synth-web-lab/'` and the router uses `import.meta.env.BASE_URL` as basename so the app works under the GitHub Pages subpath. Remove/revert both when deploying to a root domain.

## License

MIT — free to use and adapt.

---

Built by Girish Lade · [ladestack.in](https://ladestack.in)
