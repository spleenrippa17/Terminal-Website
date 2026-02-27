import { NextRequest, NextResponse } from "next/server";
import { readFile } from "fs/promises";
import path from "path";
import matter from "gray-matter";

export interface ContentResponse {
  content: string[];
  image?: {
    src: string;
    alt: string;
    caption?: string;
  };
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string[] }> }
) {
  const { slug } = await params;

  // Build the file path: src/content/<slug>.md
  // e.g. slug = ["about", "history"] → src/content/about/history.md
  const contentDir = path.join(process.cwd(), "src", "content");
  const filePath = path.join(contentDir, ...slug) + ".md";

  // Security: ensure the resolved path is still inside contentDir
  const resolved = path.resolve(filePath);
  if (!resolved.startsWith(path.resolve(contentDir))) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  let raw: string;
  try {
    raw = await readFile(resolved, "utf-8");
  } catch {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const { data, content } = matter(raw);

  // Split body into lines, preserving blank lines
  const lines = content
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n")
    // Remove leading/trailing blank lines from the whole block
    .replace(/^\n+/, "")
    .replace(/\n+$/, "")
    .split("\n");

  const response: ContentResponse = { content: lines };

  // Optional image from frontmatter
  if (data.image_src) {
    response.image = {
      src: data.image_src as string,
      alt: (data.image_alt as string) ?? "",
      caption: data.image_caption as string | undefined,
    };
  }

  return NextResponse.json(response);
}
