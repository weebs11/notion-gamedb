"use client";

import { useState, useEffect, useCallback } from "react";
import type {
  RawgGameListItem,
  RawgPlatform,
  FilterOptions,
  FilterValues,
  ConsoleBrowseFilters,
  AppMode,
  AddGamesResponse,
} from "@/lib/types";
import ModeTabs from "@/components/ModeTabs";
import SearchFilters from "@/components/SearchFilters";
import ConsolePicker from "@/components/ConsolePicker";
import BrowseFilters from "@/components/BrowseFilters";
import GameResults from "@/components/GameResults";
import Pagination from "@/components/Pagination";
import StatusMessage, { type StatusMessageData } from "@/components/StatusMessage";

const SEARCH_PAGE_SIZE = 20;
const BROWSE_PAGE_SIZE = 100;

export default function Home() {
  // Shared state
  const [filterOptions, setFilterOptions] = useState<FilterOptions>({
    platforms: [],
    genres: [],
  });
  const [games, setGames] = useState<RawgGameListItem[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitProgress, setSubmitProgress] = useState("");
  const [message, setMessage] = useState<StatusMessageData | null>(null);

  // Search mode state
  const [mode, setMode] = useState<AppMode>("search");
  const [hasSearched, setHasSearched] = useState(false);
  const [lastFilters, setLastFilters] = useState<FilterValues | null>(null);

  // Browse mode state
  const [browsePlatform, setBrowsePlatform] = useState<RawgPlatform | null>(null);
  const [browseFilters, setBrowseFilters] = useState<ConsoleBrowseFilters | null>(null);
  const [excludedIds, setExcludedIds] = useState<Set<number>>(new Set());
  const [hasBrowsed, setHasBrowsed] = useState(false);

  // Load filter options on mount
  useEffect(() => {
    fetch("/api/filters")
      .then((r) => r.json())
      .then((data) => {
        if (!data.error) setFilterOptions(data);
      })
      .catch(() => {
        setMessage({
          type: "error",
          text: "Failed to load filter options. RAWG API key may be missing.",
        });
      });
  }, []);

  // --- Mode switching ---

  function handleModeChange(newMode: AppMode) {
    if (newMode === mode) return;
    setMode(newMode);
    setGames([]);
    setSelectedIds(new Set());
    setPage(1);
    setTotalCount(0);
    setMessage(null);
    setLoading(false);
    // Reset mode-specific state
    if (newMode === "search") {
      setHasSearched(false);
      setLastFilters(null);
    } else {
      setBrowsePlatform(null);
      setBrowseFilters(null);
      setExcludedIds(new Set());
      setHasBrowsed(false);
    }
  }

  // --- Search mode ---

  const doSearch = useCallback(async (filters: FilterValues, pageNum: number) => {
    setLoading(true);
    setHasSearched(true);

    const params = new URLSearchParams();
    if (filters.search) params.set("search", filters.search);
    if (filters.platforms.length > 0)
      params.set("platforms", filters.platforms.join(","));
    if (filters.genres.length > 0)
      params.set("genres", filters.genres.join(","));
    if (filters.yearFrom || filters.yearTo) {
      const from = filters.yearFrom
        ? `${filters.yearFrom}-01-01`
        : "1970-01-01";
      const to = filters.yearTo ? `${filters.yearTo}-12-31` : "2030-12-31";
      params.set("dates", `${from},${to}`);
    }
    if (filters.ordering) params.set("ordering", filters.ordering);
    params.set("page", String(pageNum));
    params.set("page_size", String(SEARCH_PAGE_SIZE));

    try {
      const res = await fetch(`/api/search?${params.toString()}`);
      const data = await res.json();

      if (data.error) {
        setMessage({ type: "error", text: data.error });
        setGames([]);
        setTotalCount(0);
      } else {
        setGames(data.results);
        setTotalCount(data.count);
        setPage(pageNum);
        setSelectedIds(new Set());
      }
    } catch {
      setMessage({ type: "error", text: "Search failed. Please try again." });
    } finally {
      setLoading(false);
    }
  }, []);

  function handleSearch(filters: FilterValues) {
    setLastFilters(filters);
    doSearch(filters, 1);
  }

  function handleSearchPageChange(newPage: number) {
    if (lastFilters) {
      doSearch(lastFilters, newPage);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }

  // --- Browse mode ---

  const doBrowse = useCallback(
    async (platform: RawgPlatform, filters: ConsoleBrowseFilters, pageNum: number) => {
      setLoading(true);
      setHasBrowsed(true);

      const params = new URLSearchParams();
      params.set("platform", String(platform.id));
      if (filters.genres.length > 0)
        params.set("genres", filters.genres.join(","));
      if (filters.yearFrom || filters.yearTo) {
        const from = filters.yearFrom
          ? `${filters.yearFrom}-01-01`
          : "1970-01-01";
        const to = filters.yearTo ? `${filters.yearTo}-12-31` : "2030-12-31";
        params.set("dates", `${from},${to}`);
      }
      if (filters.ordering) params.set("ordering", filters.ordering);
      params.set("page", String(pageNum));

      try {
        const res = await fetch(`/api/browse?${params.toString()}`);
        const data = await res.json();

        if (data.error) {
          setMessage({ type: "error", text: data.error });
          setGames([]);
          setTotalCount(0);
        } else {
          setGames(data.results);
          setTotalCount(data.count);
          setPage(pageNum);
          // Auto-select all games except those in excludedIds
          const pageIds: number[] = data.results.map((g: RawgGameListItem) => g.id);
          const autoSelected = new Set<number>(
            pageIds.filter((id) => !excludedIds.has(id))
          );
          setSelectedIds(autoSelected);
        }
      } catch {
        setMessage({ type: "error", text: "Failed to load games. Please try again." });
      } finally {
        setLoading(false);
      }
    },
    [excludedIds]
  );

  function handleConsoleSelect(platform: RawgPlatform) {
    setBrowsePlatform(platform);
    const defaultFilters: ConsoleBrowseFilters = {
      genres: [],
      yearFrom: "",
      yearTo: "",
      ordering: "-metacritic",
    };
    setBrowseFilters(defaultFilters);
    setExcludedIds(new Set());
    doBrowse(platform, defaultFilters, 1);
  }

  function handleBrowseFilter(filters: ConsoleBrowseFilters) {
    if (!browsePlatform) return;
    setBrowseFilters(filters);
    setExcludedIds(new Set());
    doBrowse(browsePlatform, filters, 1);
  }

  function handleBrowsePageChange(newPage: number) {
    if (browsePlatform && browseFilters) {
      doBrowse(browsePlatform, browseFilters, newPage);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }

  function handleChangePlatform() {
    setBrowsePlatform(null);
    setBrowseFilters(null);
    setGames([]);
    setSelectedIds(new Set());
    setExcludedIds(new Set());
    setTotalCount(0);
    setPage(1);
    setHasBrowsed(false);
  }

  // --- Shared selection logic ---

  function toggleGame(id: number) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
    if (mode === "browse") {
      setExcludedIds((prev) => {
        const next = new Set(prev);
        if (next.has(id)) next.delete(id);
        else next.add(id);
        return next;
      });
    }
  }

  function selectAll() {
    if (mode === "search") {
      setSelectedIds(new Set(games.map((g) => g.id)));
    } else {
      // Browse: select all on current page (remove from excluded)
      const pageIds = games.map((g) => g.id);
      setSelectedIds((prev) => {
        const next = new Set(prev);
        pageIds.forEach((id) => next.add(id));
        return next;
      });
      setExcludedIds((prev) => {
        const next = new Set(prev);
        pageIds.forEach((id) => next.delete(id));
        return next;
      });
    }
  }

  function deselectAll() {
    if (mode === "search") {
      setSelectedIds(new Set());
    } else {
      // Browse: deselect all on current page (add to excluded)
      const pageIds = games.map((g) => g.id);
      setSelectedIds((prev) => {
        const next = new Set(prev);
        pageIds.forEach((id) => next.delete(id));
        return next;
      });
      setExcludedIds((prev) => {
        const next = new Set(prev);
        pageIds.forEach((id) => next.add(id));
        return next;
      });
    }
  }

  // --- Add to Notion (with chunking for large selections) ---

  async function addToNotion() {
    if (selectedIds.size === 0) return;
    setSubmitting(true);
    setMessage(null);
    setSubmitProgress("");

    const allIds = Array.from(selectedIds);
    const CHUNK_SIZE = 10;

    const aggregated: AddGamesResponse = {
      added: [],
      duplicates: [],
      errors: [],
    };

    try {
      if (allIds.length <= CHUNK_SIZE) {
        // Small batch — single request
        const res = await fetch("/api/notion", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ gameIds: allIds }),
        });
        const data: AddGamesResponse = await res.json();
        aggregated.added = data.added;
        aggregated.duplicates = data.duplicates;
        aggregated.errors = data.errors;
      } else {
        // Chunked submission
        for (let i = 0; i < allIds.length; i += CHUNK_SIZE) {
          const chunk = allIds.slice(i, i + CHUNK_SIZE);
          setSubmitProgress(`Adding ${i + 1}–${Math.min(i + chunk.length, allIds.length)} of ${allIds.length}...`);

          const res = await fetch("/api/notion", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ gameIds: chunk }),
          });
          const data: AddGamesResponse = await res.json();

          aggregated.added.push(...data.added);
          aggregated.duplicates.push(...data.duplicates);
          aggregated.errors.push(...data.errors);
        }
      }

      const parts: string[] = [];
      const details: string[] = [];

      if (aggregated.added.length > 0) {
        parts.push(`Added ${aggregated.added.length} game(s)`);
      }
      if (aggregated.duplicates.length > 0) {
        parts.push(`${aggregated.duplicates.length} duplicate(s) skipped`);
        details.push(
          ...aggregated.duplicates.map((d) => `Already exists: ${d.name}`)
        );
      }
      if (aggregated.errors.length > 0) {
        parts.push(`${aggregated.errors.length} error(s)`);
        details.push(...aggregated.errors.map((e) => `Failed: ${e.name}`));
      }

      setMessage({
        type: aggregated.errors.length > 0 ? "error" : aggregated.added.length > 0 ? "success" : "info",
        text: parts.join(". ") + ".",
        details: details.length > 0 ? details : undefined,
      });

      setSelectedIds(new Set());
    } catch {
      setMessage({
        type: "error",
        text: "Failed to add games to Notion. Please try again.",
      });
    } finally {
      setSubmitting(false);
      setSubmitProgress("");
    }
  }

  // --- Computed values ---

  const pageSize = mode === "search" ? SEARCH_PAGE_SIZE : BROWSE_PAGE_SIZE;
  const totalPages = Math.ceil(totalCount / pageSize);
  const dismissMessage = useCallback(() => setMessage(null), []);
  const showResults =
    mode === "search" ? hasSearched : hasBrowsed && browsePlatform !== null;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-gray-100">GameDB</h1>
        <p className="text-gray-400 mt-1">
          Search games and add them to your Notion backlog
        </p>
      </header>

      <StatusMessage message={message} onDismiss={dismissMessage} />

      <ModeTabs mode={mode} onModeChange={handleModeChange} />

      {mode === "search" ? (
        <section className="mb-8">
          <SearchFilters
            filterOptions={filterOptions}
            onSearch={handleSearch}
            loading={loading}
          />
        </section>
      ) : (
        <section className="mb-8">
          {!browsePlatform ? (
            <ConsolePicker
              platforms={filterOptions.platforms}
              onSelect={handleConsoleSelect}
            />
          ) : (
            <BrowseFilters
              platform={browsePlatform}
              genres={filterOptions.genres}
              onApply={handleBrowseFilter}
              onChangePlatform={handleChangePlatform}
              loading={loading}
            />
          )}
        </section>
      )}

      {showResults && (
        <section>
          <GameResults
            games={games}
            selectedIds={selectedIds}
            onToggle={toggleGame}
            onSelectAll={selectAll}
            onDeselectAll={deselectAll}
          />
          <Pagination
            page={page}
            totalPages={totalPages}
            count={totalCount}
            onPageChange={
              mode === "search" ? handleSearchPageChange : handleBrowsePageChange
            }
            loading={loading}
          />
        </section>
      )}

      {/* Floating action bar */}
      {selectedIds.size > 0 && (
        <div className="fixed bottom-0 left-0 right-0 bg-gray-900/95 border-t border-gray-700 p-4 backdrop-blur-sm">
          <div className="max-w-4xl mx-auto flex items-center justify-between">
            <span className="text-gray-300">
              {submitting && submitProgress
                ? submitProgress
                : `${selectedIds.size} game(s) selected`}
            </span>
            <button
              onClick={addToNotion}
              disabled={submitting}
              className="px-6 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-700 disabled:text-gray-500 rounded-lg font-medium transition-colors"
            >
              {submitting ? "Adding..." : "Add to Notion"}
            </button>
          </div>
        </div>
      )}

      <footer className="mt-12 pb-20 text-center text-xs text-gray-600">
        Game data provided by{" "}
        <a
          href="https://rawg.io/"
          target="_blank"
          rel="noopener noreferrer"
          className="text-gray-500 hover:text-gray-400"
        >
          RAWG.io
        </a>
      </footer>
    </div>
  );
}
