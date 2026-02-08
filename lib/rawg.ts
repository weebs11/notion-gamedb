import type {
  RawgPlatform,
  RawgGenre,
  RawgGameListItem,
  RawgGameDetail,
  RawgPaginatedResponse,
} from "./types";

const RAWG_BASE_URL = "https://api.rawg.io/api";

function getApiKey(): string {
  const key = process.env.RAWG_API_KEY;
  if (!key) throw new Error("RAWG_API_KEY is not set");
  return key;
}

async function fetchWithTimeout(
  url: string,
  timeoutMs = 10000
): Promise<Response> {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(url, { signal: controller.signal });
    if (!response.ok) {
      throw new Error(`RAWG API error: ${response.status} ${response.statusText}`);
    }
    return response;
  } finally {
    clearTimeout(id);
  }
}

export async function fetchPlatforms(): Promise<RawgPlatform[]> {
  const key = getApiKey();
  // Use "parent" platforms for cleaner grouping (e.g. "PlayStation" instead of PS1/PS2/PS3/PS4/PS5 separately)
  // Then also fetch detailed platforms for filtering
  const url = `${RAWG_BASE_URL}/platforms?key=${key}&page_size=50&ordering=name`;
  const response = await fetchWithTimeout(url);
  const data: RawgPaginatedResponse<RawgPlatform> =
    await response.json();
  return data.results;
}

export async function fetchGenres(): Promise<RawgGenre[]> {
  const key = getApiKey();
  const url = `${RAWG_BASE_URL}/genres?key=${key}`;
  const response = await fetchWithTimeout(url);
  const data: RawgPaginatedResponse<RawgGenre> = await response.json();
  return data.results;
}

export interface SearchParams {
  search?: string;
  platforms?: string;
  genres?: string;
  publishers?: string;
  dates?: string;
  page?: string;
  page_size?: string;
  ordering?: string;
}

export async function searchGames(
  params: SearchParams
): Promise<RawgPaginatedResponse<RawgGameListItem>> {
  const key = getApiKey();
  const query = new URLSearchParams({ key });

  if (params.search) query.set("search", params.search);
  if (params.platforms) query.set("platforms", params.platforms);
  if (params.genres) query.set("genres", params.genres);
  if (params.dates) query.set("dates", params.dates);
  if (params.ordering) query.set("ordering", params.ordering);
  if (params.page) query.set("page", params.page);
  query.set("page_size", params.page_size || "20");

  const url = `${RAWG_BASE_URL}/games?${query.toString()}`;
  const response = await fetchWithTimeout(url, 15000);
  return response.json();
}

export async function getGameDetails(
  gameId: number
): Promise<RawgGameDetail> {
  const key = getApiKey();
  const url = `${RAWG_BASE_URL}/games/${gameId}?key=${key}`;
  const response = await fetchWithTimeout(url);
  return response.json();
}
