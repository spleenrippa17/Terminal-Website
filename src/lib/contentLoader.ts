/**
 * Client-side helper to fetch page content from the API route.
 * The terminal component calls this when it needs to display a page.
 */

export interface PageContent {
  content: string[];
  image?: {
    src: string;
    alt: string;
    caption?: string;
  };
}

/**
 * Fetch content for a given page id (e.g. "about", "about/history").
 * Returns null if the page is not found or an error occurs.
 */
export async function loadPageContent(id: string): Promise<PageContent | null> {
  try {
    const res = await fetch(`/api/content/${id}`);
    if (!res.ok) return null;
    const data = (await res.json()) as PageContent;
    return data;
  } catch {
    return null;
  }
}
