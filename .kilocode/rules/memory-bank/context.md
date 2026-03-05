# Active Context: RETRONET DOS Terminal Website

## Current State

**Project Status**: ✅ CORE terminal — Enhanced CRT effects implemented

The site is a fully functional CORE (Corporate Operations Resource Engine) terminal experience themed after the Alien/Aliens films. Features CRT effects, a command parser, retro sounds, and navigable page hierarchy set in the year 2303.

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
- [x] **Refactor: content migrated from inline siteContent.ts to individual .md files**
  - `src/content/<id>.md` — one file per page, plain text + YAML frontmatter
  - `src/app/api/content/[...slug]/route.ts` — server-side API reads files with gray-matter
  - `src/lib/contentLoader.ts` — client fetch helper
  - `src/lib/siteContent.ts` now navigation-only (NavPage interface, no content arrays)
  - `src/components/Terminal.tsx` showPage() is now async, fetches on demand
- [x] **Audio file playback support**
  - `src/lib/audioPlayer.ts` — HTML5 Audio API wrapper for MP3/OGG playback
  - `NavPage` interface extended with optional `audio` field for audio entries
  - `PLAY <filename>` command to play audio files in current directory
  - `STOP` command to halt playback
  - Audio files appear in DIR listings with `[AUDIO]` marker
  - Sample entries: `BRIEFING.AU` (missions), `DISTRESS.AU` (science), `STATIC.AU` (comms)

## Current Structure

| File/Directory | Purpose | Status |
|----------------|---------|--------|
| `src/app/page.tsx` | Renders Terminal component | ✅ Done |
| `src/app/layout.tsx` | Root layout (black bg, no fonts) | ✅ Done |
| `src/app/globals.css` | CRT effects, DOS styling | ✅ Done |
| `src/app/api/content/[...slug]/route.ts` | Server API: reads .md files, returns content JSON | ✅ Done |
| `src/components/Terminal.tsx` | Main terminal UI + async command parser | ✅ Done |
| `src/lib/sounds.ts` | Web Audio API retro sound engine | ✅ Done |
| `src/lib/siteContent.ts` | Navigation index only (NavPage, no content) | ✅ Done |
| `src/lib/contentLoader.ts` | Client-side fetch helper for page content | ✅ Done |
| `src/content/*.md` | Individual page content files (9 pages) | ✅ Done |
| `.kilocode/` | AI context & recipes | ✅ Ready |

## Site Sections (navigable via CD command)

- `HOME` — Welcome screen (shown on boot)
- `ABOUT` — About the system
  - `ABOUT/HISTORY` — System history
  - `ABOUT/CREW` — Personnel manifest
- `MISSIONS` — Active mission directives
  - `MISSIONS/SURVEY` — Planetary survey operations
  - `MISSIONS/RETRIEVAL` — Asset retrieval protocols
  - `MISSIONS/ORDERS` — Special Orders — restricted
  - `MISSIONS/BRIEFING.AU` — Pre-mission audio briefing [AUDIO]
- `SCIENCE` — Science division records
  - `SCIENCE/DISTRESS.AU` — Recovered distress signal [AUDIO]
- `COMMS` — Communications and uplink
  - `COMMS/STATIC.AU` — Deep space interference [AUDIO]‌

## Available Commands

| Command | Description |
|---------|-------------|
| `HELP` | Show available commands |
| `DIR` | List items in current directory (shows [AUDIO] for audio files) |
| `CD <name>` | Navigate into a section |
| `CD ..` | Go up one level |
| `CD /` | Return to root |
| `VIEW` | View current page content |
| `BACK` | Go back to previous location |
| `CLS` | Clear the screen |
| `VER` | Show system version |
| `DATE` | Show current stardate/time |
| `ECHO <text>` | Print text to screen |
| `PLAY <file>` | Play audio file (e.g., `PLAY BRIEFING.AU`) |
| `STOP` | Stop playing audio |
| `EXIT` | Terminate session |‌

## Adding Audio Files

To add a new audio file to any section:

1. Add the MP3/OGG file to the `public/audio/` directory
2. Add an entry to `src/lib/siteContent.ts` in the appropriate section's `children` array:
   ```typescript
   {
     id: "section/filename",
     title: "FILENAME.AU",
     shortDesc: "Description of the audio",
     audio: "/audio/your-file.mp3",
   }
   ```
3. The file will appear in DIR listings with `[AUDIO]` marker
4. Users can play it with `PLAY FILENAME.AU`

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
