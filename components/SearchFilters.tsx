"use client";

import { useState } from "react";
import type { FilterOptions, FilterValues } from "@/lib/types";

interface SearchFiltersProps {
  filterOptions: FilterOptions;
  onSearch: (filters: FilterValues) => void;
  loading: boolean;
}

const ORDERING_OPTIONS = [
  { value: "", label: "Relevance" },
  { value: "-metacritic", label: "Metacritic (High → Low)" },
  { value: "-rating", label: "Rating (High → Low)" },
  { value: "-released", label: "Release Date (Newest)" },
  { value: "released", label: "Release Date (Oldest)" },
  { value: "name", label: "Name A→Z" },
  { value: "-name", label: "Name Z→A" },
];

export default function SearchFilters({
  filterOptions,
  onSearch,
  loading,
}: SearchFiltersProps) {
  const [search, setSearch] = useState("");
  const [selectedPlatforms, setSelectedPlatforms] = useState<number[]>([]);
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
  const [publisher, setPublisher] = useState("");
  const [yearFrom, setYearFrom] = useState("");
  const [yearTo, setYearTo] = useState("");
  const [ordering, setOrdering] = useState("");
  const [showPlatforms, setShowPlatforms] = useState(false);
  const [showGenres, setShowGenres] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onSearch({
      search,
      platforms: selectedPlatforms,
      genres: selectedGenres,
      publisher,
      yearFrom,
      yearTo,
      ordering,
    });
  }

  function togglePlatform(id: number) {
    setSelectedPlatforms((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]
    );
  }

  function toggleGenre(slug: string) {
    setSelectedGenres((prev) =>
      prev.includes(slug) ? prev.filter((g) => g !== slug) : [...prev, slug]
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Search input */}
      <div>
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search games..."
          className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-gray-100 placeholder-gray-500 focus:outline-none focus:border-blue-500"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Platform selector */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setShowPlatforms(!showPlatforms)}
            className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-left text-gray-300 hover:border-gray-600"
          >
            {selectedPlatforms.length > 0
              ? `${selectedPlatforms.length} platform(s)`
              : "All Platforms"}
            <span className="float-right">▾</span>
          </button>
          {showPlatforms && (
            <div className="absolute z-10 mt-1 w-full max-h-60 overflow-y-auto bg-gray-800 border border-gray-700 rounded-lg shadow-lg">
              {filterOptions.platforms.map((p) => (
                <label
                  key={p.id}
                  className="flex items-center px-3 py-1.5 hover:bg-gray-700 cursor-pointer text-sm"
                >
                  <input
                    type="checkbox"
                    checked={selectedPlatforms.includes(p.id)}
                    onChange={() => togglePlatform(p.id)}
                    className="mr-2"
                  />
                  {p.name}
                </label>
              ))}
            </div>
          )}
        </div>

        {/* Genre selector */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setShowGenres(!showGenres)}
            className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-left text-gray-300 hover:border-gray-600"
          >
            {selectedGenres.length > 0
              ? `${selectedGenres.length} genre(s)`
              : "All Genres"}
            <span className="float-right">▾</span>
          </button>
          {showGenres && (
            <div className="absolute z-10 mt-1 w-full max-h-60 overflow-y-auto bg-gray-800 border border-gray-700 rounded-lg shadow-lg">
              {filterOptions.genres.map((g) => (
                <label
                  key={g.id}
                  className="flex items-center px-3 py-1.5 hover:bg-gray-700 cursor-pointer text-sm"
                >
                  <input
                    type="checkbox"
                    checked={selectedGenres.includes(g.slug)}
                    onChange={() => toggleGenre(g.slug)}
                    className="mr-2"
                  />
                  {g.name}
                </label>
              ))}
            </div>
          )}
        </div>

        {/* Publisher text input */}
        <div>
          <input
            type="text"
            value={publisher}
            onChange={(e) => setPublisher(e.target.value)}
            placeholder="Publisher..."
            className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-gray-100 placeholder-gray-500 focus:outline-none focus:border-blue-500"
          />
        </div>

        {/* Sort order */}
        <div>
          <select
            value={ordering}
            onChange={(e) => setOrdering(e.target.value)}
            className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-gray-300 focus:outline-none focus:border-blue-500"
          >
            {ORDERING_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Year range */}
      <div className="flex items-center gap-3">
        <label className="text-sm text-gray-400">Year:</label>
        <input
          type="number"
          value={yearFrom}
          onChange={(e) => setYearFrom(e.target.value)}
          placeholder="From"
          min="1970"
          max="2030"
          className="w-24 px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-gray-100 placeholder-gray-500 focus:outline-none focus:border-blue-500 text-sm"
        />
        <span className="text-gray-500">–</span>
        <input
          type="number"
          value={yearTo}
          onChange={(e) => setYearTo(e.target.value)}
          placeholder="To"
          min="1970"
          max="2030"
          className="w-24 px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-gray-100 placeholder-gray-500 focus:outline-none focus:border-blue-500 text-sm"
        />

        <div className="ml-auto">
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 disabled:text-gray-500 rounded-lg font-medium transition-colors"
          >
            {loading ? "Searching..." : "Search"}
          </button>
        </div>
      </div>
    </form>
  );
}
