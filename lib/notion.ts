import { Client } from "@notionhq/client";
import type { RawgGameDetail } from "./types";

function getNotionClient(): Client {
  const token = process.env.NOTION_API_KEY;
  if (!token) throw new Error("NOTION_API_KEY is not set");
  return new Client({ auth: token });
}

function getDatabaseId(): string {
  const id = process.env.NOTION_DATABASE_ID;
  if (!id) throw new Error("NOTION_DATABASE_ID is not set");
  return id;
}

export async function checkDuplicates(
  rawgIds: number[]
): Promise<Set<number>> {
  const notion = getNotionClient();
  const databaseId = getDatabaseId();
  const existingIds = new Set<number>();

  // Notion compound filter limit is 100; chunk if needed
  const chunks: number[][] = [];
  for (let i = 0; i < rawgIds.length; i += 100) {
    chunks.push(rawgIds.slice(i, i + 100));
  }

  for (const chunk of chunks) {
    const response = await notion.dataSources.query({
      data_source_id: databaseId,
      filter: {
        or: chunk.map((id) => ({
          property: "RAWG ID",
          number: { equals: id },
        })),
      },
    });

    for (const page of response.results) {
      if ("properties" in page) {
        const prop = page.properties["RAWG ID"];
        if (prop && prop.type === "number" && typeof prop.number === "number") {
          existingIds.add(prop.number);
        }
      }
    }
  }

  return existingIds;
}

export async function addGameToNotion(
  game: RawgGameDetail
): Promise<void> {
  const notion = getNotionClient();
  const databaseId = getDatabaseId();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const properties: any = {
    Name: {
      title: [{ text: { content: game.name } }],
    },
    "RAWG ID": {
      number: game.id,
    },
    Platform: {
      multi_select: (game.platforms || []).map((p) => ({
        name: p.platform.name,
      })),
    },
    Genre: {
      multi_select: (game.genres || []).map((g) => ({ name: g.name })),
    },
    Publisher: {
      rich_text: [
        {
          text: {
            content: (game.publishers || [])
              .map((p) => p.name)
              .join(", "),
          },
        },
      ],
    },
    "Release Date": game.released
      ? { date: { start: game.released } }
      : { date: null },
    Metacritic: {
      number: game.metacritic ?? null,
    },
    "Cover Image": {
      url: game.background_image,
    },
    Status: {
      select: { name: "Backlog" },
    },
    "RAWG URL": {
      url: `https://rawg.io/games/${game.slug}`,
    },
    Rating: {
      number: game.rating,
    },
    "Added Date": {
      date: { start: new Date().toISOString().split("T")[0] },
    },
  };

  await notion.pages.create({
    parent: { database_id: databaseId },
    cover: game.background_image
      ? { type: "external" as const, external: { url: game.background_image } }
      : undefined,
    properties,
  });
}
