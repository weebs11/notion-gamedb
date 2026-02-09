import { NextRequest, NextResponse } from "next/server";
import { searchGames } from "@/lib/rawg";

const RAWG_PAGE_SIZE = 40;
const PAGES_PER_REQUEST = 3; // 40 + 40 + 20 = 100 results per user-page

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;

    const platform = searchParams.get("platform");
    if (!platform) {
      return NextResponse.json(
        { error: "Platform is required" },
        { status: 400 }
      );
    }

    const genres = searchParams.get("genres") || undefined;
    const dates = searchParams.get("dates") || undefined;
    const ordering = searchParams.get("ordering") || undefined;
    const userPage = parseInt(searchParams.get("page") || "1", 10);

    // Translate user-page to RAWG pages:
    // User page 1 → RAWG pages 1,2,3 (40+40+20)
    // User page 2 → RAWG pages 4,5,6 (40+40+20)
    const rawgPageStart = (userPage - 1) * PAGES_PER_REQUEST + 1;

    const allResults: Array<{
      id: number;
      slug: string;
      name: string;
      released: string | null;
      rating: number;
      metacritic: number | null;
      platforms: Array<{ platform: { id: number; name: string } }> | null;
      genres: Array<{ id: number; name: string; slug: string }> | null;
    }> = [];

    let totalCount = 0;

    // Fetch 3 RAWG pages sequentially (to respect rate limits)
    for (let i = 0; i < PAGES_PER_REQUEST; i++) {
      const rawgPage = rawgPageStart + i;
      const pageSize = i < 2 ? RAWG_PAGE_SIZE : 20; // 40 + 40 + 20 = 100

      const data = await searchGames({
        platforms: platform,
        genres,
        dates,
        ordering,
        page: String(rawgPage),
        page_size: String(pageSize),
      });

      totalCount = data.count;

      // Strip background_image to keep responses lean
      const stripped = data.results.map(
        ({ id, slug, name, released, rating, metacritic, platforms, genres }) => ({
          id,
          slug,
          name,
          released,
          rating,
          metacritic,
          platforms,
          genres,
        })
      );

      allResults.push(...stripped);

      // If no more results, stop fetching
      if (!data.next) break;
    }

    // Deduplicate — RAWG can return the same game across pages
    const seen = new Set<number>();
    const uniqueResults = allResults.filter((g) => {
      if (seen.has(g.id)) return false;
      seen.add(g.id);
      return true;
    });

    const USER_PAGE_SIZE = 100;
    const totalUserPages = Math.ceil(totalCount / USER_PAGE_SIZE);

    return NextResponse.json({
      count: totalCount,
      results: uniqueResults,
      hasNext: userPage < totalUserPages,
      hasPrevious: userPage > 1,
    });
  } catch (error) {
    console.error("Browse error:", error);
    const message =
      error instanceof Error && error.message.includes("429")
        ? "Too many requests. Please wait a moment and try again."
        : "Failed to load games. Please try again.";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
