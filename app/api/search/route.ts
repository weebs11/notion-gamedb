import { NextRequest, NextResponse } from "next/server";
import { searchGames } from "@/lib/rawg";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;

    const params = {
      search: searchParams.get("search") || undefined,
      platforms: searchParams.get("platforms") || undefined,
      genres: searchParams.get("genres") || undefined,
      dates: searchParams.get("dates") || undefined,
      ordering: searchParams.get("ordering") || undefined,
      page: searchParams.get("page") || undefined,
      page_size: searchParams.get("page_size") || "20",
    };

    const data = await searchGames(params);

    // Strip background_image from results to keep responses lean
    const results = data.results.map(({ id, slug, name, released, rating, metacritic, platforms, genres }) => ({
      id,
      slug,
      name,
      released,
      rating,
      metacritic,
      platforms,
      genres,
    }));

    return NextResponse.json({
      count: data.count,
      next: data.next ? true : null,
      previous: data.previous ? true : null,
      results,
    });
  } catch (error) {
    console.error("Search error:", error);
    const message =
      error instanceof Error && error.message.includes("429")
        ? "Too many requests. Please wait a moment and try again."
        : "Game search failed. Please try again.";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
