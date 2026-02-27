# Active Context: RETRONET DOS Terminal Website

## Current State

**Project Status**: ✅ DOS-like terminal experience implemented

The site is a fully functional DOS/BBS-style terminal web experience with CRT effects, a command parser, retro sounds, and navigable page hierarchy.

## Recently Completed

- [x] Base Next.js 16 setup with App Router
- [x] TypeScript configuration with strict mode
- [x] Tailwind CSS 4 integration
- [x] ESLint configuration
- [x] Memory bank documentation
- [x] Recipe system for common features
- [x] DOS-like terminal UI (`src/components/Terminal.tsx`)
- [x] CRT scanline + vignette + flicker effects (`src/app/globals.css`)
- [x] Web Audio API retro sound engine (`src/lib/sounds.ts`)
- [x] Site content hierarchy with 5 top-level sections (`src/lib/siteContent.ts`)
- [x] Command parser: HELP, DIR, CD, VIEW, BACK, CLS, VER, DATE, ECHO, EXIT
- [x] Boot sequence animation with progressive text reveal
- [x] Command history (UP/DOWN arrows)
- [x] TAB autocomplete for commands and section names
- [x] Green-on-black phosphor glow text styling

## Current Structure

| File/Directory | Purpose | Status |
|----------------|---------|--------|
| `src/app/page.tsx` | Renders Terminal component | ✅ Done |
| `src/app/layout.tsx` | Root layout (black bg, no fonts) | ✅ Done |
| `src/app/globals.css` | CRT effects, DOS styling | ✅ Done |
| `src/components/Terminal.tsx` | Main terminal UI + command parser | ✅ Done |
| `src/lib/sounds.ts` | Web Audio API retro sound engine | ✅ Done |
| `src/lib/siteContent.ts` | Page hierarchy data (5 sections) | ✅ Done |
| `.kilocode/` | AI context & recipes | ✅ Ready |

## Site Sections (navigable via CD command)

- `HOME` — Welcome screen (shown on boot)
- `ABOUT` — About the system
  - `ABOUT/HISTORY` — System history
  - `ABOUT/TEAM` — Development team
- `SERVICES` — Available services
  - `SERVICES/EMAIL` — Email inbox
  - `SERVICES/BULLETIN` — Bulletin board
  - `SERVICES/FILES` — File library
- `PORTFOLIO` — Project showcase
- `CONTACT` — Contact information

## Sound Effects

| Sound | Trigger |
|-------|---------|
| Key click | Any character typed |
| Backspace | Backspace key |
| Enter/confirm | Enter key |
| Error buzz | Unknown command |
| Select blip | Navigation commands |
| Page load arpeggio | CD into a section |
| Boot sequence | On first load |
| Tab blip | TAB autocomplete |

## Current Focus

The DOS terminal experience is complete. Possible next steps:
1. Add more content sections
2. Add Easter eggs / hidden commands
3. Add ANSI art to pages

## Quick Start Guide

### To add a new page:

Create a file at `src/app/[route]/page.tsx`:
```tsx
export default function NewPage() {
  return <div>New page content</div>;
}
```

### To add components:

Create `src/components/` directory and add components:
```tsx
// src/components/ui/Button.tsx
export function Button({ children }: { children: React.ReactNode }) {
  return <button className="px-4 py-2 bg-blue-600 text-white rounded">{children}</button>;
}
```

### To add a database:

Follow `.kilocode/recipes/add-database.md`

### To add API routes:

Create `src/app/api/[route]/route.ts`:
```tsx
import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({ message: "Hello" });
}
```

## Available Recipes

| Recipe | File | Use Case |
|--------|------|----------|
| Add Database | `.kilocode/recipes/add-database.md` | Data persistence with Drizzle + SQLite |

## Pending Improvements

- [ ] Add more recipes (auth, email, etc.)
- [ ] Add example components
- [ ] Add testing setup recipe

## Session History

| Date | Changes |
|------|---------|
| Initial | Template created with base setup |
