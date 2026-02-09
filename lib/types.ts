// RAWG API types

export interface RawgPlatform {
  id: number;
  name: string;
  slug: string;
}

export interface RawgGenre {
  id: number;
  name: string;
  slug: string;
}

export interface RawgPublisher {
  id: number;
  name: string;
  slug: string;
}

export interface RawgGameListItem {
  id: number;
  slug: string;
  name: string;
  released: string | null;
  rating: number;
  metacritic: number | null;
  platforms: Array<{ platform: { id: number; name: string } }> | null;
  genres: Array<{ id: number; name: string; slug: string }> | null;
}

export interface RawgGameDetail extends RawgGameListItem {
  background_image: string | null;
  publishers: Array<{ id: number; name: string; slug: string }> | null;
  description_raw?: string;
}

export interface RawgPaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

// Filter types

export interface FilterOptions {
  platforms: RawgPlatform[];
  genres: RawgGenre[];
}

export interface FilterValues {
  search: string;
  platforms: number[];
  genres: string[];
  publisher: string;
  yearFrom: string;
  yearTo: string;
  ordering: string;
}

// App mode

export type AppMode = "search" | "browse";

export interface ConsoleBrowseFilters {
  genres: string[];
  yearFrom: string;
  yearTo: string;
  ordering: string;
}

// API response types

export interface AddGamesRequest {
  gameIds: number[];
}

export interface AddGamesResponse {
  added: Array<{ id: number; name: string }>;
  duplicates: Array<{ id: number; name: string }>;
  errors: Array<{ id: number; name: string; error: string }>;
}
