import { NextRequest, NextResponse } from "next/server";
import { ensureDatabaseSchema, checkDuplicates, addGameToNotion } from "@/lib/notion";
import { getGameDetails } from "@/lib/rawg";
import type { AddGamesResponse } from "@/lib/types";

export async function POST(request: NextRequest) {
  try {
    const { gameIds } = await request.json();

    if (!Array.isArray(gameIds) || gameIds.length === 0) {
      return NextResponse.json(
        { error: "gameIds must be a non-empty array." },
        { status: 400 }
      );
    }

    await ensureDatabaseSchema();

    const existingIds = await checkDuplicates(gameIds);

    const result: AddGamesResponse = {
      added: [],
      duplicates: [],
      errors: [],
    };

    for (const gameId of gameIds) {
      if (existingIds.has(gameId)) {
        // We don't have the name yet for duplicates, fetch minimally
        try {
          const details = await getGameDetails(gameId);
          result.duplicates.push({ id: gameId, name: details.name });
        } catch {
          result.duplicates.push({ id: gameId, name: `Game #${gameId}` });
        }
        continue;
      }

      try {
        const details = await getGameDetails(gameId);
        await addGameToNotion(details);
        result.added.push({ id: gameId, name: details.name });
      } catch (error) {
        console.error(`Failed to add game ${gameId}:`, error);
        result.errors.push({
          id: gameId,
          name: `Game #${gameId}`,
          error: "Failed to add to Notion.",
        });
      }

      // Small delay between additions to respect Notion rate limits (3 req/sec)
      if (gameIds.indexOf(gameId) < gameIds.length - 1) {
        await new Promise((resolve) => setTimeout(resolve, 350));
      }
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error("Notion route error:", error);
    return NextResponse.json(
      { error: "Failed to process games." },
      { status: 500 }
    );
  }
}
