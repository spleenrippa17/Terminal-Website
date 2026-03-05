/**
 * Site navigation index for the CORE terminal.
 * Corporate Operations Resource Engine — Weyland-Yutani Corporation
 *
 * This file defines the navigation tree ONLY — titles, descriptions, and
 * hierarchy. Actual page content lives in src/content/<id>.md files and
 * is loaded on demand via the /api/content/[...slug] API route.
 *
 * To add a new page:
 *   1. Add an entry here (with optional children array for sub-pages)
 *   2. Create src/content/<id>.md with frontmatter + body text
 */

export interface NavPage {
  /** Unique path id, e.g. "about" or "about/history" */
  id: string;
  /** Display title shown in DIR listings and prompts */
  title: string;
  /** One-line description shown in DIR listings */
  shortDesc: string;
  /** Child pages navigable via CD */
  children?: NavPage[];
  /** Optional audio file path for audio entries */
  audio?: string;
}

export const siteTree: NavPage[] = [
  {
    id: "home",
    title: "HOME",
    shortDesc: "System welcome screen",
  },
  {
    id: "about",
    title: "ABOUT",
    shortDesc: "About the CORE system",
    children: [
      {
        id: "about/history",
        title: "HISTORY",
        shortDesc: "CORE system history",
      },
      {
        id: "about/crew",
        title: "CREW",
        shortDesc: "Personnel manifest",
      },
    ],
  },
  {
    id: "missions",
    title: "MISSIONS",
    shortDesc: "Active mission directives",
    children: [
      {
        id: "missions/survey",
        title: "SURVEY",
        shortDesc: "Planetary survey operations",
      },
      {
        id: "missions/retrieval",
        title: "RETRIEVAL",
        shortDesc: "Asset retrieval protocols",
      },
      {
        id: "missions/orders",
        title: "ORDERS",
        shortDesc: "Special Orders — restricted",
      },
      {
        id: "missions/briefing",
        title: "BRIEFING.AU",
        shortDesc: "Pre-mission audio briefing",
        audio: "/audio/mission-briefing.mp3",
      },
    ],
  },
  {
    id: "science",
    title: "SCIENCE",
    shortDesc: "Science division records",
    children: [
      {
        id: "science/distress",
        title: "DISTRESS.AU",
        shortDesc: "Recovered distress signal",
        audio: "/audio/distress-signal.mp3",
      },
    ],
  },
  {
    id: "comms",
    title: "COMMS",
    shortDesc: "Communications and uplink",
    children: [
      {
        id: "comms/static",
        title: "STATIC.AU",
        shortDesc: "Deep space interference",
        audio: "/audio/space-static.mp3",
      },
    ],
  },
];

/** Flatten the tree into a map for quick lookup */
export function buildPageMap(pages: NavPage[]): Map<string, NavPage> {
  const map = new Map<string, NavPage>();
  function traverse(page: NavPage) {
    map.set(page.id, page);
    if (page.children) {
      page.children.forEach(traverse);
    }
  }
  pages.forEach(traverse);
  return map;
}

/** Get all direct children of a given path */
export function getChildren(path: string, pages: NavPage[]): NavPage[] {
  if (path === "" || path === "/") {
    return pages;
  }
  const map = buildPageMap(pages);
  const page = map.get(path);
  return page?.children ?? [];
}

/** Get parent path */
export function getParentPath(path: string): string {
  const parts = path.split("/");
  if (parts.length <= 1) return "";
  parts.pop();
  return parts.join("/");
}
