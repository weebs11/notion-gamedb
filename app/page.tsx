"use client";

import { useState, useEffect, useCallback } from "react";
import type {
  RawgGameListItem,
  FilterOptions,
  FilterValues,
  AddGamesResponse,
} from "@/lib/types";
import SearchFilters from "@/components/SearchFilters";
import GameResults from "@/components/GameResults";
import Pagination from "@/components/Pagination";
import StatusMessage, { type StatusMessageData } from "@/components/StatusMessage";

const PAGE_SIZE = 20;

export default function Home() {
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
  const [message, setMessage] = useState<StatusMessageData | null>(null);
  const [hasSearched, setHasSearched] = useState(false);
  const [lastFilters, setLastFilters] = useState<FilterValues | null>(null);

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
    params.set("page_size", String(PAGE_SIZE));

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

  function handlePageChange(newPage: number) {
    if (lastFilters) {
      doSearch(lastFilters, newPage);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }

  function toggleGame(id: number) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function selectAll() {
    setSelectedIds(new Set(games.map((g) => g.id)));
  }

  function deselectAll() {
    setSelectedIds(new Set());
  }

  async function addToNotion() {
    if (selectedIds.size === 0) return;
    setSubmitting(true);
    setMessage(null);

    try {
      const res = await fetch("/api/notion", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ gameIds: Array.from(selectedIds) }),
      });
      const data: AddGamesResponse = await res.json();

      const parts: string[] = [];
      const details: string[] = [];

      if (data.added.length > 0) {
        parts.push(`Added ${data.added.length} game(s)`);
      }
      if (data.duplicates.length > 0) {
        parts.push(`${data.duplicates.length} duplicate(s) skipped`);
        details.push(
          ...data.duplicates.map((d) => `Already exists: ${d.name}`)
        );
      }
      if (data.errors.length > 0) {
        parts.push(`${data.errors.length} error(s)`);
        details.push(...data.errors.map((e) => `Failed: ${e.name}`));
      }

      setMessage({
        type: data.errors.length > 0 ? "error" : data.added.length > 0 ? "success" : "info",
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
    }
  }

  const totalPages = Math.ceil(totalCount / PAGE_SIZE);
  const dismissMessage = useCallback(() => setMessage(null), []);

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-gray-100">GameDB</h1>
        <p className="text-gray-400 mt-1">
          Search games and add them to your Notion backlog
        </p>
      </header>

      <StatusMessage message={message} onDismiss={dismissMessage} />

      <section className="mb-8">
        <SearchFilters
          filterOptions={filterOptions}
          onSearch={handleSearch}
          loading={loading}
        />
      </section>

      {hasSearched && (
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
            onPageChange={handlePageChange}
            loading={loading}
          />
        </section>
      )}

      {/* Floating action bar */}
      {selectedIds.size > 0 && (
        <div className="fixed bottom-0 left-0 right-0 bg-gray-900/95 border-t border-gray-700 p-4 backdrop-blur-sm">
          <div className="max-w-4xl mx-auto flex items-center justify-between">
            <span className="text-gray-300">
              {selectedIds.size} game(s) selected
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
