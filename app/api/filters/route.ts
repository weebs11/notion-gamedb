import { NextResponse } from "next/server";
import { fetchPlatforms, fetchGenres } from "@/lib/rawg";

export async function GET() {
  try {
    const [platforms, genres] = await Promise.all([
      fetchPlatforms(),
      fetchGenres(),
    ]);

    return NextResponse.json({ platforms, genres });
  } catch (error) {
    console.error("Filters error:", error);
    return NextResponse.json(
      { error: "Failed to load filter options." },
      { status: 502 }
    );
  }
}
